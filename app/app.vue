<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useOsStore } from "./features/os/stores/os";
import { useAppsStore } from "./features/apps/stores/apps";
import WindowFrame from "./features/os/components/WindowFrame.vue";
import Taskbar from "./features/os/components/Taskbar.vue";
import ChatWindow from "./features/chat/components/ChatWindow.vue";
import SettingsApp from "./features/settings/components/SettingsApp.vue";
import DynamicAppRunner from "./features/apps/runner/DynamicAppRunner.vue";
import { getApp, hydrateRegistry, listApps, registerApp } from "./features/apps/registry";
import { readFile, writeFile } from "./features/shared/vfs";
import { useSettingsStore } from "./features/settings/stores/settings";
import type { InstallAppParams, UpdateAppParams } from "./features/chat/tools/schemas";

const os = useOsStore();
const apps = useAppsStore();
const settings = useSettingsStore();
const chat = ref<InstanceType<typeof ChatWindow> | null>(null);
const now = ref<string | null>(null);

onMounted(() => {
  const tick = () => {
    now.value = new Date().toLocaleTimeString();
  };
  tick();
  setInterval(tick, 1000);
  settings.hydrate();
  apps.installed = hydrateRegistry();
  openBuiltin('chat');
});

function openBuiltin(appId: 'chat' | 'settings') {
  if (os.windows.some((win) => win.appId === appId)) return;
  os.openWindow({ appId, title: appId === 'chat' ? 'Agent Chat' : 'Settings', width: appId === 'chat' ? 520 : 480, height: 560 });
}

function openApp(appId: string) {
  const app = getApp(appId);
  if (!app) return;
  os.openWindow({ appId, title: app.title, width: 520, height: 400 });
}

function installApp(params: InstallAppParams) {
  const entry = `apps/${params.id}/index.vue`;
  writeFile(entry, params.vueSfcCode);
  registerApp({ id: params.id, title: params.title, icon: params.icon, description: params.description, entry });
  apps.installed = listApps();
}

function updateApp(params: UpdateAppParams) {
  const app = getApp(params.id);
  if (!app) throw new Error(`App "${params.id}" is not installed`);
  writeFile(app.entry, params.vueSfcCode);
}

function askFix(payload: { appId: string; error: string }) {
  chat.value?.sendMessage(`The app ${payload.appId} encountered an error: ${payload.error}. Please fix it.`);
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
      <ChatWindow v-if="win.appId === 'chat'" ref="chat" :options="{ getProviderConfig: () => settings, getInstalledApps: () => apps.installed, onInstallApp: installApp, onUpdateApp: updateApp, onOpenWindow: openApp }" />
      <SettingsApp v-else-if="win.appId === 'settings'" />
      <DynamicAppRunner v-else-if="win.appId && getApp(win.appId)" :app-id="win.appId" :window-id="win.id" :source-code="readFile(getApp(win.appId)?.entry || '') || ''" @ask-fix="askFix" />
      <p v-else class="text-sm text-slate-400">{{ win.title }}</p>
    </WindowFrame>

    <Taskbar />

    <div class="absolute right-4 top-4 z-50 flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/90 p-3 backdrop-blur">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Launch</span>
      <button
        v-for="app in apps.installed"
        :key="app.id"
        class="rounded border border-white/10 bg-slate-800 px-3 py-1.5 text-left text-xs text-slate-100 hover:bg-slate-700"
        @click="openApp(app.id)"
      >
        {{ app.title }}
      </button>
      <button
        class="rounded border border-dashed border-white/20 px-3 py-1.5 text-left text-xs text-slate-400 hover:text-slate-100"
        @click="openBuiltin('settings')"
      >
        Settings
      </button>
    </div>

    <span class="absolute right-4 bottom-16 z-50 text-xs text-slate-400">{{ now ?? "" }}</span>
  </div>
</template>
