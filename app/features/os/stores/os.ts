import { defineStore } from "pinia";

export const useOsStore = defineStore("os", {
  state: () => ({
    windows: [] as string[],
    focused: null as string | null,
  }),
});