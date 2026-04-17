import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MatchConfig } from '../types/match'
import { DEFAULT_CONFIG } from '../types/match'

interface SettingsStore {
  config: MatchConfig
  soundEnabled: boolean
  swipeHintSeen: boolean
  updateConfig: (partial: Partial<MatchConfig>) => void
  setSoundEnabled: (v: boolean) => void
  setSwipeHintSeen: () => void
  resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      soundEnabled: true,
      swipeHintSeen: false,
      updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setSwipeHintSeen: () => set({ swipeHintSeen: true }),
      resetToDefaults: () => set({ config: DEFAULT_CONFIG }),
    }),
    { name: 'spikeboard-settings' },
  ),
)
