<script setup lang="ts">
import { useOsStore } from "../stores/os";

const store = useOsStore();
const props = defineProps<{
  apps: { id: string; title: string; icon: string }[];
  onOpenApp: (appId: string) => void;
}>();

function isRunning(appId: string): boolean {
  return store.windows.some((win) => win.appId === appId && !win.minimized);
}

function onTaskbarClick(id: string): void {
  const win = store.windows.find((w) => w.id === id);
  if (!win) return;
  if (win.minimized || store.focusedId !== id) {
    store.focusWindow(id);
  } else {
    store.toggleMinimize(id);
  }
}
</script>

<template>
  <footer class="absolute bottom-0 left-0 right-0 z-40 flex h-12 items-center gap-2 border-t border-white/10 bg-slate-950/90 px-3 backdrop-blur">
    <span class="text-sm font-bold tracking-tight text-indigo-300">DOMinic</span>
    <span class="mx-2 h-6 w-px bg-white/10" />
    <button
      v-for="app in props.apps"
      :key="app.id"
      class="flex items-center gap-1.5 rounded border border-white/10 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
      @click="props.onOpenApp(app.id)"
    >
      <span aria-hidden="true">{{ app.icon }}</span>
      <span class="max-w-28 truncate">{{ app.title }}</span>
      <span
        class="h-1.5 w-1.5 rounded-full"
        :class="isRunning(app.id) ? 'bg-emerald-400' : 'bg-slate-600'"
        :aria-label="isRunning(app.id) ? 'Running' : 'Not running'"
      />
    </button>
    <span v-if="props.apps.length" class="h-6 w-px bg-white/10" />
    <button
      v-for="win in store.windows"
      :key="win.id"
      class="max-w-48 truncate rounded border px-3 py-1 text-xs transition-colors"
      :class="
        win.minimized
          ? 'border-white/10 bg-slate-900 text-slate-400 hover:text-slate-100'
          : store.focusedId === win.id
            ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100'
            : 'border-white/10 bg-slate-800 text-slate-200 hover:bg-slate-700'
      "
      @click="onTaskbarClick(win.id)"
    >
      {{ win.title }}
    </button>
  </footer>
</template>
