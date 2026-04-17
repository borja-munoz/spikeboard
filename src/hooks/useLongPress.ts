import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  onComplete: () => void
  duration?: number
  disabled?: boolean
}

export function useLongPress({ onComplete, duration = 600, disabled = false }: Options) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    startRef.current = null
    setProgress(0)
  }, [])

  const start = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    // Prevent the drag gesture on the parent ScorePanel from also firing
    e.stopPropagation()
    startRef.current = Date.now()

    const tick = () => {
      if (startRef.current === null) return
      const p = Math.min((Date.now() - startRef.current) / duration, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        startRef.current = null
        rafRef.current = null
        setProgress(0)
        onComplete()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [disabled, duration, onComplete])

  // Cleanup on unmount
  useEffect(() => cancel, [cancel])

  return {
    progress,
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      // Prevent iOS long-press context menu
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  }
}
