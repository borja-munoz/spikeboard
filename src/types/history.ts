import type { Team } from './match'

export interface SetResult {
  A: number
  B: number
  winner: Team
}

export interface MatchRecord {
  id: string
  date: string                    // ISO string
  teamNames: [string, string]
  teamColors: [string, string]
  sets: SetResult[]               // completed sets only (winner !== null)
  setsWon: { A: number; B: number }
  winner: Team
}
