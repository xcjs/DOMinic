---
type: Architecture Decision Record
title: CORS-first networking with Chrome-masking proxy fallback
description: External calls fetch directly when CORS allows and fall back transparently to a generic proxy that presents a latest-stable Chrome User-Agent.
status: accepted
tags: [architecture, platform]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# CORS-first networking with Chrome-masking proxy fallback

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0009 | accepted | 2026-09-12 | Zack |

## Technical Story

Components and the agent must reach external services — public APIs,
web pages, feeds — that may or may not send CORS headers. The OS
needs one networking story that prefers the browser's direct path
and degrades gracefully when a service blocks cross-origin reads.

## Context and Problem Statement

Direct browser requests are fast, cache-friendly, and credential-
correct, but fail entirely when a service lacks CORS headers.
A server proxy can bypass CORS, but routing every request through
the server wastes latency where direct fetch would work.

## Decision Drivers

- Prefer direct browser requests wherever CORS allows.
- Bypass CORS gaps transparently, without per-service code.
- Avoid anti-bot rejection on proxied requests.
- Keep the server surface to one generic route.

## Considered Options

- Single generic proxy route with CORS-first fallback
- Domain allowlist proxy
- Per-service proxy routes

## Decision Outcome

Chosen option: **CORS-first direct `fetch` with transparent fallback
to a single generic `/api/proxy` Nuxt server route**, because it
keeps the fast path direct and confines all CORS workarounds to one
reviewable server surface.

- A client-side helper composable decides direct vs proxy per
  request; fallback on failure is automatic and invisible to
  callers.
- The proxy rewrites the User-Agent to the latest stable Google
  Chrome and strips identifying headers (cookies, referer, origin)
  before forwarding, and streams the response back.
- The route is generic: no per-service routes, no allowlist to
  maintain.

### Confirmation

A CORS-enabled endpoint loads directly (visible in network tools);
a CORS-blocking endpoint transparently returns content through
`/api/proxy`.

## Pros and Cons of the Options

### Single generic proxy route with CORS-first fallback

- ✅ Good, because the fast path stays direct and cache-friendly.
- ✅ Good, because one generic route is easy to review and harden.
- ❌ Bad, because proxied traffic adds server bandwidth cost.

### Domain allowlist proxy

- ✅ Good, because abuse surface shrinks to known hosts.
- ❌ Bad, because agent-authored apps cannot reach unlisted
  services without an OS change.

### Per-service proxy routes

- ✅ Good, because each route can carry bespoke transformation.
- ❌ Bad, because server code grows with every new integration.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
