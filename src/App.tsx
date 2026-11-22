import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMatchStore } from './store/matchStore'
import { useHistoryStore } from './store/historyStore'
import { useWakeLock } from './hooks/useWakeLock'
import { useSounds } from './hooks/useSounds'
import { MatchHeader } from './components/MatchHeader'
import { ScorePanel } from './components/ScorePanel'
import { ConfigSheet } from './components/ConfigSheet'
import { HistorySheet } from './components/HistorySheet'
import { SetWinOverlay } from './components/SetWinOverlay'
import { MatchWinOverlay } from './components/MatchWinOverlay'
import { UpdatePrompt } from './components/UpdatePrompt'

function App() {
  const [showConfig, setShowConfig] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { matchWinner, sets, setsWon, config, resetMatch } = useMatchStore()
  const { addRecord } = useHistoryStore()
  const prevWinnerRef = useRef<string | null>(null)

  // Wake lock: keep screen on while a match is active
  useWakeLock(!matchWinner && sets.some(s => s.A > 0 || s.B > 0))

  // Sound effects
  useSounds()

  // Persist match to history when it ends
  useEffect(() => {
    if (matchWinner && prevWinnerRef.current === null) {
      addRecord({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        teamNames: config.teamNames,
        teamColors: config.teamColors,
        sets: sets
          .filter((s) => s.winner !== null)
          .map((s) => ({ A: s.A, B: s.B, winner: s.winner! })),
        setsWon: { ...setsWon },
        winner: matchWinner,
      })
    }
    prevWinnerRef.current = matchWinner
  }, [matchWinner, sets, setsWon, config, addRecord])

  const handleNewMatch = () => {
    resetMatch()
    setShowConfig(true)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#07080d] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <MatchHeader
        onOpenConfig={() => setShowConfig(true)}
        onOpenHistory={() => setShowHistory(true)}
      />
      {/* Side by side in landscape; stacked in portrait so each score gets the full width */}
      <div className="flex min-h-0 flex-1 overflow-hidden portrait:flex-col">
        <ScorePanel team="A" />
        <div className="w-px shrink-0 bg-slate-600 portrait:h-px portrait:w-auto" />
        <ScorePanel team="B" />
      </div>

      <SetWinOverlay />

      <AnimatePresence>
        {matchWinner && <MatchWinOverlay key="match-win" onNewMatch={handleNewMatch} />}
      </AnimatePresence>

      <UpdatePrompt />

      <ConfigSheet isOpen={showConfig} onClose={() => setShowConfig(false)} />
      <HistorySheet isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  )
}

export default App
