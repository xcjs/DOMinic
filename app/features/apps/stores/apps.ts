import { defineStore } from "pinia";
import { listApps, onRegistryChange } from "../registry";

let revision = 0;
onRegistryChange(() => {
  revision++;
});

// The registry module owns the installed-apps state (ADR 0003: one source
// of truth). This store stays as the reactive face the shell reads; the
// getter re-derives from the registry, keyed on a revision counter bumped
// by registry mutations.
export const useAppsStore = defineStore("apps", {
  state: () => ({ revision }),
  getters: {
    installed(state): { id: string; title: string; icon: string; description: string; entry: string }[] {
      void state.revision;
      return [...listApps()];
    },
  },
});