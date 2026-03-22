import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { MatchHeader } from './components/MatchHeader'
import { ScorePanel } from './components/ScorePanel'

type View = 'home' | 'playing'

function App() {
  const [view, setView] = useState<View>('home')

  if (view === 'home') {
    return <HomeScreen onStart={() => setView('playing')} />
  }

  return (
    <div className="flex h-screen flex-col bg-slate-900 overflow-hidden">
      <MatchHeader onReset={() => setView('home')} />
      <div className="flex flex-1">
        <ScorePanel team="A" />
        <div className="w-px bg-slate-600" />
        <ScorePanel team="B" />
      </div>
    </div>
  )
}

export default App
