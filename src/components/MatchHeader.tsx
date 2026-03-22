import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatchStore } from '../store/matchStore'
import { ResetDialog } from './ResetDialog'

interface Props {
  onReset: () => void
}

export function MatchHeader({ onReset }: Props) {
  const { t } = useTranslation()
  const { sets, currentSetIndex, matchWinner, config, resetMatch } = useMatchStore()
  const [showDialog, setShowDialog] = useState(false)

  const completedSets = sets.filter((s) => s.winner !== null)

  const handleConfirmReset = () => {
    resetMatch()
    setShowDialog(false)
    onReset()
  }

  return (
    <>
      <div className="flex items-center justify-between bg-slate-950 px-4 py-3">
        <div className="text-sm font-medium text-slate-400">
          {matchWinner
            ? t('overlay.matchWon', { team: config.teamNames[matchWinner === 'A' ? 0 : 1] })
            : `${t('scoreboard.set')} ${currentSetIndex + 1}`}
        </div>

        {completedSets.length > 0 && (
          <div className="flex gap-2 text-xs text-slate-500">
            {completedSets.map((s, i) => (
              <span key={i}>
                {s.A}–{s.B}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowDialog(true)}
          className="rounded-lg px-3 py-1 text-sm text-slate-400 active:bg-slate-800"
        >
          {t('dialog.resetTitle')}
        </button>
      </div>

      <ResetDialog
        isOpen={showDialog}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowDialog(false)}
      />
    </>
  )
}
