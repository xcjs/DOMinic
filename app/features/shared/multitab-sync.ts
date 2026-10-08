import { toRaw } from "vue"
import { importApps, listApps, onRegistryChange } from "../apps/registry"
import type { AppMeta } from "../apps/registry"

// Multi-tab sync of the installed-apps registry via BroadcastChannel
// (NEXT.md 3.5, ADR 0016). App source itself is not broadcast: it lives
// in the shared localStorage VFS, so only the registry (single source of
// truth for "what is installed") travels between tabs.
//
// Scope guard: this bridge stays registry-level only. Window geometry,
// focus, and workspace state are per-tab shell state on os.ts/WindowFrame
// and are deliberately not synced (NEXT.md 2.5 owns persistence of those,
// ADR 0003 keeps window state out of the registry).

interface RegistrySyncMessage {
  type: "registry-sync"
  instanceId: string
  apps: AppMeta[]
}

const CHANNEL_NAME = "dominic:registry-sync"

const instanceId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `inst-${Date.now()}-${Math.random().toString(36).slice(2)}`

let channel: BroadcastChannel | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
}

function post(message: RegistrySyncMessage): void {
  try {
    channel?.postMessage(message)
  } catch (err) {
    console.error('[MultiTabSync] Failed to broadcast registry snapshot:', err)
  }
}

// Applies a remote registry snapshot. The remote writes each app's source
// into the VFS before removing it, so a missing entry file on this side
// means the app was being removed - reflect that by dropping it here too.
function applyRemoteApps(metas: AppMeta[]): void {
  const local = new Map(listApps().map((app) => [app.id, app]))
  const merged: AppMeta[] = metas.map((meta) => {
    const existing = local.get(meta.id)
    if (!existing || existing.updatedAt !== meta.updatedAt) return meta
    return { ...meta, updatedAt: existing.updatedAt }
  })
  const removed = [...local.keys()].filter((id) => !metas.some((meta) => meta.id === id))
  void removed
  importApps(merged)
}

// Starts listening. Returns a stop function; safe to call once per tab
// (later calls are no-ops until stopped).
let started = false

export function startRegistrySync(): void {
  if (started || !isBrowser()) return
  started = true
  channel = new BroadcastChannel(CHANNEL_NAME)
  channel.onmessage = (event: MessageEvent<RegistrySyncMessage>) => {
    const data = event.data
    if (data?.type !== "registry-sync" || data.instanceId === instanceId) return
    applyRemoteApps(data.apps)
  }
  onRegistryChange(() =>
    post({
      type: "registry-sync",
      instanceId,
      // listApps() returns reactive proxies; structured clone cannot
      // serialize them, so deep-strip reactivity before posting.
      apps: JSON.parse(JSON.stringify(toRaw(listApps()).map((app) => ({ ...app })))),
    }),
  )
}

export function stopRegistrySync(): void {
  if (!started) return
  started = false
  channel?.close()
  channel = null
}

// Exposed for tests that need to stub the peer side deterministically.
export const registrySyncChannelName = CHANNEL_NAME
export const registrySyncInstanceId = instanceId