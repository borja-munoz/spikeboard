import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface Props {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ResetDialog({ isOpen, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60"
            onClick={onCancel}
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-6"
          >
            <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-6">
              <h2 className="text-lg font-bold text-white">{t('dialog.resetTitle')}</h2>
              <p className="mt-2 text-sm text-slate-400">{t('dialog.resetMessage')}</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-xl bg-slate-700 py-3 font-semibold text-slate-200 active:scale-95 transition-transform"
                >
                  {t('dialog.cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white active:scale-95 transition-transform"
                >
                  {t('dialog.confirm')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
