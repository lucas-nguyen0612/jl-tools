-- Fix "Again" (rating=0) so the card re-appears in the same session.
-- Previously v_interval := 1 pushed due_at 1 day into the future, and
-- the due-query `.lte('due_at', now)` would skip it until tomorrow.
-- Standard SM-2 treats Again as a learning step (~10 min relearn).

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
  v_xp_amounts integer[] := array[0, 1, 2, 3];
begin
  select * into v_card from flashcard_cards where id = p_card_id and user_id = p_user_id for update;
  if not found then raise exception 'Card not found'; end if;

  v_ease := v_card.ease_factor;
  v_interval := v_card.interval;
  v_reps := v_card.repetitions;
  v_xp := v_xp_amounts[p_rating + 1];

  if p_rating = 0 then
    v_reps := 0; v_interval := 0;
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

  if p_rating = 0 then
    v_due_at := now() + interval '10 minutes';
  else
    v_due_at := now() + (v_interval || ' days')::interval;
  end if;

  insert into flashcard_reviews (card_id, user_id, deck_id, rating, ease_factor_before, interval_before, ease_factor_after, interval_after, xp_awarded)
  values (p_card_id, p_user_id, v_card.deck_id, p_rating, v_card.ease_factor, v_card.interval, v_ease, v_interval, v_xp);

  update flashcard_cards
  set ease_factor = v_ease, interval = v_interval, repetitions = v_reps,
      due_at = v_due_at, state = v_new_state
  where id = p_card_id;

  update character_stats set total_cards_reviewed = total_cards_reviewed + 1 where user_id = p_user_id;

  if v_xp > 0 then
    perform award_xp(p_user_id, v_xp, 'flashcard', p_card_id,
      'Flashcard review: ' || case p_rating when 1 then 'Hard' when 2 then 'Good' when 3 then 'Easy' end);
  end if;

  return query select v_xp, v_interval, v_ease, false::boolean;
end;
$$;

-- One-time backfill: cards whose most recent review was "Again" (rating=0)
-- are currently stuck 1 day in the future. Pull them back to due now so
-- the user sees them in the current session.
with latest_review as (
  select distinct on (card_id) card_id, rating, reviewed_at
  from flashcard_reviews
  order by card_id, reviewed_at desc
)
update flashcard_cards c
set due_at = now(), interval = 0
from latest_review lr
where lr.card_id = c.id
  and lr.rating = 0
  and c.state = 'learning'
  and c.due_at > now();
