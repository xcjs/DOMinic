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

### Hackathon POC (Golden Path)

To avoid complex networking middleware during the hackathon:

- **Direct Fetch by Default**: Components use standard browser `fetch`
  directly against CORS-enabled public APIs (such as Open-Meteo for
  weather or CoinGecko for crypto).
- **Simple Proxy Escape Hatch**: A minimal Nuxt server route
  `/api/proxy?url=<encoded>` is provided. If an external API lacks
  CORS headers, the component calls `/api/proxy?url=...`.
- **Deferred Heuristics**: Automatic trial-and-fallback logic and
  User-Agent spoofing headers are deferred.

### Future / Out of Scope for POC

- Transparent automatic fallback composable (`useSmartFetch`) that tests
  CORS and retries behind the scenes.
- Chrome User-Agent spoofing and header scrubbing engine.
- SSRF defense filters and IP range blocklists.

### Open Questions

- **OPEN QUESTION: Public Deployment Security**: If DOMinic is hosted
  publicly for the hackathon presentation (e.g. Vercel), should the proxy
  block private IP ranges (e.g. `127.0.0.1`, `169.254.169.254`)?
  (Recommendation: A simple regex disallowing private IPs prevents basic
  SSRF during judging).

### Confirmation

A CORS-enabled endpoint loads directly (visible in network tools);
a CORS-blocking endpoint transparently returns content through
`/api/proxy`.

### As built (2026-09-12)

**Matches the golden path:**

- Generated apps reach the network with plain browser `fetch`; the system
  prompt lists `fetch` among the allowed standard browser APIs
  (`app/features/chat/prompts/systemPrompt.ts:36`).
- No `useSmartFetch` composable, User-Agent spoofing, or header scrubbing
  exists on main; those items stayed deferred as this record planned.

**Differs from this record:**

- ADR: a minimal `/api/proxy?url=<encoded>` Nuxt route exists as an escape
  hatch -> main: `server/api/` holds only `chat.post.ts`; no proxy route was
  built (`server/api/chat.post.ts:8`).
- ADR: components call `/api/proxy?url=...` when CORS is missing -> main:
  the prompt never mentions a proxy, so agent-authored apps have no fallback
  and a CORS-blocked endpoint simply fails
  (`app/features/chat/prompts/systemPrompt.ts:36`).
- ADR: direct fetch targets public data APIs -> main: the only direct
  cross-origin fetch in OS code is `getFile` in `compileVueSfc`, which
  passes absolute `http` import URLs through unchanged and rewrites bare
  specifiers to `https://esm.sh/${url}?bundle` before calling `fetch`
  (`app/features/apps/runner/loader.ts:27`).
- ADR: Confirmation shows a CORS-blocking endpoint returning through
  `/api/proxy` -> main: the `pomodoro-timer` fixture imports only `vue` and
  makes no network calls, so the demo exercises neither path
  (`app/features/apps/fixtures/pomodoro-timer/index.vue.txt:94`).
- ADR: one generic server route -> main: the sole server route is the LLM
  relay, which forwards a client-supplied `baseUrl` to the provider SDK
  (`server/api/chat.post.ts:53`).

**Open question outcome:**

- Not addressed: with no proxy route there is no private-IP regex to add; the
  client-supplied `baseUrl` is passed to `createOpenAI` unfiltered in both
  the `deepseek` and default `openai` branches (`server/api/chat.post.ts:53`,
  `server/api/chat.post.ts:60`) and is the only client-steerable outbound
  target on the server.

Reconciled against main on 2026-09-12; the decision text above is unchanged.

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
