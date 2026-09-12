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

### Hackathon POC (Golden Path)

Building an automated multi-signal security vetting engine (querying
npm registry APIs, advisory databases, and maintainer signals) is
prohibitive within a hackathon timeframe. The POC implements direct
loading with pre-provisioned essentials:

- **Direct esm.sh Resolver**: The `vue3-sfc-loader` `loadModule` handler
  maps unrecognized package specifiers directly to
  `https://esm.sh/${specifier}?bundle`.
- **Pre-provisioned Host Libraries**: Key libraries are mapped
  directly to in-memory host instances to avoid any network round-trip:
  - `vue`: Bound to the running Vue 3 instance.
  - `@vueuse/core`: Essential reactive utilities.
  - `lucide-vue-next`: Crisp icons for apps and controls.
  - `canvas-confetti`: Instant visual feedback for demo apps.
- **System Prompt Guardrails**: The agent system prompt directs the LLM
  to rely on the pre-provisioned set and browser-safe ESM packages,
  avoiding Node.js built-ins (`fs`, `child_process`).

### Future / Out of Scope for POC

- Automated vetting gate querying npm advisory databases (audit), weekly
  download thresholds, license compliance, and package age.
- Local VFS caching of resolved ESM vendor bundles for offline
  execution.
- Static import-analysis sandbox gating.

### Open Questions

- **OPEN QUESTION: Version Pinning**: Should the agent be instructed to
  pin dependency versions (e.g. `canvas-confetti@1.9.3`) or use bare
  names? (Recommendation for POC: Bare names or `@latest` let esm.sh
  resolve quickly; pre-provisioned libraries bypass resolution
  entirely).

### Confirmation

A component importing a vetted package loads and runs; a package
failing the vetting gate is refused with its reasons surfaced.

### As built (2026-09-12)

**Matches the golden path:**

- `compileVueSfc` hands `vue3-sfc-loader` a `moduleCache` binding `vue`,
  `@vueuse/core`, `lucide-vue-next` and `canvas-confetti` to host imports,
  so those four skip the network (`app/features/apps/runner/loader.ts:16`).
- Every other specifier is fetched from `https://esm.sh/${url}?bundle`; a
  non-OK response throws `Failed to load external dependency`
  (`app/features/apps/runner/loader.ts:27`).
- The system prompt advertises the host imports and forbids Node built-ins
  (`fs`, `path`, `child_process`, `process`)
  (`app/features/chat/prompts/systemPrompt.ts:36`).
- No vetting gate and no VFS dependency cache exist; `vfs.ts` is a
  localStorage store the loader never calls (`app/features/shared/vfs.ts:11`).

**Differs from this record:**

- ADR: the `loadModule` handler resolves specifiers -> main: resolution lives
  in the `getFile` option and every non-`http` path, relative imports
  included, is rewritten to esm.sh (`app/features/apps/runner/loader.ts:27`).
- ADR: the prompt steers the LLM to "browser-safe ESM packages" -> main: the
  prompt never mentions esm.sh or npm, only the host set, and names Lucide
  without its `lucide-vue-next` specifier
  (`app/features/chat/prompts/systemPrompt.ts:30`).
- ADR: silent on styling -> main: classes in agent SFCs resolve through the
  Tailwind play CDN `https://cdn.tailwindcss.com` (`nuxt.config.ts:32`), a
  second unpinned CDN dependency; build-time content globs scan only
  `app/**` and `features/**` `*.{vue,ts,txt}` files (`nuxt.config.ts:17`).
- ADR "Confirmation": a refused package surfaces vetting reasons -> main:
  only fetch failures surface, via the runner's error state
  (`app/features/apps/runner/DynamicAppRunner.vue:93`).

**Open question outcome:**

- Version pinning: not addressed. The prompt gives no pinning guidance and
  the loader forwards specifiers verbatim, so bare names resolve to esm.sh
  latest; only the host copies carry semver ranges (`package.json:36`).

Reconciled against main on 2026-09-12; the decision text above is unchanged.

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
