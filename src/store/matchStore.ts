import { create } from 'zustand'
import type { Team, MatchConfig, MatchState, SetScore } from '../types/match'
import { DEFAULT_CONFIG } from '../types/match'

/** Read persisted MatchConfig from settingsStore's localStorage entry on startup. */
function getStoredConfig(): MatchConfig {
  try {
    const raw = localStorage.getItem('spikeboard-settings')
    if (raw) {
      const { state } = JSON.parse(raw) as { state?: { config?: MatchConfig } }
      if (state?.config) return { ...DEFAULT_CONFIG, ...state.config }
    }
  } catch {
    // ignore — fall through to default
  }
  return DEFAULT_CONFIG
}

function isTiebreakSet(setIndex: number, config: MatchConfig): boolean {
  const maxSets = config.setsToWin * 2 - 1
  return maxSets > 1 && setIndex === maxSets - 1
}

function checkSetWinner(score: SetScore, setIndex: number, config: MatchConfig): Team | null {
  const tb = isTiebreakSet(setIndex, config)
  const target = tb ? config.tiebreakPoints : config.pointsPerSet
  const minLead = tb ? config.tiebreakMinLead : config.minLead

  for (const team of ['A', 'B'] as Team[]) {
    const other: Team = team === 'A' ? 'B' : 'A'
    if (score[team] >= target && score[team] - score[other] >= minLead) {
      return team
    }
  }
  return null
}

function emptySet(): SetScore {
  return { A: 0, B: 0, winner: null }
}

function initialState(config: MatchConfig = DEFAULT_CONFIG): MatchState {
  return {
    config,
    sets: [emptySet()],
    currentSetIndex: 0,
    setsWon: { A: 0, B: 0 },
    serving: 'A',
    matchWinner: null,
  }
}

interface MatchStore extends MatchState {
  addPoint: (team: Team) => void
  removePoint: (team: Team) => void
  switchServing: () => void
  resetMatch: () => void
  startMatch: (config: MatchConfig) => void
  updateTeamName: (team: Team, name: string) => void
  assignSet: (team: Team) => void
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState(getStoredConfig()),

  addPoint: (team: Team) => {
    const state = get()
    if (state.matchWinner) return

    const { sets, currentSetIndex, config, setsWon } = state
    const currentSet = sets[currentSetIndex]

    const newScore: SetScore = { ...currentSet, [team]: currentSet[team] + 1 }
    const setWinner = checkSetWinner(newScore, currentSetIndex, config)

    if (setWinner) {
      newScore.winner = setWinner
      const newSetsWon = { ...setsWon, [setWinner]: setsWon[setWinner] + 1 }
      const newSets = [...sets]
      newSets[currentSetIndex] = newScore

      if (newSetsWon[setWinner] >= config.setsToWin) {
        set({ sets: newSets, setsWon: newSetsWon, matchWinner: setWinner })
      } else {
        set({
          sets: [...newSets, emptySet()],
          currentSetIndex: currentSetIndex + 1,
          setsWon: newSetsWon,
        })
      }
    } else {
      const newSets = [...sets]
      newSets[currentSetIndex] = newScore
      set({ sets: newSets })
    }
  },

  removePoint: (team: Team) => {
    const state = get()
    if (state.matchWinner) return

    const { sets, currentSetIndex } = state
    const currentSet = sets[currentSetIndex]
    if (currentSet.winner || currentSet[team] === 0) return

    const newSets = [...sets]
    newSets[currentSetIndex] = { ...currentSet, [team]: currentSet[team] - 1 }
    set({ sets: newSets })
  },

  switchServing: () => {
    set(state => ({ serving: state.serving === 'A' ? 'B' : 'A' }))
  },

  resetMatch: () => {
    set(initialState(get().config))
  },

  startMatch: (config: MatchConfig) => {
    set(initialState(config))
  },

  updateTeamName: (team: Team, name: string) => {
    const { config } = get()
    const teamNames: [string, string] =
      team === 'A' ? [name, config.teamNames[1]] : [config.teamNames[0], name]
    set({ config: { ...config, teamNames } })
  },

  assignSet: (team: Team) => {
    const state = get()
    if (state.matchWinner) return

    const { sets, currentSetIndex, config, setsWon } = state
    const newSets = [...sets]
    newSets[currentSetIndex] = { ...newSets[currentSetIndex], winner: team }
    const newSetsWon = { ...setsWon, [team]: setsWon[team] + 1 }

    if (newSetsWon[team] >= config.setsToWin) {
      set({ sets: newSets, setsWon: newSetsWon, matchWinner: team })
    } else {
      set({
        sets: [...newSets, emptySet()],
        currentSetIndex: currentSetIndex + 1,
        setsWon: newSetsWon,
      })
    }
  },
}))
