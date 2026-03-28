import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MatchRecord } from '../types/history'

interface HistoryStore {
  records: MatchRecord[]
  addRecord: (record: MatchRecord) => void
  deleteRecord: (id: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({ records: [record, ...state.records] })),
      deleteRecord: (id) =>
        set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
      clearHistory: () => set({ records: [] }),
    }),
    { name: 'spikeboard-history' },
  ),
)
