import { deleteFile, readFile, writeFile } from '../shared/vfs'

const REGISTRY_PATH = '/system/apps-registry.json'

export interface AppMeta {
  id: string
  title: string
  icon: string
  description: string
  entry: string
}

function readRegistry(): AppMeta[] {
  const source = readFile(REGISTRY_PATH)
  if (!source) return []
  try {
    const parsed: unknown = JSON.parse(source)
    return Array.isArray(parsed) ? parsed.filter(isAppMeta) : []
  } catch {
    return []
  }
}

function isAppMeta(value: unknown): value is AppMeta {
  if (!value || typeof value !== 'object') return false
  const app = value as Record<string, unknown>
  return ['id', 'title', 'icon', 'description', 'entry'].every((key) => typeof app[key] === 'string')
}

function saveRegistry(apps: AppMeta[]): void {
  writeFile(REGISTRY_PATH, JSON.stringify(apps))
}

export function registerApp(app: AppMeta): void {
  const apps = readRegistry().filter((existing) => existing.id !== app.id)
  apps.push(app)
  saveRegistry(apps)
}

export function unregisterApp(id: string): void {
  const app = readRegistry().find((existing) => existing.id === id)
  if (app) deleteFile(app.entry)
  saveRegistry(readRegistry().filter((existing) => existing.id !== id))
}

export function listApps(): AppMeta[] {
  return readRegistry()
}

export function installApp(app: AppMeta, source: string): void {
  writeFile(app.entry, source)
  registerApp(app)
}

export function updateApp(id: string, source: string): void {
  const app = readRegistry().find((existing) => existing.id === id)
  if (!app) throw new Error(`App "${id}" is not installed`)
  writeFile(app.entry, source)
}
