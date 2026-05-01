'use client'

import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { useSoundscapesQuery } from '@/hooks/useSoundscapes'

const PRESET_AUDIO: Record<string, string> = {
  rain: '/sounds/rain.mp3',
  cafe: '/sounds/cafe.mp3',
  forest: '/sounds/forest.mp3',
  space: '/sounds/space.mp3',
  lofi: '/sounds/lofi.mp3',
}

/**
 * Plays the selected soundscape during work-phase Pomodoro sessions.
 * Resolves the audio URL from bundled presets in /public/sounds first,
 * then falls back to the user's uploaded soundscapes.
 */
export function useSoundscapePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const soundscapeId = usePomodoroStore(s => s.settings.soundscape)
  const volume = usePomodoroStore(s => s.settings.volume)
  const isRunning = usePomodoroStore(s => s.isRunning)
  const phase = usePomodoroStore(s => s.phase)

  const { data: soundscapes } = useSoundscapesQuery()

  // Lazily create the audio element on the client only.
  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  // Sync the audio element's src to the selected soundscape.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const presetUrl = PRESET_AUDIO[soundscapeId]
    const customUrl = soundscapes?.find(s => s.id === soundscapeId)?.fileUrl
    const nextUrl = presetUrl ?? customUrl ?? null

    if (!nextUrl) {
      if (!audio.paused) audio.pause()
      if (audio.src) audio.removeAttribute('src')
      return
    }

    // Resolve relative paths against the current origin so the strict
    // equality check against audio.src (which is always absolute) works.
    const absoluteUrl = new URL(nextUrl, window.location.href).href
    if (audio.src !== absoluteUrl) {
      audio.src = nextUrl
      audio.load()
    }
  }, [soundscapeId, soundscapes])

  // Sync volume.
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = Math.max(0, Math.min(1, volume))
  }, [volume])

  // Play during running work phase, pause otherwise.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) return

    const shouldPlay = isRunning && phase === 'work'
    if (shouldPlay) {
      // play() returns a promise that may reject if the user hasn't
      // interacted with the page yet; swallow that case quietly.
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isRunning, phase, soundscapeId, soundscapes])
}
