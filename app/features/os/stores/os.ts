import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AppDefinition, WindowInstance } from '../types'

const DEFAULT_WIDTH = 620
const DEFAULT_HEIGHT = 430

export const useOsStore = defineStore('os', () => {
  const apps = ref<AppDefinition[]>([])
  const windows = ref<WindowInstance[]>([])
  const focusedWindowId = ref<string | null>(null)
  const nextZIndex = ref(10)

  const visibleWindows = computed(() => windows.value.filter((window) => !window.minimized))
  const openWindows = computed(() => windows.value.filter((window) => !window.minimized))

  function registerApps(definitions: AppDefinition[]) {
    apps.value = definitions
  }

  function launchApp(app: AppDefinition) {
    const existing = windows.value.find((window) => window.appId === app.id)
    if (existing) {
      existing.minimized = false
      focusWindow(existing.id)
      return existing.id
    }

    const offset = (windows.value.length * 28) % 180
    const id = `${app.id}-${Date.now()}`
    windows.value.push({
      id,
      appId: app.id,
      title: app.name,
      icon: app.icon,
      x: 80 + offset,
      y: 64 + offset,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      zIndex: ++nextZIndex.value,
      minimized: false,
      maximized: false,
    })
    focusedWindowId.value = id
    return id
  }

  function focusWindow(id: string) {
    const window = windows.value.find((item) => item.id === id)
    if (!window) return
    window.minimized = false
    window.zIndex = ++nextZIndex.value
    focusedWindowId.value = id
  }

  function minimizeWindow(id: string) {
    const window = windows.value.find((item) => item.id === id)
    if (!window) return
    window.minimized = true
    if (focusedWindowId.value === id) focusedWindowId.value = null
  }

  function toggleMaximize(id: string) {
    const window = windows.value.find((item) => item.id === id)
    if (!window) return
    window.maximized = !window.maximized
    focusWindow(id)
  }

  function closeWindow(id: string) {
    windows.value = windows.value.filter((window) => window.id !== id)
    if (focusedWindowId.value === id) focusedWindowId.value = null
  }

  function moveWindow(id: string, x: number, y: number) {
    const window = windows.value.find((item) => item.id === id)
    if (!window || window.maximized) return
    window.x = Math.max(0, x)
    window.y = Math.max(0, y)
  }

  return {
    apps,
    windows,
    focusedWindowId,
    visibleWindows,
    openWindows,
    registerApps,
    launchApp,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    closeWindow,
    moveWindow,
  }
})
