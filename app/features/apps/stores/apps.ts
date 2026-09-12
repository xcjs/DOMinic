import { defineStore } from "pinia";
import { listApps, type AppMeta } from "../registry";

export const useAppsStore = defineStore("apps", {
  state: () => ({
    installed: [] as AppMeta[],
  }),
  actions: {
    hydrate() {
      this.installed = listApps();
    },
  },
});
