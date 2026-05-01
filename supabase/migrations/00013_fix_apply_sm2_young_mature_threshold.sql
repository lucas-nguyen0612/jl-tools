-- Fix apply_sm2 state thresholds to match design: young < 21d, mature >= 21d.
-- Previous thresholds (interval <= 7 → young) were too aggressive and
-- misaligned with the UI labels "<21d" / "21d+".

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
  v_xp_amounts integer[] := array[0, 1, 2, 3];
begin
  select * into v_card from flashcard_cards where id = p_card_id and user_id = p_user_id for update;
  if not found then raise exception 'Card not found'; end if;

  v_ease := v_card.ease_factor;
  v_interval := v_card.interval;
  v_reps := v_card.repetitions;
  v_xp := v_xp_amounts[p_rating + 1];

  if p_rating = 0 then
    v_reps := 0; v_interval := 1;
  else
    if v_reps = 0 then v_interval := 1;
    elsif v_reps = 1 then v_interval := 6;
    else v_interval := round(v_interval * v_ease);
    end if;
    v_ease := greatest(1.3, v_ease + (0.1 - (3 - p_rating) * (0.08 + (3 - p_rating) * 0.02)));
    v_reps := v_reps + 1;
  end if;

  if v_interval <= 1 then v_new_state := 'learning';
  elsif v_interval < 21 then v_new_state := 'young';
  else v_new_state := 'mature';
  end if;

  insert into flashcard_reviews (card_id, user_id, deck_id, rating, ease_factor_before, interval_before, ease_factor_after, interval_after, xp_awarded)
  values (p_card_id, p_user_id, v_card.deck_id, p_rating, v_card.ease_factor, v_card.interval, v_ease, v_interval, v_xp);

  update flashcard_cards
  set ease_factor = v_ease, interval = v_interval, repetitions = v_reps,
      due_at = now() + (v_interval || ' days')::interval, state = v_new_state
  where id = p_card_id;

  update character_stats set total_cards_reviewed = total_cards_reviewed + 1 where user_id = p_user_id;

  if v_xp > 0 then
    perform award_xp(p_user_id, v_xp, 'flashcard', p_card_id,
      'Flashcard review: ' || case p_rating when 1 then 'Hard' when 2 then 'Good' when 3 then 'Easy' end);
  end if;

  return query select v_xp, v_interval, v_ease, false::boolean;
end;
$$;
