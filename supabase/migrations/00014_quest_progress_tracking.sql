-- ============================================================
-- Quest progress tracking
-- Auto-updates user_quests.current_value on pomodoro/habit/flashcard events,
-- marks complete and awards XP when target is reached.
-- Also provides ensure_daily_quests() so new days auto-assign 3 quests.
-- ============================================================

-- ensure_daily_quests — idempotent assign of 3 daily quests for today.
-- Called from each activity trigger and exposed as RPC for dashboard load.
create or replace function ensure_daily_quests(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  if exists (
    select 1 from user_quests
    where user_id = p_user_id and assigned_date = current_date
  ) then
    return;
  end if;

  insert into user_quests (user_id, quest_id, assigned_date)
  select p_user_id, q.id, current_date
  from quests q
  where q.quest_type = 'daily' and q.is_active = true
  order by q.created_at
  limit 3;
end;
$$;

-- complete_quest — mark a user_quest complete and award its XP.
-- Guards against double-awarding.
create or replace function complete_quest(p_user_quest_id uuid)
returns void language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_quest_id uuid;
  v_name text;
  v_xp integer;
begin
  select uq.user_id, uq.quest_id, q.name, q.xp_reward
  into v_user_id, v_quest_id, v_name, v_xp
  from user_quests uq
  join quests q on q.id = uq.quest_id
  where uq.id = p_user_quest_id and uq.is_completed = false;

  if not found then return; end if;

  update user_quests
  set is_completed = true, completed_at = now()
  where id = p_user_quest_id;

  perform award_xp(v_user_id, v_xp, 'quest', v_quest_id, 'Quest complete: ' || v_name);
end;
$$;

-- ============================================================
-- Pomodoro trigger
-- daily_pomodoro_2: +1 per session
-- daily_focus_60:   +duration_minutes per session
-- ============================================================
create or replace function update_quest_on_pomodoro()
returns trigger language plpgsql security definer as $$
declare
  v_uq record;
  v_delta integer;
begin
  perform ensure_daily_quests(new.user_id);

  for v_uq in
    select uq.id, uq.current_value, q.slug, q.target_value
    from user_quests uq
    join quests q on q.id = uq.quest_id
    where uq.user_id = new.user_id
      and uq.assigned_date = current_date
      and uq.is_completed = false
      and q.tool = 'pomodoro'
  loop
    v_delta := case v_uq.slug
      when 'daily_focus_60' then new.duration_minutes
      else 1
    end;

    update user_quests
    set current_value = current_value + v_delta
    where id = v_uq.id;

    if v_uq.current_value + v_delta >= v_uq.target_value then
      perform complete_quest(v_uq.id);
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_pomodoro_session_quest on pomodoro_sessions;
create trigger trg_pomodoro_session_quest
  after insert on pomodoro_sessions
  for each row execute function update_quest_on_pomodoro();

-- ============================================================
-- Habit trigger
-- daily_habit_3:   +1 per check-in
-- daily_habit_all: complete when all non-archived habits done today
-- ============================================================
create or replace function update_quest_on_habit()
returns trigger language plpgsql security definer as $$
declare
  v_uq record;
  v_total_habits integer;
  v_completed_today integer;
begin
  perform ensure_daily_quests(new.user_id);

  for v_uq in
    select uq.id, uq.current_value, q.slug, q.target_value
    from user_quests uq
    join quests q on q.id = uq.quest_id
    where uq.user_id = new.user_id
      and uq.assigned_date = current_date
      and uq.is_completed = false
      and q.tool = 'habit'
  loop
    if v_uq.slug = 'daily_habit_all' then
      select count(*) into v_total_habits
      from habits
      where user_id = new.user_id and is_archived = false;

      select count(distinct habit_id) into v_completed_today
      from habit_completions
      where user_id = new.user_id and completed_date = current_date;

      if v_total_habits > 0 and v_completed_today >= v_total_habits then
        update user_quests set current_value = 1 where id = v_uq.id;
        perform complete_quest(v_uq.id);
      end if;
    else
      update user_quests
      set current_value = current_value + 1
      where id = v_uq.id;

      if v_uq.current_value + 1 >= v_uq.target_value then
        perform complete_quest(v_uq.id);
      end if;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_habit_completion_quest on habit_completions;
create trigger trg_habit_completion_quest
  after insert on habit_completions
  for each row execute function update_quest_on_habit();

-- ============================================================
-- Flashcard trigger
-- daily_flashcard_20, daily_flashcard_50: +1 per review with rating > 0
-- Rating 0 ("Again") skipped to match XP behavior and prevent gaming.
-- ============================================================
create or replace function update_quest_on_flashcard()
returns trigger language plpgsql security definer as $$
declare
  v_uq record;
begin
  if new.rating = 0 then return new; end if;

  perform ensure_daily_quests(new.user_id);

  for v_uq in
    select uq.id, uq.current_value, q.target_value
    from user_quests uq
    join quests q on q.id = uq.quest_id
    where uq.user_id = new.user_id
      and uq.assigned_date = current_date
      and uq.is_completed = false
      and q.tool = 'flashcard'
  loop
    update user_quests
    set current_value = current_value + 1
    where id = v_uq.id;

    if v_uq.current_value + 1 >= v_uq.target_value then
      perform complete_quest(v_uq.id);
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_flashcard_review_quest on flashcard_reviews;
create trigger trg_flashcard_review_quest
  after insert on flashcard_reviews
  for each row execute function update_quest_on_flashcard();
