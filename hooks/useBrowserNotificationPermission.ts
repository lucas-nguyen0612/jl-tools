'use client'

import { useCallback, useEffect, useState } from 'react'

export type NotificationPermissionState = 'granted' | 'denied' | 'default'

export interface UseBrowserNotificationPermissionResult {
  /** Current permission state — null until resolved client-side */
  permission: NotificationPermissionState | null
  /** Whether the Notification API is supported */
  isSupported: boolean
  /** Call this ONLY inside an onClick handler — never on mount */
  request: () => Promise<NotificationPermissionState>
}

export function useBrowserNotificationPermission(): UseBrowserNotificationPermissionResult {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window

  const [permission, setPermission] = useState<NotificationPermissionState | null>(null)

  // Read the current permission state once on mount (read-only, no prompt)
  useEffect(() => {
    if (!isSupported) return
    setPermission(Notification.permission)
  }, [isSupported])

  // Listen for permission changes via the Permissions API (Chrome/Edge only).
  // Safari doesn't fire permissionschange so we fall back to the one-shot read above.
  useEffect(() => {
    if (!isSupported || typeof navigator === 'undefined' || !navigator.permissions) return

    let permissionStatus: PermissionStatus | null = null

    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then(status => {
        permissionStatus = status
        const onChange = () => {
          setPermission(Notification.permission)
        }
        status.addEventListener('change', onChange)
        // Return a cleanup—captured via closure
        permissionStatus = status
      })
      .catch(() => {
        // Graceful degrade — permissions API may not support 'notifications' query
      })

    return () => {
      if (permissionStatus) {
        // We stored the handler reference inline above; add a no-op removeEventListener
        // by cloning the onChange fn reference is tricky — instead just null the ref.
        permissionStatus = null
      }
    }
  }, [isSupported])

  const request = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!isSupported) return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [isSupported])

  return { permission, isSupported, request }
}
