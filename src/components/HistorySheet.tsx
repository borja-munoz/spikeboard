import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, animate as animateValue, useMotionValue } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useDrag } from '@use-gesture/react'
import { useHistoryStore } from '../store/historyStore'
import type { MatchRecord } from '../types/history'

interface Props {
  isOpen: boolean
  onClose: () => void
}

// ── Per-entry card with swipe-left-to-delete + trash button ──────────────────

function MatchEntry({ record, onDelete }: { record: MatchRecord; onDelete: () => void }) {
  const { i18n } = useTranslation()
  const x = useMotionValue(0)

  const date = new Date(record.date).toLocaleDateString(i18n.resolvedLanguage ?? 'en', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const [nameA, nameB] = record.teamNames
  const [colorA, colorB] = record.teamColors

  // Slide card off to the left, then call onDelete so AnimatePresence
  // collapses the row after the card is already out of view.
  const triggerDelete = () => {
    animateValue(x, -500, { duration: 0.22, ease: 'easeIn' }).then(onDelete)
  }

  const bind = useDrag(
    ({ movement: [mx], last, cancel }) => {
      if (mx > 0) { cancel?.(); return }   // block rightward drag
      if (last) {
        if (mx < -80) {
          triggerDelete()
        } else {
          // snap back
          animateValue(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
        }
      } else {
        x.set(mx)
      }
    },
    { axis: 'x', filterTaps: true, threshold: 8 },
  )

  return (
    // Outer div: gesture capture + clip
    <div
      {...bind()}
      className="relative overflow-hidden rounded-2xl"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Red zone revealed as card slides away */}
      <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-950 px-5">
        <Trash2 size={18} className="text-red-400" />
      </div>

      {/* Animated card — only handles the x transform */}
      <motion.div
        style={{ x }}
        className="relative rounded-2xl border border-[#1a1d2e] bg-[#0c0d14] p-4"
      >
        {/* Trash icon button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={triggerDelete}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-700 transition-colors active:text-red-400"
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>

        {/* Date */}
        <p className="mb-3 text-xs uppercase tracking-widest text-slate-600">{date}</p>

        {/* Teams + sets-won summary */}
        <div className="mb-3 flex items-center justify-between pr-6">
          <span
            className="font-['Doto'] text-base font-bold uppercase tracking-wider"
            style={{ color: record.winner === 'A' ? colorA : '#64748b' }}
          >
            {nameA}
          </span>
          <div className="flex items-center gap-2 font-['DSEG7'] text-xl">
            <span style={{ color: colorA }}>{record.setsWon.A}</span>
            <span className="text-slate-700">–</span>
            <span style={{ color: colorB }}>{record.setsWon.B}</span>
          </div>
          <span
            className="font-['Doto'] text-base font-bold uppercase tracking-wider"
            style={{ color: record.winner === 'B' ? colorB : '#64748b' }}
          >
            {nameB}
          </span>
        </div>

        {/* Per-set scores */}
        <div className="flex gap-2">
          {record.sets.map((s, i) => (
            <div
              key={i}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1 font-['DSEG7'] text-sm"
              style={{
                background: '#07080d',
                color: s.winner === record.winner
                  ? record.teamColors[record.winner === 'A' ? 0 : 1]
                  : '#374151',
              }}
            >
              <span>{s.A}</span>
              <span className="text-slate-800">–</span>
              <span>{s.B}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ── Sheet ─────────────────────────────────────────────────────────────────────

export function HistorySheet({ isOpen, onClose }: Props) {
  const { t } = useTranslation()
  const { records, deleteRecord, clearHistory } = useHistoryStore()
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClear = () => {
    if (confirmClear) {
      clearHistory()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-20 flex max-h-[75vh] flex-col rounded-t-2xl bg-slate-900"
          >
            {/* Handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-slate-600" />
            </div>

            {/* Title */}
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-bold text-white">{t('history.title')}</h2>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {records.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-600">{t('history.empty')}</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {records.map((record) => (
                    <motion.div
                      key={record.id}
                      layout
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="mb-3"
                    >
                      <MatchEntry
                        record={record}
                        onDelete={() => deleteRecord(record.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — clear all */}
            {records.length > 0 && (
              <div className="border-t border-slate-800 px-6 py-4 pb-8">
                {confirmClear ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-400">{t('history.confirmClear')}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="rounded-lg px-4 py-2 text-sm text-slate-500 active:text-slate-300"
                      >
                        {t('dialog.cancel')}
                      </button>
                      <button
                        onClick={handleClear}
                        className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-red-200 active:bg-red-800"
                      >
                        {t('history.clearAll')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleClear}
                    className="flex w-full items-center justify-center gap-2 py-2 text-sm text-slate-600 active:text-slate-400"
                  >
                    <Trash2 size={14} />
                    {t('history.clearAll')}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
