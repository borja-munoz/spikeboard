import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import { useSettingsStore } from '../store/settingsStore'
import { LongPressButton } from './LongPressButton'
import { ResetDialog } from './ResetDialog'
import { tint } from '../utils/color'

interface Props {
  onOpenConfig: () => void
  onOpenHistory: () => void
}

export function MatchHeader({ onOpenConfig, onOpenHistory }: Props) {
  const { t } = useTranslation()
  const { sets, currentSetIndex, matchWinner, config, resetMatch, assignSet, updateTeamName } = useMatchStore()
  const { soundEnabled, setSoundEnabled } = useSettingsStore()
  const [showDialog, setShowDialog] = useState(false)

  const [editingTeam, setEditingTeam] = useState<'A' | 'B' | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTeam !== null) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingTeam])

  const startEdit = (teamId: 'A' | 'B', currentName: string) => {
    setEditValue(currentName)
    setEditingTeam(teamId)
  }

  const commitEdit = () => {
    if (editingTeam === null) return
    const trimmed = editValue.trim()
    const fallback = config.teamNames[editingTeam === 'A' ? 0 : 1]
    updateTeamName(editingTeam, trimmed || fallback)
    setEditingTeam(null)
  }

  const cancelEdit = () => {
    setEditingTeam(null)
  }

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
      <div className="flex items-center gap-2 border-b border-[#262a3d] bg-[#030305] px-3 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] portrait:flex-col-reverse portrait:items-stretch portrait:gap-1 portrait:pb-3 portrait:pt-[calc(0.25rem+env(safe-area-inset-top))]">
        {/* Centre — team names + win set buttons + set scores */}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          {([
            { color: colorA, name: config.teamNames[0], scoreKey: 'scoreA' as const, teamId: 'A' as const },
            { color: colorB, name: config.teamNames[1], scoreKey: 'scoreB' as const, teamId: 'B' as const },
          ]).map(({ color, name, scoreKey, teamId }) => (
            <div key={teamId} className="flex items-center gap-2">
              {/* Team name — tappable to edit inline */}
              {editingTeam === teamId ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  className="min-w-0 flex-1 bg-transparent text-base font-bold uppercase tracking-[0.12em] outline-none border-b landscape:max-w-40"
                  style={{ color: tint(color), borderColor: color + '88' }}
                />
              ) : (
                <button
                  onClick={() => startEdit(teamId, name)}
                  className="min-w-0 flex-1 text-left text-base font-bold uppercase tracking-[0.12em] truncate transition-opacity active:opacity-60 landscape:max-w-40"
                  style={{ color: tint(color) }}
                >
                  {name}
                </button>
              )}
              {/* Win Set button */}
              <LongPressButton
                onComplete={() => assignSet(teamId)}
                disabled={!!matchWinner}
                className="shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider disabled:opacity-40 portrait:px-2 max-[800px]:px-2"
                style={{ background: color + '22', color: tint(color), border: `1px solid ${color}aa` }}
              >
                {t('scoreboard.winSet')}
              </LongPressButton>
              {/* Per-set scores */}
              <div className="flex shrink-0 gap-1">
                {setColumns.map((col, i) => {
                  const score = col[scoreKey]
                  const won = col.winner === teamId
                  const lost = col.winner != null && col.winner !== teamId
                  return (
                    <span
                      key={i}
                      className="min-w-[2.5rem] rounded-md px-1.5 py-0.5 text-center text-base font-bold tabular-nums portrait:min-w-[2rem] portrait:px-1 max-[800px]:min-w-[2rem] max-[800px]:px-1"
                      style={{
                        color: won ? tint(color) : col.isCurrent ? '#f8fafc' : lost ? '#94a3b8' : '#475569',
                        background: won ? color + '2e' : col.isCurrent ? '#ffffff14' : 'transparent',
                        outline: col.isCurrent ? '1px solid #ffffff33' : 'none',
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
        <div className="flex shrink-0 items-center portrait:justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg p-2 text-slate-300 max-[800px]:p-1.5 transition-colors active:bg-[#1a1d2e] active:text-white"
            aria-label={soundEnabled ? t('config.soundOff') : t('config.soundOn')}
          >
            {soundEnabled ? <Volume2 size={25} /> : <VolumeX size={25} />}
          </button>
          <button
            onClick={onOpenConfig}
            className="rounded-lg p-2 text-slate-300 max-[800px]:p-1.5 transition-colors active:bg-[#1a1d2e] active:text-white"
            aria-label={t('config.title')}
          >
            <SlidersHorizontal size={25} />
          </button>
          <button
            onClick={onOpenHistory}
            className="rounded-lg p-2 text-slate-300 max-[800px]:p-1.5 transition-colors active:bg-[#1a1d2e] active:text-white"
            aria-label={t('history.title')}
          >
            <BookOpen size={25} />
          </button>
          <button
            onClick={() => setShowDialog(true)}
            className="rounded-lg p-2 text-slate-300 max-[800px]:p-1.5 transition-colors active:bg-[#1a1d2e] active:text-white"
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
