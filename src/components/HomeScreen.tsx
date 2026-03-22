import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../store/settingsStore'
import { useMatchStore } from '../store/matchStore'
import { ConfigSheet } from './ConfigSheet'

interface Props {
  onStart: () => void
}

export function HomeScreen({ onStart }: Props) {
  const { t } = useTranslation()
  const [showConfig, setShowConfig] = useState(false)
  const { config } = useSettingsStore()
  const { startMatch } = useMatchStore()

  const handleStart = () => {
    startMatch(config)
    onStart()
  }

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-900 px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">{t('app.name')}</h1>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={handleStart}
            className="w-full rounded-2xl bg-green-600 py-5 text-xl font-bold text-white active:scale-95 transition-transform"
          >
            {t('home.startMatch')}
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="w-full rounded-2xl bg-slate-800 py-4 text-base font-semibold text-slate-300 active:scale-95 transition-transform"
          >
            {t('home.configure')}
          </button>
        </div>
      </div>

      <ConfigSheet isOpen={showConfig} onClose={() => setShowConfig(false)} onStart={onStart} />
    </>
  )
}
