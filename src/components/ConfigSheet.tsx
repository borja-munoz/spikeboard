import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../store/settingsStore'
import { useMatchStore } from '../store/matchStore'
import i18n from '../i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-xl font-bold text-white disabled:opacity-30 active:scale-95 transition-transform"
      >
        −
      </button>
      <span className="w-8 text-center text-lg font-semibold tabular-nums text-white">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-xl font-bold text-white disabled:opacity-30 active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}

export function ConfigSheet({ isOpen, onClose, onStart }: Props) {
  const { t } = useTranslation()
  const { config, updateConfig, resetToDefaults } = useSettingsStore()
  const { startMatch } = useMatchStore()

  const currentLang = i18n.resolvedLanguage ?? 'en'

  const handleStart = () => {
    startMatch(config)
    onStart()
  }

  const FORMAT_OPTIONS = [
    { setsToWin: 1, label: t('config.bestOf1') },
    { setsToWin: 2, label: t('config.bestOf3') },
    { setsToWin: 3, label: t('config.bestOf5') },
  ]

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
            className="fixed inset-x-0 bottom-0 z-20 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-slate-900"
          >
            {/* Handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-slate-600" />
            </div>

            {/* Title */}
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-bold text-white">{t('config.title')}</h2>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Team Names */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('config.teamNames')}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={config.teamNames[0]}
                    onChange={(e) => updateConfig({ teamNames: [e.target.value, config.teamNames[1]] })}
                    placeholder={t('config.teamA')}
                    className="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                  />
                  <input
                    type="text"
                    value={config.teamNames[1]}
                    onChange={(e) => updateConfig({ teamNames: [config.teamNames[0], e.target.value] })}
                    placeholder={t('config.teamB')}
                    className="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                  />
                </div>
              </section>

              {/* Match Format */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('config.matchFormat')}
                </h3>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.setsToWin}
                      onClick={() => updateConfig({ setsToWin: opt.setsToWin })}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        config.setsToWin === opt.setsToWin
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Set Rules */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('config.setRules')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">{t('config.pointsPerSet')}</span>
                    <Stepper
                      value={config.pointsPerSet}
                      min={10}
                      max={30}
                      onChange={(v) => updateConfig({ pointsPerSet: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">{t('config.minLead')}</span>
                    <Stepper
                      value={config.minLead}
                      min={1}
                      max={5}
                      onChange={(v) => updateConfig({ minLead: v })}
                    />
                  </div>
                </div>
              </section>

              {/* Tie-break Rules — only shown for best-of-3 or best-of-5 */}
              {config.setsToWin > 1 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('config.tiebreakRules')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">{t('config.tiebreakPoints')}</span>
                      <Stepper
                        value={config.tiebreakPoints}
                        min={10}
                        max={25}
                        onChange={(v) => updateConfig({ tiebreakPoints: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">{t('config.tiebreakMinLead')}</span>
                      <Stepper
                        value={config.tiebreakMinLead}
                        min={1}
                        max={5}
                        onChange={(v) => updateConfig({ tiebreakMinLead: v })}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Language */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('config.language')}
                </h3>
                <div className="flex gap-2">
                  {(['en', 'es'] as const).map((code) => (
                    <button
                      key={code}
                      onClick={() => i18n.changeLanguage(code)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        currentLang === code ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {code === 'en' ? 'English' : 'Español'}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="space-y-3 border-t border-slate-800 px-6 py-4 pb-8">
              <button
                onClick={handleStart}
                className="w-full rounded-2xl bg-green-600 py-4 text-lg font-bold text-white active:scale-95 transition-transform"
              >
                {t('home.startMatch')}
              </button>
              <button
                onClick={resetToDefaults}
                className="w-full py-2 text-sm text-slate-500 active:text-slate-300"
              >
                {t('config.useDefaults')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
