import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t('app.name')}</h1>
        <p className="mt-2 text-slate-400">{t('home.startMatch')}</p>
      </div>
    </div>
  )
}

export default App
