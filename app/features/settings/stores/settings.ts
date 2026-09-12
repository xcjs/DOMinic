import { defineStore } from "pinia";
import { readFile, writeFile } from "../../shared/vfs";

const SETTINGS_PATH = "/system/settings.json";

interface SettingsSnapshot {
  provider: string;
  apiKey: string;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    provider: "",
    apiKey: "",
  }),
  actions: {
    hydrate() {
      const raw = readFile(SETTINGS_PATH);
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as Partial<SettingsSnapshot>;
        this.provider = typeof saved.provider === "string" ? saved.provider : "";
        this.apiKey = typeof saved.apiKey === "string" ? saved.apiKey : "";
      } catch {
        // Ignore malformed local settings instead of blocking the OS boot.
      }
    },
    save(settings: SettingsSnapshot) {
      this.provider = settings.provider;
      this.apiKey = settings.apiKey;
      writeFile(SETTINGS_PATH, JSON.stringify(settings));
    },
  },
});
