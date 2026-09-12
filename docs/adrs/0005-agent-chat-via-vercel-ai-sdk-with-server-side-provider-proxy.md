---
type: Architecture Decision Record
title: Agent chat via Vercel AI SDK with server-side provider proxy
description: Chat runs through a Nuxt /api/chat route on the Vercel AI SDK; provider keys stay browser-side and travel per-request.
status: accepted
tags: [architecture, agent]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Agent chat via Vercel AI SDK with server-side provider proxy

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0005 | accepted | 2026-09-12 | Zack |

## Technical Story

Chat is the primary agent surface of DOMinic: the user talks, the
agent answers and authors applications. The OS must support virtually
any LLM provider without code changes and must never hold provider
credentials at rest on a server.

## Context and Problem Statement

Provider APIs differ in wire format, streaming protocol, and auth.
Hand-rolling adapters for each provider is a maintenance tax. But a
pure server-side integration would require the server to store API
keys, which we refuse: the user's keys should live in their browser
and be used per-request.

## Decision Drivers

- Provider-agnostic: adding a provider must be configuration, not
  new protocol code.
- Streaming responses to the chat UI.
- Keys never at rest on the server.
- No-provider onboarding: a fresh install must guide the user to
  configure a provider rather than fail.

## Considered Options

- Server-side proxy with server-held provider keys
- Bring-your-own-key direct from the browser
- Vercel AI SDK via a Nuxt server route with per-request keys

## Decision Outcome

Chosen option: **Vercel AI SDK (`ai` + provider packages) consumed
through a Nuxt server route `/api/chat` that streams responses**,
because the SDK normalizes every major provider behind one interface,
streams natively, and the server route keeps provider keys usable
while never persisting them.

- Users select a provider via the Settings app (ADR 0004) when none
  is configured; chat surfaces that selection flow instead of an
  error.
- Provider API keys are stored browser-side in the VFS (ADR 0007)
  and sent per-request to `/api/chat`, which uses them for that
  request only.
- The route never logs, caches, or stores key material.

### Confirmation

A chat round-trip against a configured provider streams token-by-token;
the server holds no key material after a request completes.

## Pros and Cons of the Options

### Server-side proxy with server-held provider keys

- ✅ Good, because the browser never sees a provider credential.
- ❌ Bad, because the server stores third-party secrets at rest,
  a liability we refuse.

### Bring-your-own-key direct from the browser

- ✅ Good, because the server never touches keys at all.
- ❌ Bad, because every provider's streaming protocol must be
  re-implemented client-side and CORS policies constrain which
  providers work at all.

### Vercel AI SDK via a Nuxt server route with per-request keys

- ✅ Good, because one unified interface covers the provider
  ecosystem, including streaming and tool calls.
- ✅ Good, because keys transit per-request and are never at rest
  on the server.
- ❌ Bad, because a key still transits the server in memory for the
  duration of a request.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
