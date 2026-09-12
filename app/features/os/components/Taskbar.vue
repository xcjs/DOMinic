<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { AppDefinition, WindowInstance } from '../types'

const props = defineProps<{ apps: AppDefinition[]; windows: WindowInstance[] }>()
const emit = defineEmits<{ launch: [app: AppDefinition]; focus: [id: string] }>()
const launcherOpen = ref(false)
const now = ref(new Date())
const clock = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = window.setInterval(() => { now.value = new Date() }, 30_000) })
onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <nav class="taskbar" aria-label="DOMinic taskbar">
    <div class="taskbar__launcher">
      <button class="taskbar__brand" aria-label="Open app launcher" @click="launcherOpen = !launcherOpen">✦ DOMinic</button>
      <div v-if="launcherOpen" class="taskbar__menu">
        <button v-for="app in apps" :key="app.id" @click="emit('launch', app); launcherOpen = false">
          <span>{{ app.icon }}</span>{{ app.name }}
        </button>
      </div>
    </div>
    <div class="taskbar__windows" aria-label="Open windows">
      <button v-for="item in windows" :key="item.id" :class="{ 'taskbar__window--minimized': item.minimized }" @click="emit('focus', item.id)">
        {{ item.icon }} <span>{{ item.title }}</span>
      </button>
    </div>
    <time class="taskbar__clock">{{ clock }}</time>
  </nav>
</template>

<style scoped>
.taskbar { position: fixed; z-index: 9999; right: 12px; bottom: 12px; left: 12px; display: flex; gap: 8px; align-items: center; min-height: 52px; padding: 6px; border: 1px solid rgb(148 163 184 / .32); border-radius: 14px; background: rgb(15 23 42 / .78); box-shadow: 0 12px 40px rgb(2 6 23 / .45); backdrop-filter: blur(18px); color: #f8fafc; }
button { border: 0; border-radius: 9px; background: transparent; color: inherit; cursor: pointer; }
.taskbar__brand { padding: 10px 12px; background: linear-gradient(135deg, #7c3aed, #0ea5e9); font-weight: 700; }
.taskbar__launcher { position: relative; }
.taskbar__menu { position: absolute; bottom: calc(100% + 10px); left: 0; display: grid; min-width: 210px; padding: 6px; border: 1px solid rgb(148 163 184 / .32); border-radius: 12px; background: rgb(15 23 42 / .96); box-shadow: 0 12px 40px rgb(2 6 23 / .55); }
.taskbar__menu button { display: flex; gap: 10px; padding: 11px; text-align: left; }
.taskbar__menu button:hover, .taskbar__window:hover { background: rgb(148 163 184 / .2); }
.taskbar__windows { display: flex; flex: 1; gap: 5px; overflow-x: auto; }
.taskbar__window { padding: 9px 11px; white-space: nowrap; background: rgb(51 65 85 / .55); }
.taskbar__window--minimized { opacity: .55; }
.taskbar__clock { padding: 8px 10px; color: #cbd5e1; font-size: 13px; white-space: nowrap; }
@media (max-width: 767px) { .taskbar { right: 8px; bottom: 8px; left: 8px; } .taskbar__window span { display: none; } .taskbar__clock { display: none; } }
</style>
