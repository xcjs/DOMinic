---
type: Architecture Decision Record
title: DOMinic OS shell and taskbar
description: A desktop-metaphor shell in the os slice with window manager, taskbar, app registry, and a built-in Settings app.
status: accepted
tags: [architecture, platform]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# DOMinic OS shell and taskbar

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0004 | accepted | 2026-09-12 | Zack |

## Technical Story

DOMinic presents itself as a desktop-like operating system running in
a browser tab. Something must own the desktop metaphor: launching
apps, tracking open windows, and giving the user a persistent place
to find and switch between apps — on a phone first, and a desktop
second.

## Context and Problem Statement

Apps (first-party and agent-authored alike) need a common contract for
being launched, surfaced, and closed. Mobile-first means the desktop
metaphor must degrade gracefully to small viewports instead of being
desktop-only.

## Decision Drivers

- The desktop metaphor is instantly familiar to users.
- Mobile scaling: the shell must work at phone widths first.
- App and window lifecycle management in one place.
- First-party apps must follow the same contract as agent-authored
  apps.

## Considered Options

- Full windowing shell with taskbar
- Single-activity mobile-style shell
- Hybrid desktop shell with mobile taskbar

## Decision Outcome

Chosen option: **desktop-metaphor shell in an `os` slice**, because it
delivers the OS identity while treating mobile as a first-class
degradation rather than a separate shell.

### Hackathon POC (Golden Path)

For the hackathon POC, the desktop shell focuses on delivering a visually
stunning, reliable desktop-viewport experience (optimized for laptop/demo
displays):

- **Window Management**: Built using `@vueuse/core` (`useDraggable`) for
  clean drag handling without custom mouse event listeners. Supports
  draggable title bars, window focus/z-indexing, minimize to taskbar,
  maximize/restore, and close.
- **Taskbar**: Fixed to the bottom of the viewport. Features an App
  Launcher menu (listing installed apps and first-party utilities), open
  window badges, an Agent Chat toggle button, and a live clock.
- **Visual Polish**: Modern dark-mode glassmorphism (`backdrop-blur-md`,
  subtle borders, drop shadows) and desktop wallpaper support to
  maximize demo visual impact.
- **Settings App**: Pre-installed first-party app that allows the user to
  input and persist their LLM API key (ADR 0005).

### Future / Out of Scope for POC

- Responsive mobile degradation (bottom-navigation sheet, stacked
  cards, touch-optimized gestures).
- Advanced window snapping, tiling window manager, or multi-monitor
  virtual workspaces.
- Window resize handles from all edges/corners (POC uses maximize/restore
  and fixed initial sizing).

### Open Questions

- **OPEN QUESTION: Chat Shell Presence**: Should the Agent Chat live as a
  docked right-hand slide-out drawer or as a standard draggable window?
  (Recommendation for POC: A draggable OS window with high default
  z-index and an easy dock icon gives maximum flexibility and showcases
  the window manager immediately).

### Confirmation

The first Nuxt build renders the shell: taskbar, at least one window,
and the Settings app launchable.

### As built (2026-09-12)

**Matches the golden path:**

- Windows support title-bar drag, focus with z-ordering, minimize to the
  taskbar, maximize/restore and close (`app/features/os/stores/os.ts:60`,
  `:75`, `:83`, `:48`); the taskbar is fixed to the viewport bottom
  (`app/features/os/components/Taskbar.vue:18`).
- Dark glass chrome uses `border-white/10`, `bg-slate-900/95`, `shadow-2xl`
  and `backdrop-blur` (`app/features/os/components/WindowFrame.vue:54`).
- No resize handles; size is fixed at open (`app/features/os/stores/os.ts:37`)
  and maximize swaps to `100vw` x `calc(100vh - 48px)` (`WindowFrame.vue:14`).
- No responsive or mobile layout exists in the `os` slice.

**Differs from this record:**

- `@vueuse/core` `useDraggable` -> raw `pointerdown`/`pointermove`/`pointerup`
  handlers using `setPointerCapture` and `movementX`/`movementY`, clamped to
  the viewport (`app/features/os/components/WindowFrame.vue:28`, `:35`);
  `@vueuse/core` (`package.json:21`) is imported only by
  `app/features/apps/runner/loader.ts:2` to expose composables to
  agent-authored apps; nothing under `app/` imports `useDraggable`.
- Taskbar with App Launcher, chat toggle and clock -> `Taskbar.vue` renders a
  `DOMinic` label plus one button per window (`Taskbar.vue:19`, `:21`); the
  launcher is a floating top-right panel (`app/app.vue:142`), the clock a bare
  `<span>` above the taskbar (`app/app.vue:178`); there is no dedicated
  chat toggle, only the chat window's generic taskbar button, which
  `onTaskbarClick` minimizes or restores (`Taskbar.vue:6`).
- `backdrop-blur-md` -> `backdrop-blur` (`WindowFrame.vue:54`,
  `Taskbar.vue:18`, `app/app.vue:142`).
- Desktop wallpaper support -> a Tailwind gradient
  (`bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900`) with a
  faded `DOMinic` heading (`app/app.vue:114`, `:117`); no image wallpaper.
- Settings as a pre-installed registry app -> a hard-coded builtin branched on
  `win.appId === 'settings'` (`app/app.vue:55`, `:124`), launched from a
  dashed button under the Launch panel (`app/app.vue:170`).

**Open question outcome:**

- Chat is a standard draggable window opened once at mount by
  `openBuiltin('chat')` (`app/app.vue:31`, `:57`) with the normal `topZ + 1`
  (`app/features/os/stores/os.ts:39`); no high z-index, dock icon or drawer.

Reconciled against main on 2026-09-12; the decision text above is unchanged.

## Pros and Cons of the Options

### Full windowing shell with taskbar

- ✅ Good, because the OS metaphor carries the product identity.
- ✅ Good, because window and app lifecycle have one natural home.
- ❌ Bad, because windowing chrome wastes space on phone viewports
  unless actively degraded.

### Single-activity mobile-style shell

- ✅ Good, because it is the natural fit for small screens.
- ❌ Bad, because it abandons the desktop metaphor that defines the
  product.

### Hybrid desktop shell with mobile taskbar

- ✅ Good, because it keeps the desktop metaphor while degrading
  cleanly.
- ✅ Good, because one shell serves both form factors.
- ❌ Bad, because two layout modes must both be tested.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
