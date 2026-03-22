import { useDrag } from '@use-gesture/react'
import { useMatchStore } from '../store/matchStore'
import type { Team } from '../types/match'

const SWIPE_THRESHOLD = 50

export function useSwipeScore(team: Team) {
  const { addPoint, removePoint, matchWinner } = useMatchStore()

  return useDrag(
    ({ last, movement: [mx, my] }) => {
      if (!last || matchWinner) return

      // Ignore if horizontal movement dominates (system nav gestures, etc.)
      if (Math.abs(mx) > Math.abs(my) * 0.5) return

      if (Math.abs(my) < SWIPE_THRESHOLD) return

      if (my < 0) {
        // Swipe up → +1
        addPoint(team)
        navigator.vibrate?.(30)
      } else {
        // Swipe down → -1
        removePoint(team)
        navigator.vibrate?.(15)
      }
    },
    {
      axis: 'lock',
      filterTaps: true,
    },
  )
}
