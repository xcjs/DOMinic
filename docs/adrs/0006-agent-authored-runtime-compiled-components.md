---
type: Architecture Decision Record
title: Agent-authored runtime-compiled components
description: The agent's Vue SFC applications compile at runtime with vue3-sfc-loader and register on a DominicApp contract.
status: accepted
tags: [architecture, agent]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Agent-authored runtime-compiled components

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0006 | accepted | 2026-09-12 | Zack |

## Technical Story

The agent authors Vue single-file component applications from chat
requests. Users expect to install, preview, and run those apps
immediately — with no per-component build step, no bundler run, and
no redeploy of the OS itself.

## Context and Problem Statement

A traditional Vue app compiles at build time; DOMinic's apps are born
at runtime. They must compile in the browser, integrate with the
window manager as ordinary apps, persist their source, and be
removable. Compile-in-an-iframe would isolate them but would wall
them off from OS state and styling.

## Decision Drivers

- No build infrastructure per component.
- A live install-and-preview loop from chat.
- Reuse of the Vue ecosystem (components load dependencies, ADR 0008).
- Apps and widgets register through the same contract as first-party
  apps.

## Considered Options

- Runtime-compiled SFC (vue3-sfc-loader), in-process
- Sandboxed iframe compile
- Prebuilt bundles delivered per app

## Decision Outcome

Chosen option: **runtime-compiled SFC via `vue3-sfc-loader`, in
process**, because it compiles agent-authored SFCs directly in the
browser with no per-app infrastructure and keeps compiled apps first-
class OS citizens.

- Compiled components register as ordinary Vue components, apps, or
  widgets through the component registry in the `os` slice.
- A `DominicApp` base component contract standardizes app metadata,
  launch context props, and install/uninstall lifecycle hooks; the
  built-in Settings app (ADR 0004) is the first implementation.
- Component source persists in the VFS (ADR 0007).
- iframe isolation is documented as a future escape hatch for
  untrusted or crashing apps, not the default path.

### Confirmation

An agent-authored SFC installs from chat, appears in the app
registry, launches as a window, and survives reload via its VFS
source.

## Pros and Cons of the Options

### Runtime-compiled SFC (vue3-sfc-loader), in-process

- ✅ Good, because zero per-app build step keeps the live loop fast.
- ✅ Good, because compiled apps share OS state and styling directly.
- ❌ Bad, because a crashing app shares the page with the OS (iframe
  isolation remains the escape hatch).

### Sandboxed iframe compile

- ✅ Good, because crashes and bad CSS are contained.
- ❌ Bad, because postMessage bridging for state, storage, and
  styling is heavy and erodes the app contract.

### Prebuilt bundles delivered per app

- ✅ Good, because runtime cost is minimal.
- ❌ Bad, because it requires per-app build infrastructure the
  product explicitly avoids.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
