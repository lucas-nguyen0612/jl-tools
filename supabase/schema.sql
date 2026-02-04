create extension if not exists "pgcrypto";

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_days integer not null check (goal_days > 0),
  start_date date not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  done boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (habit_id, user_id, log_date)
);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, log_date);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "Habits are viewable by owner" on public.habits
  for select using (auth.uid() = user_id);

create policy "Habits are insertable by owner" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "Habits are updatable by owner" on public.habits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Habits are deletable by owner" on public.habits
  for delete using (auth.uid() = user_id);

create policy "Habit logs are viewable by owner" on public.habit_logs
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id
        and h.user_id = auth.uid()
    )
  );

create policy "Habit logs are insertable by owner" on public.habit_logs
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id
        and h.user_id = auth.uid()
    )
  );

create policy "Habit logs are updatable by owner" on public.habit_logs
  for update using (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id
        and h.user_id = auth.uid()
    )
  ) with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id
        and h.user_id = auth.uid()
    )
  );

create policy "Habit logs are deletable by owner" on public.habit_logs
  for delete using (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_logs.habit_id
        and h.user_id = auth.uid()
    )
  );
