import { ref } from 'vue'
import { readFile, writeFile, deleteFile } from '../../shared/vfs'
import { removeAppStyles } from '../runner/loader'

export interface AppMeta {
  id: string
  title: string
  icon: string
  description: string
  entry: string
  createdAt?: number
  updatedAt?: number
}

const REGISTRY_PATH = 'registry.json'
const appsState = ref<AppMeta[]>([])
let isHydrated = false

// Notifies reactive consumers (the apps Pinia store getter) that registry
// state changed. Hydration, register and unregister all bump it.
const listeners: Array<() => void> = []

export function onRegistryChange(fn: () => void): void {
  listeners.push(fn)
}

function notify(): void {
  for (const fn of listeners) fn()
}

export function hydrateRegistry(): AppMeta[] {
  try {
    const raw = readFile(REGISTRY_PATH)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        appsState.value = parsed
        isHydrated = true
        notify()
        return appsState.value
      }
    }
  } catch (err) {
    console.error('[Registry] Failed to hydrate app registry from VFS:', err)
  }
  appsState.value = []
  isHydrated = true
  return []
}

function persist(): void {
  try {
    writeFile(REGISTRY_PATH, JSON.stringify(appsState.value, null, 2))
  } catch (err) {
    console.error('[Registry] Failed to save app registry to VFS:', err)
  }
}

export function registerApp(meta: AppMeta): void {
  if (!isHydrated) hydrateRegistry()

  const existingIndex = appsState.value.findIndex((a) => a.id === meta.id)
  const now = Date.now()

  if (existingIndex >= 0) {
    const existing = appsState.value[existingIndex]
    appsState.value[existingIndex] = {
      ...existing,
      ...meta,
      updatedAt: now
    }
  } else {
    appsState.value.push({
      ...meta,
      createdAt: now,
      updatedAt: now
    })
  }

  persist()
  notify()
}

export function unregisterApp(id: string): void {
  if (!isHydrated) hydrateRegistry()
  removeAppStyles(id)
  const app = appsState.value.find((a) => a.id === id)
  if (app?.entry) {
    deleteFile(app.entry)
  }
  appsState.value = appsState.value.filter((a) => a.id !== id)
  persist()
  notify()
}

export function listApps(): AppMeta[] {
  if (!isHydrated) hydrateRegistry()
  return appsState.value
}

// Replaces the in-memory app registry with the state another tab synced
// via BroadcastChannel (NEXT.md 3.5), then persists and notifies.
// Entries carry meta only, never source; the importing tab reads source
// from the shared VFS (localStorage) once it needs to run the app.
export function importApps(metas: AppMeta[]): void {
  appsState.value = metas.map((meta) => ({
    ...meta,
    createdAt: meta.createdAt ?? Date.now(),
    updatedAt: meta.updatedAt ?? Date.now(),
  }))
  isHydrated = true
  persist()
  notify()
}

export function getApp(id: string): AppMeta | undefined {
  if (!isHydrated) hydrateRegistry()
  return appsState.value.find((a) => a.id === id)
}
