const STORAGE_PREFIX = 'dominic:vfs:'

export interface VfsFile {
  path: string
  size: number
}

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

function normalizePath(path: string): string {
  const normalized = `/${path.trim().replace(/^\/+/, '')}`
  if (normalized.includes('..') || normalized === '/') {
    throw new Error('VFS path must be a non-root path without traversal')
  }
  return normalized
}

function storageKey(path: string): string {
  return `${STORAGE_PREFIX}${normalizePath(path)}`
}

export function writeFile(path: string, contents: string): void {
  storage()?.setItem(storageKey(path), contents)
}

export function readFile(path: string): string | null {
  return storage()?.getItem(storageKey(path)) ?? null
}

export function deleteFile(path: string): void {
  storage()?.removeItem(storageKey(path))
}

export function listFiles(directory = '/'): VfsFile[] {
  const target = directory.trim() === '/' ? '' : normalizePath(directory).replace(/\/$/, '')
  const prefix = `${STORAGE_PREFIX}${target}/`
  const localStorage = storage()
  if (!localStorage) return []

  const files: VfsFile[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(prefix)) continue
    const contents = localStorage.getItem(key) ?? ''
    files.push({ path: key.slice(STORAGE_PREFIX.length), size: contents.length })
  }
  return files.sort((left, right) => left.path.localeCompare(right.path))
}

export function resetVfs(): void {
  const localStorage = storage()
  if (!localStorage) return
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
  for (const key of keys) {
    if (key?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key)
  }
}
