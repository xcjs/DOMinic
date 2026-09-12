/**
 * Demo mode: an opt-in, fully offline path for screen recordings.
 *
 * Enabled by any of:
 *   - URL `?demo=1` (persisted to localStorage so reloads keep it; `?demo=0` clears)
 *   - Settings apiKey equal to `demo` or starting with `sk-demo`
 *
 * When off, nothing in the live path changes.
 */

export const DEMO_FLAG_KEY = 'dominic:demo'
export const DEMO_API_KEY = 'sk-demo-••••••••••••••••4242'

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function isDemoKey(apiKey?: string | null): boolean {
  if (!apiKey) return false
  return apiKey === 'demo' || apiKey.startsWith('sk-demo')
}

export function isDemoMode(config?: { apiKey?: string | null } | null): boolean {
  if (isDemoKey(config?.apiKey)) return true
  if (!hasWindow()) return false
  try {
    return window.localStorage.getItem(DEMO_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Reads `?demo=1` / `?demo=0` from the current URL and persists the choice.
 * Returns whether demo mode is on afterwards.
 */
export function syncDemoModeFromUrl(): boolean {
  if (!hasWindow()) return false
  try {
    const params = new URLSearchParams(window.location.search)
    const value = params.get('demo')
    if (value === '1' || value === 'true') {
      window.localStorage.setItem(DEMO_FLAG_KEY, '1')
    } else if (value === '0' || value === 'false') {
      window.localStorage.removeItem(DEMO_FLAG_KEY)
    }
  } catch {
    // ignore storage errors
  }
  return isDemoMode()
}
