import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMatchStore } from './store/matchStore'
import { MatchHeader } from './components/MatchHeader'
import { ScorePanel } from './components/ScorePanel'
import { ConfigSheet } from './components/ConfigSheet'
import { SetWinOverlay } from './components/SetWinOverlay'
import { MatchWinOverlay } from './components/MatchWinOverlay'
import { UpdatePrompt } from './components/UpdatePrompt'

function App() {
  const [showConfig, setShowConfig] = useState(false)
  const { matchWinner, resetMatch } = useMatchStore()

  const handleNewMatch = () => {
    resetMatch()
    setShowConfig(true)
  }

  return (
    <div className="flex h-dvh flex-col bg-[#07080d] overflow-hidden">
      <MatchHeader onOpenConfig={() => setShowConfig(true)} />
      <div className="flex flex-1 overflow-hidden">
        <ScorePanel team="A" />
        <div className="w-px bg-slate-700" />
        <ScorePanel team="B" />
      </div>

      <SetWinOverlay />

      <AnimatePresence>
        {matchWinner && <MatchWinOverlay key="match-win" onNewMatch={handleNewMatch} />}
      </AnimatePresence>

      <UpdatePrompt />

      <ConfigSheet isOpen={showConfig} onClose={() => setShowConfig(false)} />
    </div>
  )
}

export default App
