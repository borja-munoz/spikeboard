export type Team = 'A' | 'B'

export interface MatchConfig {
  setsToWin: number
  pointsPerSet: number
  minLead: number
  tiebreakPoints: number
  tiebreakMinLead: number
  teamNames: [string, string]
  teamColors: [string, string]
}

export const DEFAULT_CONFIG: MatchConfig = {
  setsToWin: 2,
  pointsPerSet: 25,
  minLead: 2,
  tiebreakPoints: 15,
  tiebreakMinLead: 2,
  teamNames: ['Team A', 'Team B'],
  teamColors: ['#3b82f6', '#ef4444'],
}

export interface SetScore {
  A: number
  B: number
  winner: Team | null
}

export interface MatchState {
  config: MatchConfig
  sets: SetScore[]
  currentSetIndex: number
  setsWon: { A: number; B: number }
  serving: Team
  matchWinner: Team | null
}
