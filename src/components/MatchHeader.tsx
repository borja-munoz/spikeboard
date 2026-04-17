import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import { useMatchStore } from '../store/matchStore'
import { useSettingsStore } from '../store/settingsStore'
import { LongPressButton } from './LongPressButton'
import { ResetDialog } from './ResetDialog'

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
      <div className="flex items-center gap-2 bg-[#030305] px-3 py-4 border-b border-[#1a1d2e]">
        {/* Centre — team names + win set buttons + set scores */}
        <div className="flex flex-1 flex-col gap-2.5">
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
                  className="w-40 bg-transparent text-sm font-bold uppercase tracking-[0.12em] outline-none border-b"
                  style={{ color, borderColor: color + '88' }}
                />
              ) : (
                <button
                  onClick={() => startEdit(teamId, name)}
                  className="w-40 text-left text-sm font-bold uppercase tracking-[0.12em] truncate transition-opacity active:opacity-60"
                  style={{ color }}
                >
                  {name}
                </button>
              )}
              {/* Win Set button */}
              <LongPressButton
                onComplete={() => assignSet(teamId)}
                disabled={!!matchWinner}
                className="rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wider disabled:opacity-30"
                style={{ background: color + '22', color, border: `1px solid ${color}55` }}
              >
                {t('scoreboard.winSet')}
              </LongPressButton>
              {/* Per-set scores */}
              <div className="flex gap-1">
                {setColumns.map((col, i) => {
                  const score = col[scoreKey]
                  const won = col.winner === teamId
                  const lost = col.winner != null && col.winner !== teamId
                  return (
                    <span
                      key={i}
                      className="min-w-[2.5rem] rounded-md px-1.5 py-0.5 text-center text-base font-bold tabular-nums"
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
        <div className="flex shrink-0 items-center">
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
