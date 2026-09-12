<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useOsStore } from '../stores/os'
import type { AppDefinition } from '../types'
import Taskbar from './Taskbar.vue'
import WindowFrame from './WindowFrame.vue'

const props = withDefaults(defineProps<{ apps?: AppDefinition[] }>(), { apps: () => [] })
const os = useOsStore()
const registeredApps = computed(() => props.apps.length ? props.apps : os.apps)
onMounted(() => { if (props.apps.length) os.registerApps(props.apps) })
</script>

<template>
  <main class="desktop-shell">
    <div class="desktop-shell__aurora" aria-hidden="true" />
    <section class="desktop-shell__welcome">
      <p>DOMinic OS</p><h1>Your ideas, installed.</h1><span>Ask the agent to create an app, then use it like native software.</span>
    </section>
    <WindowFrame v-for="item in os.visibleWindows" :key="item.id" :window="item" :focused="os.focusedWindowId === item.id" @focus="os.focusWindow(item.id)" @minimize="os.minimizeWindow(item.id)" @maximize="os.toggleMaximize(item.id)" @close="os.closeWindow(item.id)" @move="(x, y) => os.moveWindow(item.id, x, y)">
      <slot :name="`window-${item.appId}`" :window="item"><div class="desktop-shell__placeholder">{{ item.title }} is ready to connect.</div></slot>
    </WindowFrame>
    <Taskbar :apps="registeredApps" :windows="os.windows" @launch="os.launchApp" @focus="os.focusWindow" />
  </main>
</template>

<style scoped>
.desktop-shell { position: relative; min-height: 100dvh; overflow: hidden; background: radial-gradient(circle at 20% 10%, #1d4ed8 0, transparent 32%), radial-gradient(circle at 82% 80%, #7e22ce 0, transparent 30%), #020617; color: #f8fafc; }
.desktop-shell__aurora { position: absolute; inset: -20%; background: linear-gradient(115deg, transparent 30%, rgb(34 211 238 / .15), transparent 55%); transform: rotate(-15deg); pointer-events: none; }
.desktop-shell__welcome { position: relative; max-width: 510px; padding: clamp(42px, 10vw, 120px); }
.desktop-shell__welcome p { margin: 0; color: #67e8f9; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.desktop-shell__welcome h1 { margin: 10px 0; font-size: clamp(38px, 7vw, 78px); line-height: .95; letter-spacing: -.06em; }
.desktop-shell__welcome span { color: #cbd5e1; font-size: 17px; line-height: 1.5; }
.desktop-shell__placeholder { display: grid; min-height: 100%; place-items: center; padding: 28px; color: #94a3b8; }
</style>
