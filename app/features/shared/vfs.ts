const VFS_PREFIX = 'dominic:vfs:'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path
}

export function writeFile(path: string, contents: string): void {
  if (!isBrowser()) return
  const key = `${VFS_PREFIX}${normalizePath(path)}`
  try {
    window.localStorage.setItem(key, contents)
  } catch (err) {
    console.error(`[VFS] Failed to write file "${path}":`, err)
  }
}

export function readFile(path: string): string | null {
  if (!isBrowser()) return null
  const key = `${VFS_PREFIX}${normalizePath(path)}`
  return window.localStorage.getItem(key)
}

export function deleteFile(path: string): void {
  if (!isBrowser()) return
  const key = `${VFS_PREFIX}${normalizePath(path)}`
  window.localStorage.removeItem(key)
}

export function listFiles(dir: string = ''): { path: string; size: number }[] {
  if (!isBrowser()) return []
  const normalizedDir = normalizePath(dir)
  const prefix = `${VFS_PREFIX}${normalizedDir}`
  const results: { path: string; size: number }[] = []

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key && key.startsWith(VFS_PREFIX)) {
      const filePath = key.slice(VFS_PREFIX.length)
      if (!normalizedDir || filePath.startsWith(normalizedDir)) {
        const value = window.localStorage.getItem(key) || ''
        results.push({
          path: filePath,
          size: new Blob([value]).size
        })
      }
    }
  }

  return results
}

export function clearVfs(): void {
  if (!isBrowser()) return
  const keysToRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key && key.startsWith('dominic:')) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    window.localStorage.removeItem(key)
  }
}
