-- Anki-style learning steps for apply_sm2.
-- Steps = [1m, 10m]. Graduating interval = 1d (Good), easy interval = 4d.
-- - Again   : reset to step 0, due +1m, state='learning' (lapse if was review).
-- - Hard    : repeat current step.
-- - Good    : advance one step; graduate after last step.
-- - Easy    : skip steps, graduate to 4d immediately.
-- In review state (young/mature), Hard/Good/Easy use standard SM-2.

alter table flashcard_cards
  add column if not exists learning_step integer not null default 0;

create or replace function apply_sm2(
  p_user_id uuid,
  p_card_id uuid,
  p_rating integer
)
returns table(xp_awarded integer, new_interval integer, new_ease_factor numeric, leveled_up boolean)
language plpgsql security definer as $$
declare
  v_card flashcard_cards%rowtype;
  v_ease numeric(4,2);
  v_interval integer;
  v_reps integer;
  v_xp integer;
  v_new_state text;
  v_due_at timestamptz;
  v_learning_step integer;
  v_steps_minutes integer[] := array[1, 10];
  v_last_step integer := array_length(v_steps_minutes, 1) - 1;
  v_graduating_interval integer := 1;
  v_easy_interval integer := 4;
  v_xp_amounts integer[] := array[0, 1, 2, 3];
  v_in_learning boolean;
begin
  select * into v_card from flashcard_cards where id = p_card_id and user_id = p_user_id for update;
  if not found then raise exception 'Card not found'; end if;

  v_ease := v_card.ease_factor;
  v_interval := v_card.interval;
  v_reps := v_card.repetitions;
  v_learning_step := v_card.learning_step;
  v_xp := v_xp_amounts[p_rating + 1];
  v_in_learning := v_card.state in ('new', 'learning');

  if p_rating = 0 then
    -- Again: reset to first learning step
    v_reps := 0;
    v_interval := 0;
    v_learning_step := 0;
    v_new_state := 'learning';
    v_due_at := now() + (v_steps_minutes[1] || ' minutes')::interval;
    if not v_in_learning then
      -- Lapse from review: reduce ease per SM-2
      v_ease := greatest(1.3, v_ease - 0.20);
    end if;

  elsif v_in_learning then
    if p_rating = 3 then
      -- Easy: graduate with easy interval
      v_interval := v_easy_interval;
      v_reps := greatest(v_reps, 1);
      v_learning_step := 0;
      v_new_state := case when v_interval < 21 then 'young' else 'mature' end;
      v_due_at := now() + (v_interval || ' days')::interval;

    elsif p_rating = 1 then
      -- Hard: repeat current step
      v_interval := 0;
      v_new_state := 'learning';
      v_due_at := now() + (v_steps_minutes[v_learning_step + 1] || ' minutes')::interval;

    else
      -- Good: advance one step, graduate if past last step
      if v_learning_step >= v_last_step then
        v_interval := v_graduating_interval;
        v_reps := greatest(v_reps, 1);
        v_learning_step := 0;
        v_new_state := case when v_interval < 21 then 'young' else 'mature' end;
        v_due_at := now() + (v_interval || ' days')::interval;
      else
        v_learning_step := v_learning_step + 1;
        v_interval := 0;
        v_new_state := 'learning';
        v_due_at := now() + (v_steps_minutes[v_learning_step + 1] || ' minutes')::interval;
      end if;
    end if;

  else
    -- Review state (young/mature): standard SM-2
    if v_reps = 0 then v_interval := 1;
    elsif v_reps = 1 then v_interval := 6;
    else v_interval := round(v_interval * v_ease);
    end if;
    v_ease := greatest(1.3, v_ease + (0.1 - (3 - p_rating) * (0.08 + (3 - p_rating) * 0.02)));
    v_reps := v_reps + 1;
    v_learning_step := 0;
    v_new_state := case when v_interval < 21 then 'young' else 'mature' end;
    v_due_at := now() + (v_interval || ' days')::interval;
  end if;

  insert into flashcard_reviews (card_id, user_id, deck_id, rating, ease_factor_before, interval_before, ease_factor_after, interval_after, xp_awarded)
  values (p_card_id, p_user_id, v_card.deck_id, p_rating, v_card.ease_factor, v_card.interval, v_ease, v_interval, v_xp);

  update flashcard_cards
  set ease_factor = v_ease,
      interval = v_interval,
      repetitions = v_reps,
      learning_step = v_learning_step,
      due_at = v_due_at,
      state = v_new_state
  where id = p_card_id;

  update character_stats set total_cards_reviewed = total_cards_reviewed + 1 where user_id = p_user_id;

  if v_xp > 0 then
    perform award_xp(p_user_id, v_xp, 'flashcard', p_card_id,
      'Flashcard review: ' || case p_rating when 1 then 'Hard' when 2 then 'Good' when 3 then 'Easy' end);
  end if;

  return query select v_xp, v_interval, v_ease, false::boolean;
end;
$$;
