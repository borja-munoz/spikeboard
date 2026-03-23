import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import { ResetDialog } from './ResetDialog'
import { ConfigSheet } from './ConfigSheet'

export function MatchHeader() {
  const { t } = useTranslation()
  const { sets, currentSetIndex, matchWinner, config, resetMatch } = useMatchStore()
  const [showDialog, setShowDialog] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  const maxSets = config.setsToWin * 2 - 1
  const [colorA, colorB] = config.teamColors

  const setColumns = Array.from({ length: maxSets }, (_, i) => {
    const s = sets[i]
    return {
      scoreA: s?.A ?? null,
      scoreB: s?.B ?? null,
      winner: s?.winner ?? null,
      isCurrent: i === currentSetIndex && s?.winner == null,
    }
  })

  return (
    <>
      <div className="flex items-center justify-between bg-[#030305] px-3 py-2 border-b border-[#1a1d2e]">
        {/* Left — current set label */}
        <div className="w-20 shrink-0 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
          {matchWinner
            ? config.teamNames[matchWinner === 'A' ? 0 : 1]
            : `${t('scoreboard.set')} ${currentSetIndex + 1}`}
        </div>

        {/* Centre — two-row set scoreboard */}
        <div className="flex flex-col gap-1 py-0.5">
          {([
            { label: config.teamNames[0], color: colorA, scoreKey: 'scoreA', team: 'A' },
            { label: config.teamNames[1], color: colorB, scoreKey: 'scoreB', team: 'B' },
          ] as const).map(({ color, scoreKey, team }) => (
            <div key={team} className="flex items-center gap-1.5">
              {/* Team color dot */}
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color, boxShadow: `0 0 4px ${color}88` }}
              />
              {/* Per-set scores */}
              <div className="flex gap-1">
                {setColumns.map((col, i) => {
                  const score = col[scoreKey]
                  const won = col.winner === team
                  const lost = col.winner != null && col.winner !== team
                  return (
                    <span
                      key={i}
                      className="min-w-[2rem] rounded-md px-1.5 py-0.5 text-center text-sm font-bold font-['Doto'] tabular-nums"
                      style={{
                        color: won ? color : col.isCurrent ? '#e2e8f0' : lost ? '#374151' : '#1e2030',
                        background: won ? color + '22' : col.isCurrent ? '#ffffff0d' : 'transparent',
                        outline: col.isCurrent ? '1px solid #ffffff18' : 'none',
                      }}
                    >
                      {score ?? '–'}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right — icon buttons */}
        <div className="flex w-20 shrink-0 items-center justify-end gap-0.5">
          <button
            onClick={() => setShowConfig(true)}
            className="rounded-lg p-2 text-slate-600 transition-colors active:bg-[#0d0e14] active:text-slate-400"
            aria-label={t('config.title')}
          >
            <SlidersHorizontal size={17} />
          </button>
          <button
            onClick={() => setShowDialog(true)}
            className="rounded-lg p-2 text-slate-600 transition-colors active:bg-[#0d0e14] active:text-slate-400"
            aria-label={t('dialog.resetTitle')}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>

      <ResetDialog
        isOpen={showDialog}
        onConfirm={() => { resetMatch(); setShowDialog(false) }}
        onCancel={() => setShowDialog(false)}
      />
      <ConfigSheet isOpen={showConfig} onClose={() => setShowConfig(false)} />
    </>
  )
}
