# Design: DOMinic ADR Series (ADRs 0001–0009)

Date: 2026-09-12

## Goal

Author the initial series of nine Architecture Decision Records for the
DOMinic browser OS, one per architectural pillar, using the repo's
committed MADR 4.0 template plus OKF v0.2 YAML frontmatter. Documentation
only: no application code is written in this effort.

## Background

DOMinic is an agent-driven browser OS written in Nuxt/TypeScript. It
presents a desktop-like shell (taskbar, windows, apps) designed
mobile-first, and its agent chat can author Vue component applications
at runtime. OS alterations persist in a virtual filesystem over local
storage. Runtime NPM dependencies load into the frontend from a CDN
after automated security vetting. External services are reached
CORS-first, falling back to a transparent server proxy that presents a
latest-stable Google Chrome User-Agent.

The repo already commits (ADR 0000) to MADR 4.0 ADRs in `docs/adrs/`,
and `docs/agents/use-okf.md` mandates Open Knowledge Format v0.2 for
agent knowledge. This design reconciles both.

## Deliverables

Nine files in `docs/adrs/`, numbered sequentially with zero-padded
numbers and kebab-case names, per ADR 0000. All are `accepted` on
2026-09-12, decider Zack.

### Common conventions (all nine ADRs)

- MADR 4.0 structure exactly as `docs/adrs/template.md`: metadata
  table, Technical Story, Context and Problem Statement, Decision
  Drivers, Considered Options, Decision Outcome, Confirmation,
  Pros and Cons of the Options, Links.
- OKF v0.2 YAML frontmatter block:

  ```yaml
  ---
  type: Architecture Decision Record
  title: <display title>
  description: <one-line summary>
  status: accepted
  tags: [architecture, <pillar tag>]
  generated: { by: human:zack, at: <ISO-8601 UTC instant> }
  verified: { by: human:zack, at: <ISO-8601 UTC instant> }
  ---
  ```

- Frontmatter `status` mirrors the metadata table status; the MADR
  table remains the status authority in the body.
- Status lifecycle: `proposed` → `accepted` → `superseded`/`deprecated`.
  Superseded ADRs are kept, linked via the Links section, with
  frontmatter `status: deprecated`.
- Cross-links between related ADRs in the Links section (Refines /
  Related to), plus links to ADR 0000 and the template where apt.
- Markdown wraps at 80 columns per `.markdownlint.jsonc` (MD013);
  must pass `npm run lint:md`.
- Deciders table row: `| NNNN | accepted | 2026-09-12 | Zack |`.

### ADR list

| ADR  | Title                                                        | Pillar tag        |
| ---- | ------------------------------------------------------------ | ----------------- |
| 0001 | Feature slices with domain-driven organization               | architecture      |
| 0002 | Strict TypeScript and lint toolchain                         | tooling           |
| 0003 | Pinia per-domain stores                                      | architecture      |
| 0004 | DOMinic OS shell and taskbar                                 | platform          |
| 0005 | Agent chat via Vercel AI SDK with server-side provider proxy | agent             |
| 0006 | Agent-authored runtime-compiled components                   | agent             |
| 0007 | Virtual filesystem with pluggable storage drivers            | storage           |
| 0008 | Runtime NPM dependency loading via esm.sh with vetting       | agent, storage    |
| 0009 | CORS-first networking with Chrome-masking proxy fallback     | platform          |

### 0001 — Feature slices with domain-driven organization

- Story/Context: Nuxt default layout scatters code by layer;
  DOMinic needs DDD-style bounded contexts that map to navigable
  directories and enforceable ownership.
- Drivers: slice-local cohesion; enforceable dependency direction;
  agent navigability (small focused directories); Nuxt compatibility.
- Considered: slice-local vertical directories; classic layered dirs;
  hybrid layer-with-subdirs.
- Outcome: **slice-local vertical directories**. Each slice lives in
  `app/features/<slice>/` owning its components, composables, stores,
  types, and tests. A thin `app/shared/` kernel holds cross-slice
  contracts (types, interfaces, utilities). Slices may import from
  shared, never from other slices; cross-slice communication flows
  through shared contracts and stores. Bounded contexts map 1:1 to
  slices.

### 0002 — Strict TypeScript and lint toolchain

- Story/Context: agent-driven code generation needs maximal compiler
  and linter safety nets.
- Drivers: catch errors at compile time; consistent style; CI
  enforcement; Vue SFC awareness.
- Considered: ESLint + vue-tsc; Oxlint + vue-tsc; Biome + vue-tsc.
- Outcome: **TypeScript `strict` + `noUncheckedIndexedAccess`**;
  ESLint flat config with type-checked typescript-eslint and
  eslint-plugin-vue; `vue-tsc --noEmit` in CI and pre-commit via
  lint-staged/husky.

### 0003 — Pinia per-domain stores

- Story/Context: OS state (windows, settings, registry, chat) must be
  observable and modular.
- Drivers: Vue-idiomatic; per-slice modularity; devtools; SSR-safe.
- Considered: Pinia per-domain stores; composables only; Pinia plus
  event bus.
