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

- Each slice owns its store(s) under `app/features/<slice>/stores/`.
- Stores are the only cross-slice state channel; a slice reaches
  another domain's state by importing its store (declared in
  `app/shared/` when the coupling is contractual).
- No global event bus initially; revisit only if OS-wide signal
  fan-out demands it.

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
