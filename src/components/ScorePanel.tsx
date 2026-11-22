import { motion } from 'framer-motion'
import { useMatchStore } from '../store/matchStore'
import { useSwipeScore } from '../hooks/useSwipeScore'
import { LongPressButton } from './LongPressButton'
import { SwipeHint } from './SwipeHint'
import type { Team } from '../types/match'
import { tint } from '../utils/color'

interface Props {
  team: Team
}

// Landscape: two panels side by side, so size by width.
// Portrait: panels are stacked, so each has the full width but only half the height.
const SCORE_SIZE =
  'landscape:text-[clamp(4.5rem,19vw,9.5rem)] portrait:text-[clamp(4.5rem,min(32vw,17vh),9.5rem)]'

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
        ${team === 'A' ? 'border-r' : 'border-l'} border-[#262a3d]`}
    >
      {[0, 1].map(i => {
        const used = timeouts[team] > i
        return (
          <LongPressButton
            key={i}
            onComplete={() => callTimeout(team)}
            disabled={isDisabled || used}
            className="flex h-11 w-9 items-center justify-center rounded-lg text-sm font-bold tracking-wider"
            style={
              used
                ? {
                    background: '#0a0b11',
                    color: '#64748b',
                    border: '1px solid #334155',
                    textDecoration: 'line-through',
                  }
                : {
                    background: teamColor + '22',
                    color: tint(teamColor),
                    border: `1px solid ${teamColor}aa`,
                    boxShadow: `0 0 6px ${teamColor}33`,
                  }
            }
          >
            T{i + 1}
          </LongPressButton>
        )
      })}
    </div>
  )

  const portraitSpacer = <div aria-hidden className="hidden w-12 shrink-0 portrait:block" />

  return (
    <div
      {...bind()}
      className="relative flex flex-1 overflow-hidden touch-none select-none bg-[#07080d]"
    >
      {team === 'A' && timeoutStrip}
      {/* Portrait: mirror the timeout strip's width so both stacked scores share the same centre line */}
      {team === 'B' && portraitSpacer}

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
                  : { background: '#334155' }}
              />
            )
          })}
        </div>

        {/* Score digit with ghost segments */}
        <div className="relative px-2">
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 font-['DSEG7'] leading-none text-amber-400 opacity-[0.10] ${SCORE_SIZE}`}
          >
            {ghostDigits}
          </div>
          <motion.div
            key={currentScore}
            initial={{ opacity: 0.5, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className={`relative font-['DSEG7'] leading-none text-amber-400 ${SCORE_SIZE}`}
            style={{
              textShadow: isDisabled ? 'none' : SCORE_GLOW,
            }}
          >
            {currentScore}
          </motion.div>
        </div>
      </div>

      {team === 'A' && portraitSpacer}
      {team === 'B' && timeoutStrip}

      <SwipeHint />
    </div>
  )
}
