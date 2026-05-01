/**
 * Plays a short end-of-session alert tone using the Web Audio API.
 * Reads notification_settings at call time (not on mount) so the toggle
 * takes effect on the very next session end without a page reload.
 *
 * Fetches user_preferences via the Supabase browser client.
 * Gracefully no-ops in SSR or if AudioContext is unavailable.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const DEFAULT_SOUND = true
const DEFAULT_VOLUME = 80 // percent

/**
 * Fetch notification_settings from user_preferences at firing time.
 * Returns defaults on any error so audio behaviour degrades gracefully.
 */
async function fetchNotificationSettings(): Promise<{
  pomodoro_sound: boolean
  pomodoro_volume: number
}> {
  try {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { pomodoro_sound: DEFAULT_SOUND, pomodoro_volume: DEFAULT_VOLUME }

    const { data } = await supabase
      .from('user_preferences')
      .select('notification_settings')
      .eq('user_id', user.id)
      .maybeSingle()

    const ns = (data as { notification_settings?: Database['public']['Tables']['user_preferences']['Row']['notification_settings'] } | null)
      ?.notification_settings
    return {
      pomodoro_sound: ns?.pomodoro_sound ?? DEFAULT_SOUND,
      pomodoro_volume: ns?.pomodoro_volume ?? DEFAULT_VOLUME,
    }
  } catch {
    return { pomodoro_sound: DEFAULT_SOUND, pomodoro_volume: DEFAULT_VOLUME }
  }
}

/**
 * Generate and play a short two-tone alert using Web Audio API.
 * No asset file needed — synthesised inline.
 */
function playTone(volume: number): void {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const gainNode = ctx.createGain()
    gainNode.gain.value = Math.max(0, Math.min(1, volume / 100))
    gainNode.connect(ctx.destination)

    // Two ascending tones: 880 Hz → 1100 Hz, 80 ms each
    const tones = [880, 1100]
    let time = ctx.currentTime
    for (const freq of tones) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gainNode)
      osc.start(time)
      osc.stop(time + 0.08)
      time += 0.1
    }

    // Release AudioContext after playback to avoid leaking resources
    setTimeout(() => ctx.close().catch(() => {}), 500)
  } catch {
    // AudioContext unavailable (SSR, old browser, permission blocked) — silently skip
  }
}

/**
 * Called at session-complete time. Reads prefs from DB, then plays the tone.
 * Exported so pomodoroStore.ts can call it without a React hook.
 */
export async function playAlertTone(): Promise<void> {
  if (typeof window === 'undefined') return
  const { pomodoro_sound, pomodoro_volume } = await fetchNotificationSettings()
  if (!pomodoro_sound) return
  playTone(pomodoro_volume)
}
