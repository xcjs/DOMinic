---
type: Architecture Decision Record
title: Virtual filesystem with pluggable storage drivers
description: A single VirtualFileSystem interface over localStorage and IndexedDB drivers, chosen per path via VFS metadata.
status: accepted
tags: [architecture, storage]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Virtual filesystem with pluggable storage drivers

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0007 | accepted | 2026-09-12 | Zack |

## Technical Story

OS alterations persist locally: agent-authored component source,
settings, provider API keys, and the runtime dependency cache all
need a filesystem-shaped home in the browser. localStorage alone
caps out around 5 MB, far too small for a growing component library.

## Context and Problem Statement

Storage needs differ by payload: settings and small files want the
simplicity of synchronous localStorage, while component libraries
need IndexedDB's capacity and async bulk reads. Callers should not
know or care which backend holds a given path.

## Decision Drivers

- Local-first persistence with no server round-trip.
- Variable payload sizes across very different data kinds.
- Synchronous ergonomics for small data, async capacity for large.
- Testability: the backend must be substitutable in tests.

## Considered Options

- Single `VirtualFileSystem` interface with driver registry
- localStorage JSON tree only
- IndexedDB-backed filesystem only

## Decision Outcome

Chosen option: **a single `VirtualFileSystem` interface plus a driver
registry**, because it hides the storage split behind one API while
letting each path use the backend that fits its payload.

- Two drivers ship together: a `localStorage` driver (small,
  synchronous payloads) and an IndexedDB driver (large payloads,
  async-backed).
- Per-path driver mapping is stored in VFS metadata, so callers use
  either depending on the need at each path.
- The VFS underpins component source, settings, provider keys, and
  the dependency cache (ADRs 0006, 0005, 0008).

### Confirmation

Unit tests run the same VFS suite against each driver; the OS boots
and restores component source and settings from the VFS after a
reload.

## Pros and Cons of the Options

### Single `VirtualFileSystem` interface with driver registry

- ✅ Good, because callers are backend-agnostic per path.
- ✅ Good, because tests can swap drivers freely.
- ❌ Bad, because the metadata-per-path mapping adds a small
  coordination cost.

### localStorage JSON tree only

- ✅ Good, because synchronous reads are trivially simple.
- ❌ Bad, because the ~5 MB ceiling starves component libraries.

### IndexedDB-backed filesystem only

- ✅ Good, because capacity and bulk reads are excellent.
- ❌ Bad, because its async-only API burdens tiny settings reads.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
- Related to [ADR 0008](0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md)
