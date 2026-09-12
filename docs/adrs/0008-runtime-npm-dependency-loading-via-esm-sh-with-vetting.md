---
type: Architecture Decision Record
title: Runtime NPM dependency loading via esm.sh with vetting
description: Agent apps load npm packages from esm.sh only after an automated vetting gate; vetted metadata and builds cache in the VFS.
status: accepted
tags: [architecture, agent, storage]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Runtime NPM dependency loading via esm.sh with vetting

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0008 | accepted | 2026-09-12 | Zack |

## Technical Story

Agent-authored components import arbitrary NPM packages at runtime.
The browser cannot run a bundler per app, so packages must arrive as
ready ESM — but arbitrary code execution from a CDN is exactly the
surface we must gate behind review.

## Context and Problem Statement

The full npm ecosystem should be reachable, including CommonJS
packages and subpath imports, without a server build step. At the
same time, executing third-party code in the user's browser demands
an automated security review before anything loads.

## Decision Drivers

- Full npm ecosystem reach, including CJS transpilation and
  subpath imports.
- No server build step.
- Security review before execution, not after.
- Offline resilience through caching.

## Considered Options

- esm.sh with automated vetting
- unpkg/jsDelivr with a runtime resolver
- Server-side pre-bundling per app

## Decision Outcome

Chosen option: **esm.sh as the ESM CDN, gated by automated vetting**,
because it serves the whole npm ecosystem (CJS transpile, subpaths,
GitHub refs) as ready ESM with zero server build, while the vetting
gate satisfies the security driver.

- Every dependency passes a vetting gate before first load: npm
  registry and advisory (audit) data, weekly download volume,
  license check, publish age, and maintainer signals.
- Vetted package metadata and cached builds persist in the VFS
  (ADR 0007).
- Recorded caveats: native/binary addons cannot run in a browser;
  heavy Node built-in usage depends on esm.sh polyfills; CDN
  availability is a dependency mitigated by the vetting gate and VFS
  caching; the first request pays build latency.

### Confirmation

A component importing a vetted package loads and runs; a package
failing the vetting gate is refused with its reasons surfaced.

## Pros and Cons of the Options

### esm.sh with automated vetting

- ✅ Good, because CJS transpilation and subpath support just work.
- ✅ Good, because no server bundling is needed, ever.
- ❌ Bad, because first request pays esm.sh build latency.
- ❌ Bad, because CDN availability becomes a runtime dependency.

### unpkg/jsDelivr with a runtime resolver

- ✅ Good, because the file CDNs are stable and fast.
- ❌ Bad, because bare-specifier resolution must be re-implemented
  client-side and CJS support is incomplete.

### Server-side pre-bundling per app

- ✅ Good, because bundles are optimized and auditably pinned.
- ❌ Bad, because a server build pipeline contradicts the
  no-build-infra requirement and adds deploy latency per app.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
