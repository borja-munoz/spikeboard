import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MatchConfig } from '../types/match'
import { DEFAULT_CONFIG } from '../types/match'

interface SettingsStore {
  config: MatchConfig
  updateConfig: (partial: Partial<MatchConfig>) => void
  resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      updateConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),
      resetToDefaults: () => set({ config: DEFAULT_CONFIG }),
    }),
    { name: 'spikeboard-settings' },
  ),
)
