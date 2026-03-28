import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-xl">
      <span className="text-sm text-slate-300">{t('pwa.updateAvailable')}</span>
      <div className="flex gap-2">
        <button
          onClick={() => setNeedRefresh(false)}
          className="rounded-lg px-3 py-1.5 text-xs text-slate-500 active:text-slate-300"
        >
          {t('pwa.dismiss')}
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white active:bg-slate-600"
        >
          {t('pwa.reload')}
        </button>
      </div>
    </div>
  )
}
