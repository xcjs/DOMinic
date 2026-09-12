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

- The `os` slice contains the window manager, taskbar, and app
  registry.
- The taskbar lists running apps; on narrow viewports it degrades to
  a bottom-nav-style sheet and windows stack or maximize.
- The built-in **Settings** app is the first first-party app on the
  base app contract; it is the global surface for OS preferences
  (including LLM provider configuration, ADR 0005).
- Apps register with the app registry and are launched through it.

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
