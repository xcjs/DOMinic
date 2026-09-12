---
type: Architecture Decision Record
title: Agent app interface and tool protocol
description: Structured tool calling and component contract for agent-authored applications.
status: accepted
tags: [architecture, agent]
generated: { by: agent/pi, at: 2026-09-12T00:00:00Z }
verified: { by: human:charles, at: 2026-09-12T00:00:00Z }
---

# Agent app interface and tool protocol

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0010 | accepted | 2026-09-12 | Zack, Charles |

## Technical Story

DOMinic turns conversational requests into running applications. The
agent needs an unambiguous protocol to package, install, and update
Vue Single File Components, and the OS needs a strict component contract
to host them safely inside window frames.

## Context and Problem Statement

When LLMs generate code via free-form chat, they produce unformatted
markdown, conflicting props, or broken script tags that require messy
client-side regex parsing. To make app installation deterministic, the
system must use structured tool calling and a standardized base
contract (`DominicApp`).

## Decision Drivers

- Deterministic app delivery (structured parameters, not raw chat text).
- Predictable runtime contract for mounted components.
- Support for both new app creation and in-place app mutation.
- Instant integration with window manager and virtual filesystem.

## Considered Options

- Free-form markdown parsing (regex extraction of ```vue code blocks)
- Structured tool calling via Vercel AI SDK (`install_app`, `update_app`)
- External backend webhook compilation pipeline

## Decision Outcome

Chosen option: **Structured tool calling via Vercel AI SDK paired with
the `DominicApp` component contract**, because it guarantees schema
validation, enables direct UI state transitions, and avoids flaky text
parsing.

### Hackathon POC (Golden Path)

For the hackathon POC, the interaction loop is governed by two tools
and one component specification:

#### 1. Tool Definitions (Vercel AI SDK)

- **`install_app`**:
  - `id`: kebab-case unique identifier (e.g. `pomodoro-timer`).
  - `title`: Human-readable window title (e.g. `Pomodoro Timer`).
  - `icon`: Icon identifier from `lucide-vue-next` (e.g. `Timer`).
  - `description`: One-sentence summary of the app.
  - `vueSfcCode`: Full Vue 3 SFC string (`<template>`, `<script setup>`,
    optional `<style scoped>`).
- **`update_app`**:
  - `id`: Identifier of the existing app to modify.
  - `vueSfcCode`: Updated full Vue 3 SFC source.
  - `summary`: Explanation of the changes made.

#### 2. DominicApp Component Contract

Agent-generated components must conform to:

- **Standard SFC Layout**: Vue 3 `<template>` with `<script setup>`.
- **Props**: Receives `{ windowId: string, appId: string }`.
- **Styling**: Uses standard Tailwind CSS utility classes.
- **Available Imports**: Pre-resolved host instances of `vue`
  (`ref`, `computed`, `watch`, `onMounted`), `@vueuse/core`, and
  `lucide-vue-next`.
- **No Node.js Built-ins**: Browser-only APIs.

#### 3. Execution Lifecycle

1. Agent calls `install_app`.
2. OS writes files to VFS: `/apps/<id>/index.vue` and
   `/apps/<id>/manifest.json`.
3. OS registers the app in `useOsStore`.
4. OS opens the newly installed app window automatically.
5. OS displays an installation badge in the chat thread.

### Future / Out of Scope for POC

- Granular permission requests (e.g., prompt for clipboard/location).
- Interactive code diff approval modal before updating an existing app.
- App-to-app IPC messaging bus.

### Open Questions

- **OPEN QUESTION: Installation Approval**: Should app installation
  require manual human confirmation in chat? (Recommendation for POC:
  Auto-install immediately upon tool call completion for maximum demo
  flow and delight).

## Pros and Cons of the Options

### Structured tool calling via Vercel AI SDK

- ✅ Good, because parameters are validated against a strict schema.
- ✅ Good, because tool status triggers reactive UI transitions.
- ❌ Bad, because models must support reliable tool calling.

### Free-form markdown parsing

- ✅ Good, because works with any basic completion model.
- ❌ Bad, because code block regex parsing is fragile and fails on
  nested formatting.

### External backend webhook pipeline

- ✅ Good, because offloads compilation to a heavy server.
- ❌ Bad, because contradicts DOMinic's client-first, zero-build-latency
  architecture.

## Links

- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
