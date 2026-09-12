---
type: Architecture Decision Record
title: Pinia per-domain stores
description: One Pinia setup-style store per slice is the only cross-slice state channel.
status: accepted
tags: [architecture]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Pinia per-domain stores

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0003 | accepted | 2026-09-12 | Zack |

## Technical Story

The OS holds live state everywhere: open windows, app registry,
settings, chat sessions. The state must be observable, modular, and
debuggable, and it must not entangle slices that are otherwise
independent.

## Context and Problem Statement

State lives inside components today would be invisible to other apps
and impossible to persist or restore. A global event bus would couple
every slice to every other. We need state primitives that are
Vue-idiomatic, per-slice modular, devtools-inspectable, and SSR-safe.

## Decision Drivers

- Vue-idiomatic reactivity and devtools integration.
- Per-slice modularity matching the slice layout.
- A single, controlled channel for cross-slice state.
- SSR-safety without bespoke lifecycles.

## Considered Options

- Pinia, one setup-style store per slice
- Composables-only state
- Pinia plus a global event bus

## Decision Outcome

Chosen option: **Pinia, one setup-style store per slice**, because it
is Vue's official state library, is devtools-first, is SSR-safe, and
its store-per-slice shape maps exactly onto the slice boundaries.

### Hackathon POC (Golden Path)

For the hackathon POC, the OS relies on three focused Pinia setup stores:

- `useOsStore` (`app/features/os/stores/os.ts`): Manages the window
  manager state (open window instances, focused window ID, z-index
  stack, minimized/maximized states) and the registered apps list.
- `useAgentStore` (`app/features/agent/stores/agent.ts`): Manages chat
  message history, streaming status, and active tool execution status.
- `useSettingsStore` (`app/features/apps/stores/settings.ts`): Manages
  configured LLM provider credentials (API keys), model selections, and
  shell preferences.

Cross-slice state reads/writes use these three stores directly. Pinia
setup syntax (`ref`, `computed`, functions) keeps the code immediately
readable and writable across the 5 SDEs.

### Future / Out of Scope for POC

- Cross-tab state synchronization via `BroadcastChannel` or `SharedWorker`.
- Full OS time-travel debugging and session state snapshot export/import.
- Granular permissions or access control for store state.

### Open Questions

- **OPEN QUESTION: Window Session Persistence**: Should individual window
  positions, sizes, and open states persist across page reloads, or
  should only the installed app registry persist? (Recommendation for
  POC: Persist the installed apps list; let windows start cleanly on
  reboot to avoid broken layout restore).

### Confirmation

Code review rejects component-private OS state that duplicates a
store; the devtools Pinia panel shows one store per slice.

## Pros and Cons of the Options

### Pinia, one setup-style store per slice

- ✅ Good, because setup stores use plain `ref`/`computed` the team
  already knows.
- ✅ Good, because per-slice stores mirror slice boundaries 1:1.
- ❌ Bad, because another library adds bundle weight.

### Composables-only state

- ✅ Good, because it adds no dependency.
- ❌ Bad, because ad-hoc composable singletons lose devtools tracing
  and consistent patterns for cross-slice state.

### Pinia plus a global event bus

- ✅ Good, because fan-out signals are trivial to broadcast.
- ❌ Bad, because hidden event coupling defeats the slice boundary
  the store layout creates.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
