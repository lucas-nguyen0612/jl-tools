-- ============================================================
-- 00009_sprint4_full_schema.sql
-- Adds all tables needed by Sprint 2-4 code.
-- The existing tables (profiles, pomo_sessions, habit_definitions,
-- habit_entries, gam_xp_transactions, gam_levels) remain untouched.
-- ============================================================

-- ============================================================
-- CHARACTER STATS
-- ============================================================
create table if not exists character_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null unique,
  level integer not null default 1 check (level between 1 and 50),
  total_xp integer not null default 0 check (total_xp >= 0),
  xp_in_current_level integer not null default 0 check (xp_in_current_level >= 0),
  focus_stat integer not null default 0 check (focus_stat between 0 and 100),
  discipline_stat integer not null default 0 check (discipline_stat between 0 and 100),
  knowledge_stat integer not null default 0 check (knowledge_stat between 0 and 100),
  endurance_stat integer not null default 0 check (endurance_stat between 0 and 100),
  total_pomodoros integer not null default 0,
  total_focus_minutes integer not null default 0,
  total_habits_completed integer not null default 0,
  total_cards_reviewed integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- POMODORO
-- ============================================================
create table if not exists pomodoro_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null unique,
  work_duration integer not null default 25 check (work_duration between 1 and 120),
  short_break integer not null default 5 check (short_break between 1 and 60),
  long_break integer not null default 15 check (long_break between 1 and 120),
  sessions_before_long_break integer not null default 4,
  auto_start_breaks boolean not null default false,
  auto_start_pomodoros boolean not null default false,
  soundscape text not null default 'none',
  soundscape_volume integer not null default 50 check (soundscape_volume between 0 and 100),
  focus_blocker_enabled boolean not null default false,
  blocked_sites text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pomodoro_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  estimated_pomodoros integer not null default 1 check (estimated_pomodoros between 1 and 20),
  completed_pomodoros integer not null default 0,
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pomodoro_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  task_id uuid references pomodoro_tasks on delete set null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_minutes integer not null,
  interruptions integer not null default 0,
  is_clean boolean not null default false,
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HABITS
-- ============================================================
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null default 'custom' check (category in ('health', 'learning', 'work', 'social', 'custom')),
  time_of_day text not null default 'anytime' check (time_of_day in ('morning', 'afternoon', 'evening', 'anytime')),
  color text not null default '#6366f1',
  target_days integer[] not null default '{1,2,3,4,5,6,7}',
  reminder_time time,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_date date,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists habit_completions (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique(habit_id, completed_date)
);

create table if not exists habit_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  note_date date not null,
  content text not null,
  mood integer check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, note_date)
);

