import { defineStore } from 'pinia'
import { clearVfs, readFile, writeFile } from '../../shared/vfs'

export type LlmProvider = 'openai' | 'anthropic' | 'google' | 'deepseek'

export interface SettingsState {
  provider: LlmProvider
  model: string
  apiKey: string
  baseUrl: string
  hasHydrated: boolean
}

const SETTINGS_FILE = 'system/settings.json'

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    provider: 'openai',
    model: '',
    apiKey: '',
    baseUrl: '',
    hasHydrated: false
  }),

  actions: {
    hydrate() {
      if (this.hasHydrated) return
      try {
        const raw = readFile(SETTINGS_FILE)
        if (raw) {
          const saved = JSON.parse(raw)
          if (saved.provider) this.provider = saved.provider
          if (saved.model) this.model = saved.model
          if (saved.apiKey !== undefined) this.apiKey = saved.apiKey
          if (saved.baseUrl !== undefined) this.baseUrl = saved.baseUrl
        }
      } catch (err) {
        console.error('[Settings] Failed to hydrate settings from VFS:', err)
      }
      this.hasHydrated = true
    },

    saveSettings(updates: Partial<Omit<SettingsState, 'hasHydrated'>>) {
      if (updates.provider) this.provider = updates.provider
      if (updates.model) this.model = updates.model
      if (updates.apiKey !== undefined) this.apiKey = updates.apiKey
      if (updates.baseUrl !== undefined) this.baseUrl = updates.baseUrl

      try {
        writeFile(
          SETTINGS_FILE,
          JSON.stringify({
            provider: this.provider,
            model: this.model,
            apiKey: this.apiKey,
            baseUrl: this.baseUrl
          })
        )
      } catch (err) {
        console.error('[Settings] Failed to persist settings to VFS:', err)
      }
    },

    resetOs() {
      clearVfs()
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }
})
