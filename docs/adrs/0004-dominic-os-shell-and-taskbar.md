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
