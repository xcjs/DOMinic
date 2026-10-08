---
type: Architecture Decision Record
title: Multi-tab registry sync via BroadcastChannel
description: Tabs of one DOMinic instance sync the installed-apps registry over a BroadcastChannel; app source rides the shared localStorage VFS, not the channel.
status: accepted
tags: [architecture, os]
generated: { by: opencode/glm-5.3-flash, at: 2026-10-08T00:00:00Z }
verified: { by: human:zack, at: 2026-10-08T00:00:00Z }
---

# Multi-tab registry sync via BroadcastChannel

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0016 | accepted | 2026-10-08 | Zack |

## Technical Story

A user installs an agent-authored app in one browser tab and the
taskbar in a second tab of the same origin still shows the old set
until a reload. ADR 0003 deferred cross-tab synchronization from the
hackathon POC; NEXT.md step 3.5 schedules it.

## Context and Problem Statement

Each tab hydrates the registry from the VFS on mount and then mutations
stay local: `registerApp`/`unregisterApp` write `registry.json` and
notify in-tab listeners only. localStorage emits `storage` events, but
DOMinic writes its VFS keys in the same tab that mutated them, so the
other tab neither sees the registry change nor refreshes its store
subscriber. Two tabs of one installation drift apart.

## Decision Drivers

- One source of truth for "what is installed" (ADR 0003) across tabs.
- No backend; the app is fully client-side.
- Must not touch `vfs.ts` internals while Phase 1 rewrites that seam
  (#105 runs concurrently; one seam, one person).
- The eventual async VFS + driver registry (ADR 0007) may carry its own
  sync channel; this must be cheap to delete or replace then.

## Considered Options

- BroadcastChannel broadcasting registry snapshots
- localStorage `storage` events as the sync channel
- SharedWorker owning the registry

## Decision Outcome

Chosen option: **BroadcastChannel broadcasting registry snapshots**,
because it needs no storage polling, survives without workers, and the
registry is small (metadata only), so whole-snapshot fan-out per
mutation is simple and idempotent.

Recorded as a follow-up decision per the #116 done-when: this
**supersedes the deferral** in ADR 0003's "Future / Out of Scope"
section; ADR 0003 remains otherwise unchanged (immutable history).

Mechanics (as built):

- `app/features/shared/multitab-sync.ts` owns the channel
  (`dominic:registry-sync`). Each tab has an `instanceId`
  (`crypto.randomUUID`); a message carries `{ type, instanceId, apps }`
  and receivers ignore their own echoes.
- Registry mutations notify the bridge through the existing
  `onRegistryChange` API; the bridge posts `listApps()`.
- Receiving tabs apply the snapshot via the new registry API
  `importApps(metas)` (metadata only, timestamps defaulted), which
  persists and notifies so the Pinia `apps` store's revision getter
  re-derives - the same path as a local mutation.
- App source is **not** broadcast. It lives in the shared localStorage
  VFS, which both tabs already read; only the registry travels.
- Window geometry, focus, and workspace state are per-tab shell state
  and are deliberately **not** synced (window persistence is NEXT.md
  2.5 / issue #113).
- Wired once in `app.vue` `onMounted` via `startRegistrySync()`;
  SSR-safe (no-op when `window`/`BroadcastChannel` are absent).

### Confirmation

`tests/e2e/multitab-sync.spec.ts`: installing an app (via the
`window.__dominic.installApp` harness) in page A makes the app appear
in page B's taskbar without a reload; uninstalling in A removes it in B.
ESLint and typecheck cover the module; the e2e is the CI gate.

## Pros and Cons of the Options

### BroadcastChannel broadcasting registry snapshots

- âœ… Good, because no polling: receivers are pushed on every mutation.
- âœ… Good, because no worker process; works on every modern browser and
  degrades to a no-op elsewhere.
- âŒ Bad, because whole-snapshot fan-out grows with registry size
  (acceptable: metadata is a few hundred bytes per app).

### localStorage `storage` events as the sync channel

- âœ… Good, because zero new API surface.
- âŒ Bad, because the mutating tab must also bump a sentinel key to
  trigger the event, and payload parsing couples the channel to the VFS
  key layout that #105 is about to rewrite.

### SharedWorker owning the registry

- âœ… Good, because one process owns state; no snapshot conflicts.
- âŒ Bad, because it excludes some Safari/mobile contexts, complicates
  SSR and dev tooling, and its ownership would collide with the Phase 1
  async-VFS seam on the same files.

## Links

- Follow-up to (supersedes the deferral in) [ADR 0003](0003-pinia-per-domain-stores.md)
- Related to [ADR 0012](0012-end-of-hackathon-scope.md) (full-decision target)
- Sequenced by NEXT.md step 3.5 (issue #116)