- Outcome: **Pinia, one setup-style store per slice**. Stores are the
  only cross-slice state channel. No global event bus initially;
  revisit if OS-wide signal fan-out demands it.

### 0004 — DOMinic OS shell and taskbar

- Story/Context: DOMinic is a desktop-like OS in a browser, mobile-first.
- Drivers: desktop metaphor familiarity; mobile scaling; app/window
  lifecycle management; first-party apps must follow the same contract
  as agent-authored apps.
- Considered: full windowing shell with taskbar; single-activity
  mobile-style shell; hybrid.
- Outcome: **desktop-metaphor shell in an `os` slice**: window
  manager, taskbar, app registry, and built-in **Settings** app as the
  first first-party app on the base app contract (ADR 0006). Mobile
  first: on narrow viewports the taskbar degrades to bottom-nav-style
  sheet with stacked/maximized windows. Settings is the global place
  to configure OS preferences at any time.

### 0005 — Agent chat via Vercel AI SDK with server-side provider proxy

- Story/Context: chat is the primary agent surface; must support
  virtually any LLM provider.
- Drivers: provider-agnostic; streaming; keys never at rest on
  server; no-provider onboarding.
- Considered: server proxy with server env keys; BYOK direct from
  browser; hybrid.
- Outcome: **Vercel AI SDK (`ai` + provider packages)** consumed
  through a Nuxt server route `/api/chat` that streams responses.
  Users select a provider via the Settings app when none is
  configured (chat surfaces the selection flow). Provider API keys
  are stored browser-side in the VFS and sent per-request to the
  server route, which uses them for that request only.

### 0006 — Agent-authored runtime-compiled components

- Story/Context: the agent authors Vue SFC applications from chat
  requests; they must run without a per-component build step.
- Drivers: no build infrastructure; live install/preview loop;
  reuse of Vue ecosystem; registration as apps and widgets.
- Considered: runtime-compiled SFC; sandboxed iframe compile;
  prebuilt bundles.
- Outcome: **runtime-compiled SFC via vue3-sfc-loader**, in-process
  (registered like any Vue component; iframe isolation documented as
  a future escape hatch). A `DominicApp` base component contract:
  app metadata, launch context props, standard lifecycle hooks for
  install/uninstall. Component registry (in the `os` slice) registers
  compiled components as global components, apps, or widgets; source
  persists in the VFS (ADR 0007).

### 0007 — Virtual filesystem with pluggable storage drivers

- Story/Context: OS alterations persist locally; localStorage alone
  is too small (~5 MB) for component libraries.
- Drivers: local-first persistence; variable payload sizes; async vs
  sync ergonomics; testability.
- Considered: localStorage JSON tree; IndexedDB-backed only;
  localStorage now, swap later.
- Outcome: **single `VirtualFileSystem` interface + driver registry**.
  `localStorage` driver (small, synchronous) and IndexedDB driver
  (large payloads, async-backed) ship together; per-path driver
  mapping is stored in VFS metadata, so callers use "either depending
  on the current need". VFS underpins component source, settings,
  provider keys, and the dependency cache.

### 0008 — Runtime NPM dependency loading via esm.sh with vetting

- Story/Context: agent-authored components need arbitrary NPM
  packages at runtime, securely.
- Drivers: full npm ecosystem reach; no server build step; security
  review before execution; offline resilience via caching.
- Considered: esm.sh; unpkg/jsdelivr + runtime resolver; server
  pre-bundling.
- Outcome: **esm.sh as the ESM CDN**; every dependency passes an
  automated vetting gate before load: npm registry/advisory data
  (audit), weekly downloads, license check, publish age, maintainer
  signals; vetted package metadata and cached builds persist in the
  VFS. Recorded caveats: native/binary addons cannot run in browser;
  heavy Node built-in usage depends on esm.sh polyfills; CDN
  availability is a dependency mitigated by the vetting gate and VFS
  caching; first request pays build latency.

### 0009 — CORS-first networking with Chrome-masking proxy fallback

- Story/Context: components and the agent must reach external
  services that may lack CORS.
- Drivers: prefer direct browser requests; bypass CORS gaps
  transparently; avoid anti-bot rejection; single server surface.
- Considered: single generic proxy route; domain allowlist; split by
  service.
- Outcome: **CORS-first direct `fetch`**, with transparent fallback
  to a single generic `/api/proxy` Nuxt server route that rewrites
  the User-Agent to the latest stable Google Chrome, strips
  identifying headers (cookies, referer, origin), and streams the
  response back. Client-side helper composable decides direct vs
  proxy per request.

## Non-Goals

- No application code, Nuxt scaffold, or CI workflows in this effort.
- No OKF frontmatter retrofit for existing docs beyond the new ADRs.
- No implementation plans for the subsystems themselves (each pillar
  gets its own future spec/plan when built).

## Verification

- Nine ADR files exist in `docs/adrs/`, named `0001-…` through
  `0009-…`.
- Each file: valid OKF frontmatter (parseable YAML, required `type`,
  `status`, `generated`, `verified`), MADR sections matching the
  template, 80-column wrap.
- Cross-links resolve (no dead ADR links).
- `npm run lint:md` passes with zero errors.
