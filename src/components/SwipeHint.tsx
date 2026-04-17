import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useMatchStore } from '../store/matchStore'

export function SwipeHint() {
  const { swipeHintSeen, setSwipeHintSeen } = useSettingsStore()
  const { sets, currentSetIndex } = useMatchStore()

  const totalScore = sets[currentSetIndex].A + sets[currentSetIndex].B

  useEffect(() => {
    if (swipeHintSeen) return
    if (totalScore > 0) {
      setSwipeHintSeen()
      return
    }
    const timer = setTimeout(setSwipeHintSeen, 5000)
    return () => clearTimeout(timer)
  }, [totalScore, swipeHintSeen, setSwipeHintSeen])

  return (
    <AnimatePresence>
      {!swipeHintSeen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 rounded-2xl bg-black/60 px-5 py-3 backdrop-blur-sm"
          >
            <ChevronUp size={28} strokeWidth={2.5} className="text-slate-300" />
            <ChevronUp size={28} strokeWidth={2.5} className="text-slate-400 -mt-5" />
            <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
              swipe
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
