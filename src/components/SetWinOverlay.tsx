import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'

export function SetWinOverlay() {
  const { t } = useTranslation()
  const { lastCompletedSet, sets, config, clearSetAlert } = useMatchStore()

  useEffect(() => {
    if (!lastCompletedSet) return
    const timer = setTimeout(clearSetAlert, 2500)
    return () => clearTimeout(timer)
  }, [lastCompletedSet, clearSetAlert])

  return (
    <AnimatePresence>
      {lastCompletedSet && (
        <motion.div
          key={`set-${lastCompletedSet.index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={clearSetAlert}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#0c0d14] px-10 py-8 text-center shadow-2xl"
          >
            {/* Team name */}
            <span
              className="font-['Doto'] text-4xl font-bold uppercase tracking-widest"
              style={{
                color: config.teamColors[lastCompletedSet.winner === 'A' ? 0 : 1],
                textShadow: `0 0 20px ${config.teamColors[lastCompletedSet.winner === 'A' ? 0 : 1]}88`,
              }}
            >
              {config.teamNames[lastCompletedSet.winner === 'A' ? 0 : 1]}
            </span>

            {/* "wins the set" */}
            <span className="text-lg font-semibold uppercase tracking-[0.2em] text-slate-300">
              {t('overlay.winsTheSet')}
            </span>

            {/* Set score */}
            <div className="flex items-center gap-3 font-['DSEG7'] text-3xl text-amber-400">
              <span>{sets[lastCompletedSet.index]?.A ?? 0}</span>
              <span className="text-slate-600">–</span>
              <span>{sets[lastCompletedSet.index]?.B ?? 0}</span>
            </div>

            {/* Tap hint */}
            <span className="mt-1 text-xs uppercase tracking-widest text-slate-600">
              {t('overlay.tapToContinue')}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
