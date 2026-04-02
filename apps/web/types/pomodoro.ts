export interface PomodoroSettings {
  focusDuration: number // minutes
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}
