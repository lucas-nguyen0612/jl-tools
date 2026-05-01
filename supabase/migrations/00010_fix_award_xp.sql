-- ============================================================
-- FIX: award_xp function crashes when character_stats row missing
-- Habit completions were rolling back due to this exception.
-- Also adds INSERT policy for xp_transactions so app code can
-- award the all-done bonus that the trigger does not handle.
-- ============================================================

-- Backfill character_stats for any existing users that lack a row
insert into character_stats (user_id)
select id from auth.users
where id not in (select user_id from character_stats)
on conflict (user_id) do nothing;

-- Fix award_xp: replace the "raise exception" with a safe upsert
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
begin
  -- Ensure a stats row exists (handles users created before the stats table)
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

  update character_stats
  set total_xp = v_new_xp,
      xp_in_current_level = v_xp_in_level,
      level = v_new_level,
      last_activity_date = current_date
  where user_id = p_user_id;

  insert into xp_transactions (user_id, amount, source, source_id, description)
  values (p_user_id, p_amount, p_source, p_source_id, p_description);

  perform check_and_award_badges(p_user_id);

  return query select p_amount, v_leveled_up, v_new_level, v_old_level;
end;
$$;

-- Allow app code to insert XP transactions (needed for all-done bonus
-- which is not handled by the DB trigger)
create policy "Users can insert own XP transactions"
  on xp_transactions for insert
  with check (auth.uid() = user_id);
