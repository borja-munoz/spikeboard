import type { CSSProperties, ReactNode } from 'react'
import { useLongPress } from '../hooks/useLongPress'

interface Props {
  onComplete: () => void
  duration?: number
  disabled?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
  'aria-label'?: string
}

export function LongPressButton({
  onComplete,
  duration = 600,
  disabled = false,
  className = '',
  style,
  children,
  'aria-label': ariaLabel,
}: Props) {
  const { progress, handlers } = useLongPress({ onComplete, duration, disabled })

  return (
    <button
      {...handlers}
      disabled={disabled}
      className={`relative overflow-hidden touch-none select-none ${className}`}
      style={style}
      aria-label={ariaLabel}
    >
      {/* Left-to-right fill sweep while holding */}
      {progress > 0 && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/25"
          style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  )
}
