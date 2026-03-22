import { useMatchStore } from '../store/matchStore'
import type { Team } from '../types/match'

interface Props {
  team: Team
}

export function ScorePanel({ team }: Props) {
  const { sets, currentSetIndex, setsWon, serving, config, matchWinner, addPoint, removePoint, switchServing } =
    useMatchStore()

  const currentScore = sets[currentSetIndex][team]
  const teamName = config.teamNames[team === 'A' ? 0 : 1]
  const isServing = serving === team
  const setsWonCount = setsWon[team]
  const isWinner = matchWinner === team
  const isDisabled = !!matchWinner

  return (
    <div
      className={[
        'relative flex flex-1 flex-col items-center justify-between py-8 px-4 select-none',
        team === 'A' ? 'bg-slate-800' : 'bg-slate-700',
        isWinner ? 'bg-amber-900!' : '',
      ].join(' ')}
    >
      {/* Team name + serving indicator */}
      <button
        onClick={switchServing}
        className="flex items-center gap-2 rounded-xl px-3 py-1 active:bg-slate-600"
        aria-label={`Switch serving to ${teamName}`}
      >
        {isServing && <span className="text-yellow-400 text-lg leading-none">●</span>}
        <span className="text-lg font-semibold text-slate-200">{teamName}</span>
        {!isServing && <span className="w-5" />}
      </button>

      {/* Sets won indicators */}
      <div className="flex gap-2">
        {Array.from({ length: config.setsToWin }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full ${i < setsWonCount ? 'bg-yellow-400' : 'bg-slate-500'}`}
          />
        ))}
      </div>

      {/* Current set score */}
      <div className="text-[clamp(6rem,20vw,10rem)] font-bold tabular-nums leading-none text-white">
        {currentScore}
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => addPoint(team)}
          disabled={isDisabled}
          className="h-16 w-28 rounded-2xl bg-green-600 text-3xl font-bold text-white active:scale-95 disabled:opacity-30 transition-transform"
        >
          +1
        </button>
        <button
          onClick={() => removePoint(team)}
          disabled={isDisabled}
          className="h-10 w-20 rounded-xl bg-slate-600 text-base font-semibold text-slate-300 active:scale-95 disabled:opacity-30 transition-transform"
        >
          −1
        </button>
      </div>

      {/* Match winner banner */}
      {isWinner && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-yellow-300 bg-amber-900/80 px-4 py-2 rounded-xl">
            🏆
          </span>
        </div>
      )}
    </div>
  )
}
