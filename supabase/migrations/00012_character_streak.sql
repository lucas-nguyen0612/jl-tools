-- ============================================================
-- Character-wide streak: update character_stats.current_streak
-- and longest_streak whenever XP is awarded (every activity goes
-- through award_xp). Also backfills existing users from history.
-- ============================================================

create or replace function award_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_source_id uuid,
  p_description text
)
returns table(xp_awarded integer, leveled_up boolean, new_level integer, old_level integer)
language plpgsql security definer as $$
declare
  v_stats character_stats%rowtype;
  v_old_level integer;
  v_new_xp integer;
  v_new_level integer;
  v_xp_in_level integer;
  v_leveled_up boolean := false;
  v_today date := current_date;
  v_new_streak integer;
  v_new_longest integer;
begin
  insert into character_stats (user_id) values (p_user_id) on conflict (user_id) do nothing;

  select * into v_stats from character_stats where user_id = p_user_id for update;
  if not found then
    return query select 0::integer, false::boolean, 1::integer, 1::integer;
    return;
  end if;

  v_old_level := v_stats.level;
  v_new_xp := v_stats.total_xp + p_amount;

  select level into v_new_level from level_thresholds
  where xp_required <= v_new_xp order by level desc limit 1;
  v_new_level := coalesce(v_new_level, 1);
  v_leveled_up := v_new_level > v_old_level;

  select coalesce(xp_required, 0) into v_xp_in_level from level_thresholds where level = v_new_level;
  v_xp_in_level := v_new_xp - v_xp_in_level;

  -- Compute character-wide streak based on last_activity_date vs today
  if v_stats.last_activity_date is null then
    v_new_streak := 1;
  elsif v_stats.last_activity_date = v_today then
    v_new_streak := greatest(v_stats.current_streak, 1);
  elsif v_stats.last_activity_date = v_today - 1 then
    v_new_streak := v_stats.current_streak + 1;
  else
    v_new_streak := 1;
  end if;
  v_new_longest := greatest(v_stats.longest_streak, v_new_streak);

  update character_stats
  set total_xp = v_new_xp,
      xp_in_current_level = v_xp_in_level,
      level = v_new_level,
      last_activity_date = v_today,
      current_streak = v_new_streak,
      longest_streak = v_new_longest
  where user_id = p_user_id;

  insert into xp_transactions (user_id, amount, source, source_id, description)
  values (p_user_id, p_amount, p_source, p_source_id, p_description);

  perform check_and_award_badges(p_user_id);

  return query select p_amount, v_leveled_up, v_new_level, v_old_level;
end;
$$;

-- ============================================================
-- Backfill: recompute current_streak / longest_streak / last_activity_date
-- for every user from union of their historical activity dates.
-- ============================================================

with activity_dates as (
  select user_id, (completed_at at time zone 'utc')::date as d from pomodoro_sessions
  union
  select user_id, completed_date as d from habit_completions
  union
  select user_id, (reviewed_at at time zone 'utc')::date as d from flashcard_reviews
),
distinct_dates as (
  select distinct user_id, d from activity_dates
),
numbered as (
  -- Subtracting the row-number (as days) from the date collapses each
  -- consecutive-day run to a single constant "group" value.
  select
    user_id,
    d,
    d - (row_number() over (partition by user_id order by d))::int as grp
  from distinct_dates
),
runs as (
  select user_id, grp, count(*)::int as run_len, max(d) as last_day
  from numbered
  group by user_id, grp
),
per_user as (
  select
    user_id,
    max(run_len) as longest_streak,
    max(last_day) as max_date,
    -- Current streak: run_len of the run whose last_day is today or yesterday;
    -- otherwise 0 (streak already broken).
    coalesce(
      max(run_len) filter (where last_day >= current_date - 1),
      0
    ) as current_streak
  from runs
  group by user_id
)
update character_stats cs
set current_streak = pu.current_streak,
    longest_streak = greatest(cs.longest_streak, pu.longest_streak),
    last_activity_date = pu.max_date
from per_user pu
where cs.user_id = pu.user_id;
