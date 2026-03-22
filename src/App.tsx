import { MatchHeader } from './components/MatchHeader'
import { ScorePanel } from './components/ScorePanel'

function App() {
  return (
    <div className="flex h-screen flex-col bg-slate-900 overflow-hidden">
      <MatchHeader />
      <div className="flex flex-1">
        <ScorePanel team="A" />
        <div className="w-px bg-slate-600" />
        <ScorePanel team="B" />
      </div>
    </div>
  )
}

export default App