-- ============================================================
-- FLASHCARD
-- ============================================================
create table if not exists flashcard_decks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  color text not null default '#6366f1',
  is_public boolean not null default false,
  card_count integer not null default 0,
  due_count integer not null default 0,
  new_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flashcard_cards (
  id uuid primary key default uuid_generate_v4(),
  deck_id uuid references flashcard_decks on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  front text not null,
  back text not null,
  tags text[] not null default '{}',
  ease_factor numeric(4,2) not null default 2.5 check (ease_factor >= 1.3),
  interval integer not null default 0,
  repetitions integer not null default 0,
  due_at timestamptz not null default now(),
  state text not null default 'new' check (state in ('new', 'learning', 'young', 'mature')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flashcard_reviews (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid references flashcard_cards on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  deck_id uuid references flashcard_decks on delete cascade not null,
  rating integer not null check (rating between 0 and 3),
  ease_factor_before numeric(4,2) not null,
  interval_before integer not null,
  ease_factor_after numeric(4,2) not null,
  interval_after integer not null,
  xp_awarded integer not null default 0,
  reviewed_at timestamptz not null default now()
);

-- ============================================================
-- GAMIFICATION
-- ============================================================
create table if not exists xp_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null check (amount > 0),
  source text not null check (source in ('pomodoro', 'habit', 'flashcard', 'quest', 'streak', 'bonus')),
  source_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null,
  icon text not null,
  rarity text not null default 'common' check (rarity in ('common', 'uncommon', 'rare', 'legendary', 'mythic')),
  condition_type text not null,
  condition_value integer not null,
  created_at timestamptz not null default now()
);

create table if not exists user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  badge_id uuid references badges on delete cascade not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

create table if not exists quests (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null,
  quest_type text not null check (quest_type in ('daily', 'weekly')),
  tool text not null check (tool in ('pomodoro', 'habit', 'flashcard', 'any')),
  target_value integer not null,
  xp_reward integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_quests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  quest_id uuid references quests on delete cascade not null,
  current_value integer not null default 0,
  is_completed boolean not null default false,
  assigned_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists unlockables (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null,
  unlock_type text not null check (unlock_type in ('level', 'badge', 'purchase')),
  unlock_value integer,
  category text not null check (category in ('soundscape', 'theme', 'avatar_frame')),
  created_at timestamptz not null default now()
);

create table if not exists user_unlockables (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  unlockable_id uuid references unlockables on delete cascade not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, unlockable_id)
);

create table if not exists level_thresholds (
  level integer primary key check (level between 1 and 50),
  xp_required integer not null check (xp_required >= 0),
  unlock_feature text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_pomodoro_sessions_user_created on pomodoro_sessions(user_id, created_at desc);
create index if not exists idx_habit_completions_user_date on habit_completions(user_id, completed_date desc);
create index if not exists idx_habit_completions_habit_date on habit_completions(habit_id, completed_date desc);
create index if not exists idx_flashcard_cards_deck_due on flashcard_cards(deck_id, due_at) where state != 'mature';
create index if not exists idx_flashcard_reviews_user_reviewed on flashcard_reviews(user_id, reviewed_at desc);
create index if not exists idx_xp_transactions_user_created on xp_transactions(user_id, created_at desc);
create index if not exists idx_user_quests_user_date on user_quests(user_id, assigned_date desc);

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table character_stats enable row level security;
alter table pomodoro_settings enable row level security;
alter table pomodoro_tasks enable row level security;
alter table pomodoro_sessions enable row level security;
alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table habit_notes enable row level security;
alter table flashcard_decks enable row level security;
alter table flashcard_cards enable row level security;
alter table flashcard_reviews enable row level security;
alter table xp_transactions enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table quests enable row level security;
alter table user_quests enable row level security;
alter table unlockables enable row level security;
alter table user_unlockables enable row level security;
alter table level_thresholds enable row level security;

create policy "Users can view own stats" on character_stats for select using (auth.uid() = user_id);
create policy "Users can manage own pomodoro settings" on pomodoro_settings for all using (auth.uid() = user_id);
create policy "Users can manage own tasks" on pomodoro_tasks for all using (auth.uid() = user_id);
create policy "Users can view own sessions" on pomodoro_sessions for select using (auth.uid() = user_id);
create policy "Users can manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users can view own completions" on habit_completions for select using (auth.uid() = user_id);
create policy "Users can insert own completions" on habit_completions for insert with check (auth.uid() = user_id);
create policy "Users can delete own completions" on habit_completions for delete using (auth.uid() = user_id);
create policy "Users can manage own notes" on habit_notes for all using (auth.uid() = user_id);
create policy "Users can manage own decks" on flashcard_decks for all using (auth.uid() = user_id);
create policy "Public decks are viewable" on flashcard_decks for select using (is_public = true);
create policy "Users can manage own cards" on flashcard_cards for all using (auth.uid() = user_id);
create policy "Users can view own reviews" on flashcard_reviews for select using (auth.uid() = user_id);
create policy "Users can view own XP transactions" on xp_transactions for select using (auth.uid() = user_id);
create policy "Badges are publicly viewable" on badges for select using (true);
create policy "Users can view own badges" on user_badges for select using (auth.uid() = user_id);
create policy "Quests are publicly viewable" on quests for select using (true);
create policy "Users can view own quests" on user_quests for select using (auth.uid() = user_id);
create policy "Unlockables are publicly viewable" on unlockables for select using (true);
create policy "Users can view own unlockables" on user_unlockables for select using (auth.uid() = user_id);
create policy "Level thresholds are publicly viewable" on level_thresholds for select using (true);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_character_stats_updated_at before update on character_stats
  for each row execute function update_updated_at();
create trigger trg_pomodoro_settings_updated_at before update on pomodoro_settings
  for each row execute function update_updated_at();
create trigger trg_pomodoro_tasks_updated_at before update on pomodoro_tasks
  for each row execute function update_updated_at();
create trigger trg_habits_updated_at before update on habits
  for each row execute function update_updated_at();
create trigger trg_habit_notes_updated_at before update on habit_notes
  for each row execute function update_updated_at();
create trigger trg_flashcard_decks_updated_at before update on flashcard_decks
  for each row execute function update_updated_at();
create trigger trg_flashcard_cards_updated_at before update on flashcard_cards
  for each row execute function update_updated_at();
create trigger trg_user_quests_updated_at before update on user_quests
  for each row execute function update_updated_at();

-- ============================================================
-- FUNCTION: check_and_award_badges
-- ============================================================
create or replace function check_and_award_badges(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_stats character_stats%rowtype;
  v_badge record;
begin
  select * into v_stats from character_stats where user_id = p_user_id;
  if not found then return; end if;

  for v_badge in
    select b.* from badges b
    where not exists (
      select 1 from user_badges ub where ub.user_id = p_user_id and ub.badge_id = b.id
    )
  loop
    case v_badge.condition_type
      when 'total_xp' then
        if v_stats.total_xp >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'level' then
        if v_stats.level >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'total_pomodoros' then
        if v_stats.total_pomodoros >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'longest_streak' then
        if v_stats.longest_streak >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'total_cards_reviewed' then
        if v_stats.total_cards_reviewed >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
    end case;
  end loop;
end;
$$;

-- ============================================================
-- FUNCTION: award_xp
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
begin
  select * into v_stats from character_stats where user_id = p_user_id for update;
  if not found then
    raise exception 'Character stats not found for user %', p_user_id;
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
  set total_xp = v_new_xp, xp_in_current_level = v_xp_in_level,
      level = v_new_level, last_activity_date = current_date
  where user_id = p_user_id;

  insert into xp_transactions (user_id, amount, source, source_id, description)
  values (p_user_id, p_amount, p_source, p_source_id, p_description);

  perform check_and_award_badges(p_user_id);

  return query select p_amount, v_leveled_up, v_new_level, v_old_level;
end;
$$;

-- ============================================================
-- FUNCTION: apply_sm2
-- ============================================================
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
  elsif v_interval <= 7 then v_new_state := 'young';
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

-- ============================================================
-- FUNCTION: update_streak (trigger on habit_completions)
-- ============================================================
create or replace function update_streak()
returns trigger language plpgsql security definer as $$
declare
  v_habit habits%rowtype;
  v_yesterday date;
  v_new_streak integer;
  v_milestone_xp integer := 0;
begin
  select * into v_habit from habits where id = new.habit_id for update;
  v_yesterday := new.completed_date - interval '1 day';

  if v_habit.last_completed_date = v_yesterday then
    v_new_streak := v_habit.current_streak + 1;
  elsif v_habit.last_completed_date = new.completed_date then
    return new;
  else
    v_new_streak := 1;
  end if;

  if v_new_streak = 7 then v_milestone_xp := 50;
  elsif v_new_streak = 14 then v_milestone_xp := 100;
  elsif v_new_streak = 30 then v_milestone_xp := 200;
  end if;

  update habits
  set current_streak = v_new_streak,
      longest_streak = greatest(longest_streak, v_new_streak),
      last_completed_date = new.completed_date
  where id = new.habit_id;

  update character_stats set total_habits_completed = total_habits_completed + 1 where user_id = new.user_id;

  perform award_xp(new.user_id, 5, 'habit', new.habit_id, 'Habit check-in: ' || v_habit.name);

  if v_milestone_xp > 0 then
    perform award_xp(new.user_id, v_milestone_xp, 'streak', new.habit_id,
      v_new_streak || '-day streak milestone: ' || v_habit.name);
  end if;

  return new;
end;
$$;

create trigger trg_habit_completion_streak
  after insert on habit_completions
  for each row execute function update_streak();

-- ============================================================
-- FUNCTION: on_auth_user_created (replace existing to init new tables)
-- ============================================================
drop trigger if exists trg_on_auth_user_created on auth.users;

create or replace function on_auth_user_created()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username, character_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'character_name', 'Adventurer')
  )
  on conflict (id) do nothing;

  insert into character_stats (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into pomodoro_settings (user_id) values (new.id) on conflict (user_id) do nothing;

  insert into user_quests (user_id, quest_id, assigned_date)
  select new.id, q.id, current_date
  from quests q
  where q.quest_type = 'daily' and q.is_active = true
  limit 3;

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function on_auth_user_created();

-- ============================================================
-- SEED: level_thresholds
-- ============================================================
insert into level_thresholds (level, xp_required, unlock_feature) values
(1, 0, null),(2, 300, null),(3, 700, null),(4, 1200, null),(5, 1500, 'dark_mode'),
(6, 2100, null),(7, 2800, null),(8, 3600, null),(9, 4500, null),(10, 5500, 'cafe_soundscape'),
(11, 6700, null),(12, 8000, null),(13, 9500, null),(14, 11000, null),(15, 12000, 'deep_forest_soundscape'),
(16, 14000, null),(17, 16000, null),(18, 18500, null),(19, 19800, null),(20, 21000, 'accent_color_picker'),
(21, 23500, null),(22, 26000, null),(23, 28500, null),(24, 31000, null),(25, 34000, null),
(26, 37000, null),(27, 40000, null),(28, 43000, null),(29, 45000, null),(30, 46500, 'legendary_avatar'),
(31, 50000, null),(32, 54000, null),(33, 58000, null),(34, 62000, null),(35, 66500, null),
(36, 71000, null),(37, 76000, null),(38, 81000, null),(39, 86500, null),(40, 92000, null),
(41, 98000, null),(42, 104500, null),(43, 111000, null),(44, 118000, null),(45, 120000, null),
(46, 122000, null),(47, 123500, null),(48, 125000, null),(49, 126500, null),(50, 127500, 'mythic_avatar')
on conflict (level) do nothing;

-- ============================================================
-- SEED: badges (20 badges)
-- ============================================================
insert into badges (slug, name, description, icon, rarity, condition_type, condition_value) values
('first_session', 'First Focus', 'Complete your first Pomodoro session', '🍅', 'common', 'total_pomodoros', 1),
('first_habit', 'Creature of Habit', 'Check in your first habit', '✅', 'common', 'total_habits_completed', 1),
('first_card', 'Card Collector', 'Review your first flashcard', '📇', 'common', 'total_cards_reviewed', 1),
('level_5', 'Rising Star', 'Reach level 5', '⭐', 'common', 'level', 5),
('pomodoro_10', 'Focus Apprentice', 'Complete 10 Pomodoro sessions', '🍅', 'uncommon', 'total_pomodoros', 10),
('streak_7', 'Week Warrior', 'Maintain a 7-day habit streak', '🔥', 'uncommon', 'longest_streak', 7),
('cards_50', 'Flashcard Fan', 'Review 50 flashcards', '📚', 'uncommon', 'total_cards_reviewed', 50),
('level_10', 'Apprentice Scholar', 'Reach level 10', '📖', 'uncommon', 'level', 10),
('xp_1000', 'XP Collector', 'Earn 1,000 total XP', '✨', 'uncommon', 'total_xp', 1000),
('pomodoro_50', 'Focus Journeyman', 'Complete 50 Pomodoro sessions', '⏰', 'rare', 'total_pomodoros', 50),
('streak_14', 'Fortnight Fighter', 'Maintain a 14-day habit streak', '🔥', 'rare', 'longest_streak', 14),
('cards_200', 'Memory Master', 'Review 200 flashcards', '🧠', 'rare', 'total_cards_reviewed', 200),
('level_15', 'Rare Achiever', 'Reach level 15', '💎', 'rare', 'level', 15),
('xp_10000', 'XP Hoarder', 'Earn 10,000 total XP', '💰', 'rare', 'total_xp', 10000),
('pomodoro_200', 'Focus Master', 'Complete 200 Pomodoro sessions', '🏆', 'legendary', 'total_pomodoros', 200),
('streak_30', 'Month Master', 'Maintain a 30-day habit streak', '🌟', 'legendary', 'longest_streak', 30),
('cards_1000', 'Knowledge Keeper', 'Review 1,000 flashcards', '📜', 'legendary', 'total_cards_reviewed', 1000),
('level_30', 'Legendary Scholar', 'Reach level 30', '👑', 'legendary', 'level', 30),
('level_50', 'Mythic Sage', 'Reach the maximum level 50', '🌌', 'mythic', 'level', 50),
('xp_100000', 'Century Scholar', 'Earn 100,000 total XP', '🌠', 'mythic', 'total_xp', 100000)
on conflict (slug) do nothing;

-- ============================================================
-- SEED: quests (9 quests)
-- ============================================================
insert into quests (slug, name, description, quest_type, tool, target_value, xp_reward) values
('daily_pomodoro_2', 'Deep Focus', 'Complete 2 Pomodoro sessions', 'daily', 'pomodoro', 2, 30),
('daily_flashcard_20', 'Quick Review', 'Review 20 flashcards', 'daily', 'flashcard', 20, 25),
('daily_habit_all', 'Perfect Day', 'Complete all your habits today', 'daily', 'habit', 1, 25),
('daily_focus_60', 'Hour of Power', 'Accumulate 60 minutes of focus time', 'daily', 'pomodoro', 60, 20),
('daily_habit_3', 'Triple Check', 'Check in at least 3 habits', 'daily', 'habit', 3, 15),
('daily_flashcard_50', 'Card Marathon', 'Review 50 flashcards in one day', 'daily', 'flashcard', 50, 40),
('weekly_pomodoro_10', 'Focus Week', 'Complete 10 Pomodoro sessions this week', 'weekly', 'pomodoro', 10, 80),
('weekly_streak_7', 'Streak Keeper', 'Maintain a 7-day habit streak', 'weekly', 'habit', 7, 100),
('weekly_flashcard_100', 'Card Master Week', 'Review 100 flashcards this week', 'weekly', 'flashcard', 100, 90)
on conflict (slug) do nothing;

-- ============================================================
-- SEED: unlockables (9 items)
-- ============================================================
insert into unlockables (slug, name, description, unlock_type, unlock_value, category) values
('soundscape_none', 'Silence', 'No background sound', 'level', 1, 'soundscape'),
('soundscape_rain', 'Rain & Thunder', 'Peaceful rain sounds', 'level', 1, 'soundscape'),
('soundscape_cafe', 'Café Ambience', 'Cozy café background noise', 'level', 10, 'soundscape'),
('soundscape_forest', 'Deep Forest', 'Immersive forest soundscape', 'level', 15, 'soundscape'),
('soundscape_lofi', 'Lo-Fi Beats', 'Relaxing lo-fi music', 'level', 20, 'soundscape'),
('soundscape_ocean', 'Ocean Waves', 'Calm ocean waves', 'level', 25, 'soundscape'),
('theme_dark', 'Dark Mode', 'Switch to dark theme', 'level', 5, 'theme'),
('theme_accent', 'Custom Accent', 'Choose your accent color', 'level', 20, 'theme'),
('frame_legendary', 'Legendary Frame', 'Golden avatar frame for legendary users', 'level', 30, 'avatar_frame')
on conflict (slug) do nothing;
