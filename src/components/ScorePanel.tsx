import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Undo2 } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import { useSwipeScore } from '../hooks/useSwipeScore'
import type { Team } from '../types/match'

interface Props {
  team: Team
}

const SCORE_GLOW =
  '0 0 6px #ff9500, 0 0 18px rgba(255,149,0,0.55), 0 0 40px rgba(255,149,0,0.25)'

export function ScorePanel({ team }: Props) {
  const { t } = useTranslation()
  const {
    sets, currentSetIndex, config, matchWinner,
    addPoint, removePoint, updateTeamName, assignSet,
    timeouts, callTimeout,
  } = useMatchStore()

  const teamIndex = team === 'A' ? 0 : 1
  const teamName = config.teamNames[teamIndex]
  const teamColor = config.teamColors[teamIndex]
  const currentScore = sets[currentSetIndex][team]

  const isDisabled = !!matchWinner
  const ghostDigits = currentScore < 10 ? '8' : '88'

  // ── Inline name editing ──
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(teamName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Keep edit value in sync if name changes externally (e.g. via ConfigSheet)
  useEffect(() => {
    if (!isEditing) setEditValue(teamName)
  }, [teamName, isEditing])

  const commitEdit = () => {
    const trimmed = editValue.trim()
    updateTeamName(team, trimmed || teamName)
    setIsEditing(false)
  }

  const bind = useSwipeScore(team)

  return (
    <div
      {...bind()}
      className="relative flex flex-1 flex-col touch-none select-none overflow-hidden bg-[#07080d]"
    >
      {/* ── Team header bar ── */}
      <div className="flex w-full items-center justify-center gap-2.5 border-b border-[#1a1d2e] bg-[#0c0d14] px-4 py-2.5 landscape:py-1.5">
        {/* Team name — tap to edit inline */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') { setEditValue(teamName); setIsEditing(false) }
            }}
            className="w-full max-w-[130px] bg-transparent text-center text-base font-bold font-['Doto'] uppercase
              tracking-[0.12em] text-slate-200 outline-none border-b border-slate-500"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-base font-bold font-['Doto'] uppercase tracking-[0.12em] text-slate-200 active:text-white"
          >
            {teamName}
          </button>
        )}
      </div>

      {/* ── Score area ── */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* Sets won pips */}
        <div className="flex gap-2">
          {Array.from({ length: config.setsToWin }).map((_, i) => {
            const filled = i < (sets.filter(s => s.winner === team).length)
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

      {/* ── Controls ── */}
      {/* ── Controls ── */}
      <div className="flex flex-col items-center gap-2 border-t border-[#1a1d2e] bg-[#0c0d14] px-4 py-3 landscape:py-1.5 landscape:gap-1.5">
        {/* Main action row: undo — +1 — win set */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => removePoint(team)}
            disabled={isDisabled}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a2d3e]
              bg-[#111219] text-slate-500 transition-colors active:bg-[#1a1d2e] disabled:opacity-25
              landscape:h-9 landscape:w-10"
            aria-label="Undo last point"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={() => addPoint(team)}
            disabled={isDisabled}
            className="h-12 w-28 rounded-xl border border-green-700 bg-green-800 font-['Doto'] text-xl font-bold text-green-100
              shadow-[0_3px_0_#14532d] transition-all active:translate-y-[3px] active:shadow-none landscape:h-9 landscape:w-24 landscape:text-base
              disabled:translate-y-0 disabled:opacity-25 disabled:shadow-none"
          >
            +1
          </button>
          <button
            onClick={() => assignSet(team)}
            disabled={isDisabled}
            className="h-12 rounded-xl border px-3 text-xs font-bold uppercase tracking-wider
              transition-colors active:opacity-70 disabled:opacity-25 landscape:h-9"
            style={{ borderColor: teamColor + '66', color: teamColor, background: teamColor + '18' }}
          >
            {t('scoreboard.winSet')}
          </button>
        </div>
        {/* Timeouts */}
        <button
          onClick={() => callTimeout(team)}
          disabled={isDisabled || timeouts[team] >= 2}
          className="flex items-center gap-2 disabled:opacity-40"
          aria-label="Call timeout"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">TO</span>
          {Array.from({ length: 2 }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full transition-all"
              style={
                i < timeouts[team]
                  ? { background: '#1e2030' }
                  : { background: teamColor, boxShadow: `0 0 4px ${teamColor}88` }
              }
            />
          ))}
        </button>
      </div>

    </div>
  )
}
