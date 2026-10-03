---
type: overview
title: Architecture Overview
description: DOMinic as built on main at be8645f — five slices, the client-side tool protocol, the localStorage VFS, the runtime SFC engine, and where the code diverges from the golden-path ADRs.
tags: [dominic, architecture, synthesis]
generated: { by: claude-code/claude-opus-4.8, at: 2026-09-12T23:40:00Z }
sources:
  - id: code
    resource: app/, server/, nuxt.config.ts, package.json
    title: main at be8645f (post-sprint)
  - id: adrs
    resource: docs/adrs/
    title: ADRs 0001–0011
repo_head: "be8645f"
ingested: 2026-09-12
refreshed: 2026-09-12T23:40:00Z
---

# Architecture Overview

The system as it actually stands on `main` at `be8645f`, with the golden-path ADRs noted where they still read differently from the code (each ADR note carries the reconciling **As built** subsection). Back to [[DOMinic Home]].

## The one-sentence pitch

The browser tab is the **runtime**, not the display. The agent's output becomes *installed software* — Vue SFCs compiled in the browser, registered in a window manager, persisted in a virtual filesystem, updatable in place — which a chat window fundamentally cannot do. (The "chatbox test" from [[Judging Rubric & Win Strategy]].)

## Slices as built

```
nuxt.config.ts    Nuxt 4 · @pinia/nuxt, @nuxtjs/tailwindcss, @vueuse/nuxt · srcDir app/ · TS strict, typeCheck:false
                  · tailwind content globs app|features/**/*.{vue,ts,txt} · Tailwind Play CDN in <head> for runtime classes
package.json      ai ^4.3, @ai-sdk/openai|anthropic|google ^1, zod ^3, vue3-sfc-loader ^0.9, lucide-vue-next,
                  canvas-confetti · engines node >=24.21 <25 · licence AGPL-3.0-or-later
app/app.vue       the composition root: hydrates registry + settings on mount, opens Agent Chat, renders one
                  WindowFrame per open window (chat / settings / source:<id> / DynamicAppRunner), mounts the Taskbar,
                  and exposes window.__dominic test hooks (installFixture, injectBrokenApp, reset)
app/features/
  os/       stores/os.ts (setup store: windows, focusedId, z-order, min/max) · components/WindowFrame.vue
            (pointer-event drag, focus, min/max/close) · components/Taskbar.vue (installed-app list + running dot,
            View Source, Uninstall)
  chat/     components/ChatWindow.vue (streaming transcript, tool pills, suggestion chips) ·
            composables/useAgentChat.ts (POST /api/chat, v4 data-stream parser, client-side tool execution,
            provider-safe history, injects the referenced app's current source) · prompts/systemPrompt.ts ·
            tools/schemas.ts (Zod install_app / update_app) · types/chat.ts (ProviderConfig incl. 'custom')
  apps/     runner/DynamicAppRunner.vue + runner/loader.ts (compile SFC, esm.sh fallback, data-app-id style
            inject + removeAppStyles) · registry/registry.ts (AppMeta, hydrate/register/unregister, registry.json) ·
            fixtures/ (pomodoro-timer/index.vue.txt + installFixture) · stores/apps.ts (installed[] mirror)
  settings/ components/SettingsApp.vue (provider radios incl. Custom, model, API key, Base URL, Reset OS) ·
            stores/settings.ts (provider/model/apiKey/baseUrl, VFS persist + hydrate, resetOs)
  shared/   vfs.ts (localStorage driver) · types/vue3-sfc-loader.d.ts
server/api/chat.post.ts   streamText({model, system, messages, tools, maxSteps:3}).toDataStreamResponse()
```

Five slice directories, not ADR 0001's `os / agent / apps`; the chat slice is `chat`, Settings is its own slice. Stores are mixed setup/option style, and the app registry lives in a module-level ref rather than Pinia — treat ADR 0003's "setup store per slice" as aspirational.

## The core loop (the demo)

```mermaid
sequenceDiagram
  actor U as User
  participant W as ChatWindow
  participant C as useAgentChat
  participant S as /api/chat (streamText)
  participant P as Provider (OpenAI/Anthropic/Google/DeepSeek/custom)
  participant A as app.vue callbacks
  participant F as VFS (localStorage)
  participant R as DynamicAppRunner

  U->>W: "build a synthwave pomodoro timer"
  W->>C: sendMessage(text)
  C->>S: POST {messages, provider, model, apiKey, baseUrl, installedApps}
  S->>S: apiKey ?? process.env.<PROVIDER>_API_KEY  (401 if neither)
  S->>P: streamText(system=buildSystemPrompt(installedApps), tools)
  P-->>C: data stream 0:"text" | 9:{toolCallId,toolName,args}
  C->>A: install_app → writeFile apps/<id>/index.vue, registerApp, openWindow
  A->>R: mount, keyed on id + sourceVersion
  R-->>U: app renders; taskbar shows it with a running dot; confetti
  U->>U: reload tab
  A->>F: hydrateRegistry() → apps.installed
  A-->>U: app back in launcher/taskbar, reopens from VFS source
  U->>W: "make the breaks 10 minutes"
  C->>A: update_app → writeFile + removeAppStyles + bump sourceVersion → runner re-compiles
```

