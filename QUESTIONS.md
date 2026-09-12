---
type: Open Questions Register
title: DOMinic Open Questions and Decisions
description: Register of open questions, trade-offs, and engineering choices for the hackathon team.
tags: [questions, team, planning]
generated: { by: agent/pi, at: 2026-09-12T00:00:00Z }
verified: { by: human:charles, at: 2026-09-12T00:00:00Z }
---

# DOMinic: Open Questions Register

This document tracks open technical and UX questions for the 5-engineer
team during hackathon development. Each item includes current options and
a recommended path for the Proof of Concept.

---

## 1. OS Shell & Window Manager (Workstream 1)

### Q1.1: Chat Presence — Floating Window vs. Docked Drawer?

- **Option A (Floating Window)**: The Agent Chat is a draggable window,
  identical to other apps, but with a high default z-index.
- **Option B (Docked Drawer)**: The Agent Chat is a persistent slide-out
  panel anchored to the right edge of the desktop.
- **Recommendation for POC**: **Option A (Floating Window)**. It
  demonstrates the window manager immediately upon boot, can be moved
  aside easily when viewing generated apps, and requires no special-case
  layout math.

### Q1.2: Window Clamping & Bounds Checking

- **Question**: How strictly should windows be clamped to viewport bounds?
- **Recommendation for POC**: Clamp window title bars so they cannot be
  dragged completely above the top edge or below the taskbar. Prevent
  negative top/left offsets. Full multi-edge dynamic boundary clipping
  can be omitted for speed.

---

## 2. Agent Chat & Tool Calling (Workstream 2)

### Q2.1: Recommended Default Model

- **Question**: Which frontier model provides the highest fidelity Vue 3
  SFC code generation with valid tool calling?
- **Recommendation for POC**: **Anthropic Claude 3.5 Sonnet** or
  **OpenAI GPT-4o**. Both reliably output compliant SFC `<template>` and
  `<script setup>` structures and respect JSON tool parameter schemas.

### Q2.2: Existing App Context Injection

- **Question**: How should existing apps in the OS be exposed to the LLM?
- **Recommendation for POC**: Include a JSON list of installed app
  metadata (`{ id, title, description }`) in the system prompt. When the
  user requests an update to an existing app (e.g. "Update the pomodoro
  timer"), retrieve the source code of that specific app from the VFS and
  inject it into the conversation context.

---

## 3. Runtime SFC Loader & Execution Engine (Workstream 3)

### Q3.1: Script Setup Syntax — TypeScript vs. Plain JavaScript?

- **Question**: Should the agent output `<script setup lang="ts">` or
  plain `<script setup>`?
- **Recommendation for POC**: **Plain JavaScript (`<script setup>`)**.
  `vue3-sfc-loader` compiles plain JavaScript faster in-browser with zero
  risk of runtime transpile failures from missing TypeScript type
  declarations.

### Q3.2: Error Boundary UX

- **Question**: What happens when an agent generates invalid code or a
  component crashes during render?
- **Recommendation for POC**: Wrap the component runner in Vue's
  `onErrorCaptured`. Render an in-window alert showing the error message
  with an "Ask Agent to Fix" button that automatically posts:
  *"The app encountered an error: [error details]. Please fix it."*

---

## 4. Storage & Persistence (Workstream 4)

### Q4.1: Window State Persistence Across Page Reloads

- **Question**: Should window coordinates and open/closed state persist
  across browser refresh, or only installed app code?
- **Recommendation for POC**: **Persist installed apps only**. On
  refresh, reload the desktop with a clean slate (Chat window open,
  installed apps accessible in launcher/taskbar). Restoring arbitrary
  window coordinates across viewport resizes can cause layout glitches
  during a demo.

### Q4.2: Development Cache Reset

- **Question**: How can the team quickly wipe bad state during testing?
- **Recommendation for POC**: Provide a prominent "Reset OS" button in
  the Settings app that clears `localStorage` and reboots the tab.

---

## 5. Integration, Polish & Curated Demo Apps (Workstream 5)

### Q5.1: Which Demo Apps Guarantee Maximum Judging Impact?

- **Recommendation for POC**:
  1. **Interactive Pomodoro / Focus Timer**: Rich animated countdown,
     retro synthwave styling, sound toggle, confetti on completion.
  2. **Crypto or Weather Live Dashboard**: Real-time direct `fetch` to
     a public API (e.g. CoinGecko or Open-Meteo) showing live data cards.
  3. **Scratchpad / Kanban Board**: Local storage state persistence,
     drag-and-drop or card creation, demonstrating interactive state.
