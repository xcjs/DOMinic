import { ref } from 'vue'
import { readFile, writeFile, deleteFile } from '../../shared/vfs'

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

export function hydrateRegistry(): AppMeta[] {
  try {
    const raw = readFile(REGISTRY_PATH)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        appsState.value = parsed
        isHydrated = true
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
}

export function unregisterApp(id: string): void {
  if (!isHydrated) hydrateRegistry()
  const app = appsState.value.find((a) => a.id === id)
  if (app?.entry) {
    deleteFile(app.entry)
  }
  appsState.value = appsState.value.filter((a) => a.id !== id)
  persist()
}

export function listApps(): AppMeta[] {
  if (!isHydrated) hydrateRegistry()
  return appsState.value
}

export function getApp(id: string): AppMeta | undefined {
  if (!isHydrated) hydrateRegistry()
  return appsState.value.find((a) => a.id === id)
}
