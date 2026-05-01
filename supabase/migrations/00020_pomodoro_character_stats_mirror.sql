-- ============================================================
-- 00020_pomodoro_character_stats_mirror.sql
--
-- WHAT
--   Adds a trigger on pomodoro_sessions that mirrors INSERT/UPDATE/DELETE
--   into character_stats.total_pomodoros and character_stats.total_focus_minutes,
--   then runs a one-time backfill so existing users see correct counts.
--
-- WHY (gap from review)
--   award_xp (00017) maintains total_xp / level / streak / last_activity_date,
--   but never touches total_pomodoros or total_focus_minutes. The Character
--   screen reads those columns and so showed 0 sessions / 0 focus minutes
--   even after weeks of completed Pomodoros. We also need the counters to
--   stay correct if a session row is deleted (data-drift concern raised in
--   review of the POST handler at app/api/pomodoro/sessions/route.ts).
--
--   We attach the logic to pomodoro_sessions itself rather than embedding
--   it in award_xp because award_xp is shared by other XP sources (habits,
--   flashcards, streak milestones) and should not gain Pomodoro-specific
--   counter side effects. The trigger is the source of truth.
--
-- SECURITY DEFINER
--   character_stats has only a SELECT RLS policy (see 00009), so a trigger
--   running as the invoking user cannot UPDATE it. This matches the pattern
--   used by update_streak() in 00009 (trigger on habit_completions that
--   updates character_stats). Owner-of-function is the postgres role at
--   migration time, which bypasses RLS — same as the surrounding triggers.
--
-- SAFE TO RERUN
--   Function uses CREATE OR REPLACE; trigger uses DROP IF EXISTS + CREATE;
--   backfill is an idempotent absolute-value UPDATE (recomputes from the
--   sessions aggregate, doesn't accumulate).
-- ============================================================

create or replace function sync_character_stats_from_pomodoro_session()
returns trigger language plpgsql security definer as $$
declare
  v_delta_minutes integer;
begin
  if (tg_op = 'INSERT') then
    update character_stats
       set total_pomodoros = total_pomodoros + 1,
           total_focus_minutes = total_focus_minutes + coalesce(new.duration_minutes, 0)
     where user_id = new.user_id;
    return new;

  elsif (tg_op = 'DELETE') then
    update character_stats
       set total_pomodoros = greatest(total_pomodoros - 1, 0),
           total_focus_minutes = greatest(total_focus_minutes - coalesce(old.duration_minutes, 0), 0)
     where user_id = old.user_id;
    return old;

  elsif (tg_op = 'UPDATE') then
    -- Only adjust when duration changed (and ignore null-vs-null no-ops).
    if coalesce(new.duration_minutes, 0) <> coalesce(old.duration_minutes, 0) then
      v_delta_minutes := coalesce(new.duration_minutes, 0) - coalesce(old.duration_minutes, 0);
      update character_stats
         set total_focus_minutes = greatest(total_focus_minutes + v_delta_minutes, 0)
       where user_id = new.user_id;
    end if;
    return new;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_pomodoro_session_mirror_stats on pomodoro_sessions;
create trigger trg_pomodoro_session_mirror_stats
  after insert or update or delete on pomodoro_sessions
  for each row execute function sync_character_stats_from_pomodoro_session();

-- ============================================================
-- BACKFILL
-- One-time recompute of total_pomodoros and total_focus_minutes from
-- existing pomodoro_sessions rows for every user that has a character_stats
-- row. Users with no sessions get 0/0 (ensures any prior drift is reset).
-- Idempotent: writes absolute values, not deltas.
-- ============================================================
with agg as (
  select user_id,
         count(*)::int as sessions,
         coalesce(sum(duration_minutes), 0)::int as minutes
    from pomodoro_sessions
   group by user_id
)
update character_stats cs
   set total_pomodoros = coalesce(a.sessions, 0),
       total_focus_minutes = coalesce(a.minutes, 0)
  from (
    select cs2.user_id,
           agg.sessions,
           agg.minutes
      from character_stats cs2
      left join agg on agg.user_id = cs2.user_id
  ) a
 where cs.user_id = a.user_id;
