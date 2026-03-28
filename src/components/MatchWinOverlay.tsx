import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'

interface Props {
  onNewMatch: () => void
}

export function MatchWinOverlay({ onNewMatch }: Props) {
  const { t } = useTranslation()
  const { matchWinner, sets, config, resetMatch } = useMatchStore()

  if (!matchWinner) return null

  const winnerIndex = matchWinner === 'A' ? 0 : 1
  const teamName = config.teamNames[winnerIndex]
  const teamColor = config.teamColors[winnerIndex]
  const completedSets = sets.filter((s) => s.winner !== null)

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-sm flex-col items-center gap-5 px-6"
      >
        {/* Trophy */}
        <motion.div variants={item} className="text-6xl">🏆</motion.div>

        {/* Team name */}
        <motion.span
          variants={item}
          className="font-['Doto'] text-4xl font-bold uppercase tracking-widest"
          style={{ color: teamColor, textShadow: `0 0 24px ${teamColor}88` }}
        >
          {teamName}
        </motion.span>

        {/* "wins the match" */}
        <motion.span
          variants={item}
          className="text-base font-semibold uppercase tracking-[0.22em] text-slate-300"
        >
          {t('overlay.winsTheMatch')}
        </motion.span>

        {/* Set-by-set scores */}
        <motion.div variants={item} className="flex gap-4">
          {completedSets.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest text-slate-600">
                {t('scoreboard.set')} {i + 1}
              </span>
              <div
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-['DSEG7'] text-lg"
                style={{
                  background: s.winner === matchWinner ? teamColor + '22' : '#0c0d14',
                  color: s.winner === matchWinner ? teamColor : '#4a5568',
                  outline: s.winner === matchWinner ? `1px solid ${teamColor}44` : 'none',
                }}
              >
                <span>{s.A}</span>
                <span className="text-slate-700">–</span>
                <span>{s.B}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={item} className="mt-2 flex w-full flex-col gap-3">
          <button
            onClick={resetMatch}
            className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-4 font-['Doto'] text-lg font-bold uppercase tracking-widest text-slate-200 transition-colors active:bg-slate-700"
          >
            {t('overlay.rematch')}
          </button>
          <button
            onClick={onNewMatch}
            className="w-full rounded-2xl py-3 text-sm font-semibold uppercase tracking-widest text-slate-500 active:text-slate-300"
          >
            {t('overlay.newMatch')}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
