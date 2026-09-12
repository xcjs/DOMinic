<script setup lang="ts">
import { onMounted, reactive, ref, type ComponentPublicInstance } from "vue";
import { useOsStore } from "./features/os/stores/os";
import { useAppsStore } from "./features/apps/stores/apps";
import WindowFrame from "./features/os/components/WindowFrame.vue";
import Taskbar from "./features/os/components/Taskbar.vue";
import ChatWindow from "./features/chat/components/ChatWindow.vue";
import SettingsApp from "./features/settings/components/SettingsApp.vue";
import DynamicAppRunner from "./features/apps/runner/DynamicAppRunner.vue";
import { removeAppStyles } from "./features/apps/runner/loader";
import { getApp, hydrateRegistry, listApps, registerApp, unregisterApp } from "./features/apps/registry";
import { installFixture } from "./features/apps/fixtures";
import { readFile, writeFile } from "./features/shared/vfs";
import { useSettingsStore } from "./features/settings/stores/settings";
import type { InstallAppParams, UpdateAppParams } from "./features/chat/tools/schemas";

const os = useOsStore();
const apps = useAppsStore();
const settings = useSettingsStore();
const chat = ref<InstanceType<typeof ChatWindow> | null>(null);
const now = ref<string | null>(null);
const sourceVersion = reactive<Record<string, number>>({});

onMounted(() => {
  const tick = () => {
    now.value = new Date().toLocaleTimeString();
  };
  tick();
  setInterval(tick, 1000);
  settings.hydrate();
  apps.installed = hydrateRegistry();
  openBuiltin('chat');

  if (import.meta.client) {
    (window as any).__dominicReset = () => {
      settings.resetOs();
      window.location.reload();
    };
    (window as any).__dominic = {
      reset: (window as any).__dominicReset,
      installApp,
      updateApp,
      openApp,
      installFixture: (fixtureId: string) => {
        const ok = installFixture(fixtureId);
        if (ok) {
          apps.installed = listApps();
          openApp(fixtureId);
        }
        return ok;
      },
    };
  }
});

function openBuiltin(appId: 'chat' | 'settings') {
  if (os.windows.some((win) => win.appId === appId)) return;
  os.openWindow({ appId, title: appId === 'chat' ? 'Agent Chat' : 'Settings', width: appId === 'chat' ? 520 : 480, height: 560 });
}

function openApp(appId: string) {
  const app = getApp(appId);
  if (!app) return;
  const existing = os.windows.find((win) => win.appId === appId);
  if (existing) {
    os.focusWindow(existing.id);
    return;
  }
  os.openWindow({ appId, title: app.title, width: 520, height: 400 });
}

function uninstallApp(appId: string) {
  const app = getApp(appId);
  if (!app) return;
  if (!window.confirm(`Uninstall "${app.title}"? Its source will be removed from the VFS.`)) return;
  for (const win of os.windows.filter((w) => w.appId === appId)) {
    os.closeWindow(win.id);
  }
  unregisterApp(appId);
  apps.installed = listApps();
  delete sourceVersion[appId];
}

function viewSource(appId: string) {
  const app = getApp(appId);
  if (!app) return;
  const win = os.windows.find((w) => w.appId === `source:${appId}`);
  if (win) {
    os.focusWindow(win.id);
    return;
  }
  os.openWindow({ appId: `source:${appId}`, title: `Source - ${app.title}`, width: 640, height: 480 });
}

function installApp(params: InstallAppParams) {
  const entry = `apps/${params.id}/index.vue`;
  writeFile(entry, params.vueSfcCode);
  registerApp({ id: params.id, title: params.title, icon: params.icon, description: params.description, entry });
  apps.installed = listApps();
  sourceVersion[params.id] = Date.now();
}

function updateApp(params: UpdateAppParams) {
  const app = getApp(params.id);
  if (!app) throw new Error(`App "${params.id}" is not installed`);
  writeFile(app.entry, params.vueSfcCode);
  removeAppStyles(params.id);
  sourceVersion[params.id] = Date.now();
}

function askFix(payload: { appId: string; error: string }) {
  chat.value?.sendMessage(`The app ${payload.appId} encountered an error: ${payload.error}. Please fix it.`);
}

function setChat(instance: Element | ComponentPublicInstance | null) {
  chat.value = instance as InstanceType<typeof ChatWindow> | null;
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
      <ChatWindow v-if="win.appId === 'chat'" :ref="setChat" :options="{ getProviderConfig: () => settings, getInstalledApps: () => apps.installed, onInstallApp: installApp, onUpdateApp: updateApp, onOpenWindow: openApp }" />
      <SettingsApp v-else-if="win.appId === 'settings'" />
      <pre
        v-else-if="win.appId?.startsWith('source:')"
        class="h-full overflow-auto rounded bg-slate-950/80 p-3 font-mono text-[11px] leading-relaxed text-emerald-200"
      >{{ readFile(getApp(win.appId.slice('source:'.length))?.entry || '') || '// Source not found in VFS.' }}</pre>
      <DynamicAppRunner
        v-else-if="win.appId && getApp(win.appId)"
        :key="win.id + ':' + (sourceVersion[win.appId] ?? 0)"
        :app-id="win.appId"
        :window-id="win.id"
        :source-code="readFile(getApp(win.appId)?.entry || '') || ''"
        @ask-fix="askFix"
      />
      <p v-else class="text-sm text-slate-400">{{ win.title }}</p>
    </WindowFrame>

    <Taskbar
      :apps="apps.installed"
      :on-open-app="openApp"
      :on-view-source="viewSource"
      :on-uninstall-app="uninstallApp"
    />

    <div class="absolute right-4 top-4 z-50 flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/90 p-3 backdrop-blur">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">System</span>
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
