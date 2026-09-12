<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useOsStore } from "./features/os/stores/os";
import { useAppsStore } from "./features/apps/stores/apps";
import WindowFrame from "./features/os/components/WindowFrame.vue";
import Taskbar from "./features/os/components/Taskbar.vue";

const os = useOsStore();
const apps = useAppsStore();
const now = ref<string | null>(null);

onMounted(() => {
  const tick = () => {
    now.value = new Date().toLocaleTimeString();
  };
  tick();
  setInterval(tick, 1000);
});

function launchStubApp(title: string): void {
  os.openWindow({ title, width: 420, height: 280 });
}
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="text-center opacity-25">
        <h1 class="text-5xl font-bold tracking-tight">DOMinic</h1>
        <p class="mt-3 text-slate-400">An AI agent is the primary app author.</p>
      </div>
    </div>

    <WindowFrame v-for="win in os.windows" :key="win.id" :win="win">
      <p class="text-sm text-slate-400">{{ win.title }} &mdash; stub content (apps mount here).</p>
    </WindowFrame>

    <Taskbar />

    <div class="absolute right-4 top-4 z-50 flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/90 p-3 backdrop-blur">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Launch</span>
      <button
        v-for="app in apps.installed"
        :key="app.id"
        class="rounded border border-white/10 bg-slate-800 px-3 py-1.5 text-left text-xs text-slate-100 hover:bg-slate-700"
        @click="launchStubApp(app.title)"
      >
        {{ app.title }}
      </button>
      <button
        class="rounded border border-dashed border-white/20 px-3 py-1.5 text-left text-xs text-slate-400 hover:text-slate-100"
        @click="launchStubApp('Notes')"
      >
        + demo window
      </button>
    </div>

    <span class="absolute right-4 bottom-16 z-50 text-xs text-slate-400">{{ now ?? "" }}</span>
  </div>
</template>