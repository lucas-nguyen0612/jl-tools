export type Habit = {
  id: string;
  user_id: string;
  name: string;
  goal_days: number;
  start_date: string;
  archived_at: string | null;
};

export type HabitLog = {
  habit_id: string;
  user_id: string;
  log_date: string;
  done: boolean;
};
