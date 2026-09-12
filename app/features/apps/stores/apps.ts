import { defineStore } from "pinia";

export const useAppsStore = defineStore("apps", {
  state: () => ({
    installed: [] as { id: string; title: string; icon: string; description: string; entry: string }[],
  }),
});
