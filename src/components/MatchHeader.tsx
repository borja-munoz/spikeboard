import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import { useSettingsStore } from '../store/settingsStore'
import { ResetDialog } from './ResetDialog'

interface Props {
  onOpenConfig: () => void
  onOpenHistory: () => void
}

export function MatchHeader({ onOpenConfig, onOpenHistory }: Props) {
  const { t } = useTranslation()
  const { sets, currentSetIndex, matchWinner, config, resetMatch, assignSet } = useMatchStore()
  const { soundEnabled, setSoundEnabled } = useSettingsStore()
  const [showDialog, setShowDialog] = useState(false)

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
      <div className="flex items-center justify-between bg-[#030305] px-3 py-2.5 border-b border-[#1a1d2e]">
        {/* Left — current set label */}
        <div className="w-16 shrink-0 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
          {matchWinner
            ? config.teamNames[matchWinner === 'A' ? 0 : 1]
            : `${t('scoreboard.set')} ${currentSetIndex + 1}`}
        </div>

        {/* Centre — two-row set scoreboard with Win Set buttons */}
        <div className="flex flex-col gap-1.5">
          {([
            { color: colorA, scoreKey: 'scoreA' as const, teamId: 'A' as const },
            { color: colorB, scoreKey: 'scoreB' as const, teamId: 'B' as const },
          ]).map(({ color, scoreKey, teamId }) => (
            <div key={teamId} className="flex items-center gap-2">
              {/* Team color dot */}
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: color, boxShadow: `0 0 4px ${color}88` }}
              />
              {/* Win Set button */}
              <button
                onClick={() => assignSet(teamId)}
                disabled={!!matchWinner}
                className="rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all active:opacity-70 disabled:opacity-30"
                style={{ background: color + '22', color, border: `1px solid ${color}55` }}
              >
                {t('scoreboard.winSet')}
              </button>
              {/* Per-set scores */}
              <div className="flex gap-1">
                {setColumns.map((col, i) => {
                  const score = col[scoreKey]
                  const won = col.winner === teamId
                  const lost = col.winner != null && col.winner !== teamId
                  return (
                    <span
                      key={i}
                      className="min-w-[2.5rem] rounded-md px-1.5 py-0.5 text-center text-base font-bold font-['Doto'] tabular-nums"
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
        <div className="flex shrink-0 items-center justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg p-2.5 text-slate-600 transition-colors active:bg-[#0d0e14] active:text-slate-400"
            aria-label={soundEnabled ? t('config.soundOff') : t('config.soundOn')}
          >
            {soundEnabled ? <Volume2 size={25} /> : <VolumeX size={25} />}
          </button>
          <button
            onClick={onOpenConfig}
            className="rounded-lg p-2.5 text-slate-600 transition-colors active:bg-[#0d0e14] active:text-slate-400"
            aria-label={t('config.title')}
          >
            <SlidersHorizontal size={25} />
          </button>
          <button
            onClick={onOpenHistory}
            className="rounded-lg p-2.5 text-slate-600 transition-colors active:bg-[#0d0e14] active:text-slate-400"
            aria-label={t('history.title')}
          >
            <History size={25} />
          </button>
          <button
            onClick={() => setShowDialog(true)}
            className="rounded-lg p-2.5 text-slate-600 transition-colors active:bg-[#0d0e14] active:text-slate-400"
            aria-label={t('dialog.resetTitle')}
          >
            <RotateCcw size={25} />
          </button>
        </div>
      </div>

      <ResetDialog
        isOpen={showDialog}
        onConfirm={() => { resetMatch(); setShowDialog(false) }}
        onCancel={() => setShowDialog(false)}
      />
    </>
  )
}
