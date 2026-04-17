import { motion } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useSwipeScore } from '../hooks/useSwipeScore'
import type { Team } from '../types/match'

interface Props {
  team: Team
}

const SCORE_GLOW =
  '0 0 6px #ff9500, 0 0 18px rgba(255,149,0,0.55), 0 0 40px rgba(255,149,0,0.25)'

export function ScorePanel({ team }: Props) {
  const {
    sets, currentSetIndex, config, matchWinner,
    timeouts, callTimeout,
  } = useMatchStore()

  const teamIndex = team === 'A' ? 0 : 1
  const teamColor = config.teamColors[teamIndex]
  const currentScore = sets[currentSetIndex][team]

  const isDisabled = !!matchWinner
  const ghostDigits = currentScore < 10 ? '8' : '88'

  const bind = useSwipeScore(team)

  // ── Timeout strip ──
  const timeoutStrip = (
    <div
      className={`flex flex-col items-center justify-center gap-3 w-12 bg-[#0c0d14] py-4
        ${team === 'A' ? 'border-r' : 'border-l'} border-[#1a1d2e]`}
    >
      {[0, 1].map(i => {
        const used = timeouts[team] > i
        return (
          <button
            key={i}
            onClick={() => callTimeout(team)}
            disabled={isDisabled || used}
            className="flex h-11 w-9 items-center justify-center rounded-lg text-xs font-bold tracking-wider transition-all active:scale-95"
            style={
              used
                ? { background: '#0a0b11', color: '#1e2030', border: '1px solid #1a1d2e' }
                : {
                    background: teamColor + '22',
                    color: teamColor,
                    border: `1px solid ${teamColor}55`,
                    boxShadow: `0 0 6px ${teamColor}33`,
                  }
            }
          >
            T{i + 1}
          </button>
        )
      })}
    </div>
  )

  return (
    <div
      {...bind()}
      className="relative flex flex-1 overflow-hidden touch-none select-none bg-[#07080d]"
    >
      {team === 'A' && timeoutStrip}

      {/* Score area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* Sets won pips */}
        <div className="flex gap-2">
          {Array.from({ length: config.setsToWin }).map((_, i) => {
            const filled = i < sets.filter(s => s.winner === team).length
            return (
              <span
                key={i}
                className="h-3 w-3 rounded-full transition-all"
                style={filled
                  ? { background: teamColor, boxShadow: `0 0 5px ${teamColor}, 0 0 10px ${teamColor}88` }
                  : { background: '#1e2030' }}
              />
            )
          })}
        </div>

        {/* Score digit with ghost segments */}
        <div className="relative px-2">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 font-['DSEG7'] leading-none text-amber-400 opacity-[0.10]"
            style={{ fontSize: 'clamp(5.5rem,19vw,9.5rem)' }}
          >
            {ghostDigits}
          </div>
          <motion.div
            key={currentScore}
            initial={{ opacity: 0.5, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="relative font-['DSEG7'] leading-none text-amber-400"
            style={{
              fontSize: 'clamp(5.5rem,19vw,9.5rem)',
              textShadow: isDisabled ? 'none' : SCORE_GLOW,
            }}
          >
            {currentScore}
          </motion.div>
        </div>
      </div>

      {team === 'B' && timeoutStrip}
    </div>
  )
}
