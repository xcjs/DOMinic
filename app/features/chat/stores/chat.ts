import { defineStore } from "pinia";

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [] as { role: "user" | "assistant"; content: string }[],
  }),
});