Design facts worth knowing:

- **Tools execute on the client, not the server.** `/api/chat` only declares the Zod schemas; `useAgentChat` runs `install_app`/`update_app` through callbacks that `app.vue` injects via `<ChatWindow :options>` (`getProviderConfig`, `getInstalledApps`, `getAppSource`, `onInstallApp`, `onUpdateApp`, `onOpenWindow`). That options object is the real cross-slice contract.
- **`update_app` gets the current source (#66).** `useAgentChat` detects which installed app a message refers to (direct name match, else the last-touched app unless the message asks to build something new) and appends that app's current VFS source to the outgoing message, so the model edits real code instead of rewriting from memory. The runner re-compiles because `app.vue` keys it on `id + sourceVersion` and bumps `sourceVersion` on install/update.
- **Provider-safe history.** The seeded "welcome" turn is dropped and empty assistant turns get a placeholder, because Anthropic rejects a leading assistant turn and empty content blocks (fixed in #42).
- **Recover beat (#64).** `DynamicAppRunner`'s error boundary catches compile and runtime errors and emits `askFix{appId,error}`; `app.vue` focuses chat and sends "the app … encountered an error … fix it with update_app". `window.__dominic.injectBrokenApp('compile'|'runtime')` is the test hook.
- **Keys** travel per request from `ProviderConfig`; the route falls back to `process.env.<PROVIDER>_API_KEY` — acceptable only because the demo host sets none (contradicts ADR 0005's "never at rest"; see [[Open Questions & Gaps]]).
- **DominicApp contract (system prompt):** `<template>` + plain-JS `<script setup>`, optional `<style scoped>`; imports limited to `vue`, `@vueuse/core`, Lucide icons, `canvas-confetti`; Tailwind utilities; browser APIs only. The runner passes **no props** into the compiled app despite ADR 0010's `{windowId, appId}`.

## Providers (ADR 0005 + PR #70)

`server/api/chat.post.ts` builds a model instance per `provider`: `openai` (default `gpt-5`), `anthropic` (`claude-sonnet-5`), `google` (`gemini-2.5-pro`), `deepseek` (OpenAI-adapter at `api.deepseek.com`), and **`custom`** — an OpenAI-compatible endpoint that requires a Base URL and a model from Settings (e.g. OpenRouter, a local proxy). Settings stores `{provider, model, apiKey, baseUrl}`, persisted to `/system/settings.json` in the VFS. Spec/plan: [[Spec - Custom OpenAI Provider]] / [[Plan - Custom OpenAI Provider]].

## Runtime engine (ADR 0006 + 0008)

1. `compileVueSfc({sourceCode, appId})` hands `vue3-sfc-loader` a virtual `/<appId>.vue`; `getFile` returns the source and fetches any other specifier from `https://esm.sh/<specifier>?bundle` — **no vetting**, as the golden path chose.
2. `moduleCache` pre-resolves `vue`, `@vueuse/core`, `lucide-vue-next`, `canvas-confetti` (zero network) — the same four the system prompt allows.
3. `<style>` blocks are appended to `<head>` tagged `data-app-id`; `removeAppStyles(appId)` clears them on update and uninstall (fixed in #62 — earlier they leaked).
4. Tailwind: `@nuxtjs/tailwindcss` purges to classes found in `app|features/**/*.{vue,ts,txt}` at build time, and the **Play CDN** in `<head>` JITs any class the agent invents at runtime (fixed in #42).

## Persistence (ADR 0007)

A single `localStorage` driver behind `vfs.ts` (`readFile`, `writeFile`, `deleteFile`, `listFiles`, `clearVfs`), key-prefixed `dominic:vfs:`. Paths: `apps/<id>/index.vue` (source) and `registry.json` (the `AppMeta[]`); settings at `system/settings.json`. On boot `app.vue` calls `hydrateRegistry()` → `apps.installed`, so installed apps return after reload; **windows do not persist** (only apps). "Reset OS" (`clearVfs` + reload) wipes it.

## Networking (ADR 0009)

Direct `fetch` only. No `/api/proxy` route was built — the demo app makes no external calls, so the CORS-proxy escape hatch stayed out of scope.

## Deferred vs shipped

Full deferral list is [[Post-Hackathon Roadmap (NEXT)]]; the honest caveats a judge will notice are in [[Open Questions & Gaps]]. In short, shipped: the whole loop, five providers, error recovery, install/update/uninstall/view-source, reload persistence. Deferred: iframe sandboxing, dependency vetting, multi-driver VFS, the CORS proxy, mobile layout, ESLint/type gates in the pre-commit hook.
