import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  const acquire = async () => {
    if (!('wakeLock' in navigator)) return
    try {
      lockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // permission denied or not supported — fail silently
    }
  }

  const release = () => {
    lockRef.current?.release()
    lockRef.current = null
  }

  useEffect(() => {
    if (active) acquire()
    else release()
    return release
  }, [active])

  // Re-acquire after the tab returns to foreground (lock is auto-released on hide)
  useEffect(() => {
    const onVisibility = () => {
      if (active && document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [active])
}
