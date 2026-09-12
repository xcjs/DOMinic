# DOMinic ADR Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author nine accepted Architecture Decision Records
(ADRs 0001â€“0009) in `docs/adrs/`, one per architectural pillar of the
DOMinic browser OS, using the repo's MADR 4.0 template plus OKF v0.2
YAML frontmatter.

**Architecture:** Documentation only â€” no application code. Each task
creates one complete ADR file, adds its row to the `docs/adrs/README.md`
index, optionally adds a reciprocal link to an earlier ADR's Links
section, verifies with `npm run lint:md`, and commits.

**Tech Stack:** Markdown (MADR 4.0 + OKF v0.2 frontmatter),
markdownlint-cli2 (MD013 line_length 80), husky pre-commit
(`npm run lint:md`), git.

**Spec:** `docs/superpowers/specs/2026-09-12-adr-series-design.md`

## Global Constraints

- Documentation only: no application code, Nuxt scaffold, or CI
  workflows in this effort.
- Nine ADR files in `docs/adrs/`, zero-padded 4-digit numbers,
  kebab-case names, per ADR 0000 conventions.
- All nine ADRs are `accepted` on `2026-09-12`; decider is `Zack`.
- MADR 4.0 structure exactly as `docs/adrs/template.md`: metadata
  table (`| ADR&nbsp;Number | Status | Date | Deciders |`), Technical
  Story, Context and Problem Statement, Decision Drivers, Considered
  Options, Decision Outcome, Confirmation, Pros and Cons of the Options
  (âœ…/âŒ bullets), Links.
- OKF v0.2 YAML frontmatter on every ADR: required `type:
  Architecture Decision Record`; recommended `title`, `description`,
  `tags`; `status: accepted` mirroring the metadata table (the table
  remains the status authority in the body); `generated: { by:
  human:zack, at: 2026-09-12T00:00:00Z }` and `verified: { by:
  human:zack, at: 2026-09-12T00:00:00Z }` (single bare mapping is
  conformant per OKF Â§5.2).
- Prose wraps at 80 columns (MD013; headings, code blocks, and tables
  are exempt in `.markdownlint.jsonc`).
- Cross-links resolve: an ADR may link only to ADRs that already exist
  (ADR 0000, `template.md`, or earlier-numbered ADRs). Reciprocal links
  to later ADRs are added by that later ADR's task as a small edit to
  the earlier file's Links section â€” each commit stays lint-clean.
- Every commit message starts with `docs:`.
- The husky pre-commit hook runs `npm run lint:md` automatically on
  every commit; do not skip hooks.
- Tag sets (pillar tag from spec, deduped when identical):
  - 0001 `tags: [architecture]`
  - 0002 `tags: [architecture, tooling]`
  - 0003 `tags: [architecture]`
  - 0004 `tags: [architecture, platform]`
  - 0005 `tags: [architecture, agent]`
  - 0006 `tags: [architecture, agent]`
  - 0007 `tags: [architecture, storage]`
  - 0008 `tags: [architecture, agent, storage]`
  - 0009 `tags: [architecture, platform]`

## File Structure

- Create: `docs/adrs/0001-feature-slices-with-domain-driven-organization.md`
- Create: `docs/adrs/0002-strict-typescript-and-lint-toolchain.md`
- Create: `docs/adrs/0003-pinia-per-domain-stores.md`
- Create: `docs/adrs/0004-dominic-os-shell-and-taskbar.md`
- Create:
  `docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md`
- Create:
  `docs/adrs/0006-agent-authored-runtime-compiled-components.md`
- Create:
  `docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md`
- Create:
  `docs/adrs/0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md`
- Create:
  `docs/adrs/0009-cors-first-networking-with-chrome-masking-proxy-fallback.md`
- Modify (every task): `docs/adrs/README.md` â€” append one row to the
  Index table.
- Modify (specific tasks): earlier ADR files â€” one line added to the
  Links section for reciprocal links, exactly as specified per task.

---

### Task 1: ADR 0001 â€” Feature slices with domain-driven organization

**Files:**

- Create: `docs/adrs/0001-feature-slices-with-domain-driven-organization.md`
- Modify: `docs/adrs/README.md` (Index table)

**Interfaces:**

- Consumes: ADR 0000 (`0000-record-architecture-decisions.md`) and
  `template.md` format conventions.
- Produces: ADR 0001 file; README index row; Links section in
  `0001` that Tasks 3 and 4 will extend with one reciprocal line each.

- [ ] **Step 1: Create ADR 0001 with this exact content**

````markdown
---
type: Architecture Decision Record
title: Feature slices with domain-driven organization
description: Organize app code into slice-local vertical directories with a thin shared kernel.
status: accepted
tags: [architecture]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Feature slices with domain-driven organization

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0001 | accepted | 2026-09-12 | Zack |

## Technical Story

DOMinic is an agent-driven browser OS whose code will be written and
rewritten largely by an LLM agent. Nuxt's default structure scatters
code by technical layer (`components/`, `composables/`, `stores/`), so
one feature's knowledge is spread thin across many directories. We
need an organization that maps bounded contexts to navigable
directories with enforceable ownership.

## Context and Problem Statement

The agent frequently needs to locate, read, and modify a single
feature without disturbing others. Layer-first directories force
cross-cutting edits, blur ownership, and grow without bound. Bounded
contexts should map 1:1 to directories a human or agent can traverse
in a single pass.

## Decision Drivers

- Slice-local cohesion: everything for one feature lives together.
- An enforceable dependency direction between slices.
- Small, focused directories that are easy for the agent to navigate.
- Compatibility with Nuxt's directory conventions.

## Considered Options

- Slice-local vertical directories
- Classic layer-first directories
- Hybrid: layer-first with per-slice subdirectories

## Decision Outcome

Chosen option: **slice-local vertical directories**, because they give
each bounded context one home, keep the dependency direction
enforceable, and produce the smallest, most navigable change sets for
agent edits.

Each slice lives in `app/features/<slice>/` and owns its
`components/`, `composables/`, `stores/`, `types/`, and `tests/`. A
thin `app/shared/` kernel holds cross-slice contracts: shared types,
interfaces, and utilities. Slices may import from `app/shared/` but
never from other slices; cross-slice communication flows through
shared contracts and stores (ADR 0003). Bounded contexts map 1:1 to
slices.

### Confirmation

Dependency direction is enforced by ESLint import rules once the
lint toolchain lands; code review rejects slice-to-slice imports.

## Pros and Cons of the Options

### Slice-local vertical directories

- âœ… Good, because each bounded context is one navigable directory.
- âœ… Good, because ownership boundaries are explicit and enforceable.
- âŒ Bad, because shared infrastructure needs a deliberate home
  (`app/shared/`).

### Classic layer-first directories

- âœ… Good, because it is the Nuxt default with zero configuration.
- âŒ Bad, because one feature change scatters edits across many
  directories.
- âŒ Bad, because unbounded layer directories blur slice ownership
  over time.

### Hybrid: layer-first with per-slice subdirectories

- âœ… Good, because it preserves familiar top-level layer names.
- âŒ Bad, because it adds nesting without fixing scattered ownership.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table (after the 0000 row):

```markdown
| [0001](0001-feature-slices-with-domain-driven-organization.md) | Feature slices with domain-driven organization | accepted |
```

- [ ] **Step 3: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors (pre-commit will run this too).

- [ ] **Step 4: Commit**

```powershell
git add docs/adrs/0001-feature-slices-with-domain-driven-organization.md docs/adrs/README.md
git commit -m "docs: add ADR 0001 feature slices with domain-driven organization"
```

---

### Task 2: ADR 0002 â€” Strict TypeScript and lint toolchain

**Files:**

- Create: `docs/adrs/0002-strict-typescript-and-lint-toolchain.md`
- Modify: `docs/adrs/README.md` (Index table)

**Interfaces:**

- Consumes: ADR 0001 (enforces slice dependency direction).
- Produces: ADR 0002 file; README index row.

- [ ] **Step 1: Create ADR 0002 with this exact content**

````markdown
---
type: Architecture Decision Record
title: Strict TypeScript and lint toolchain
description: TypeScript strict mode plus type-checked ESLint and vue-tsc gate agent-generated code.
status: accepted
tags: [architecture, tooling]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Strict TypeScript and lint toolchain

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0002 | accepted | 2026-09-12 | Zack |

## Technical Story

DOMinic's agent authors and rewrites application code continuously.
Whatever the compiler and linter do not catch ships as runtime
breakage inside the OS. The toolchain must maximize static safety
while staying Vue-aware, and it must run in CI and before every
commit.

## Context and Problem Statement

Agent-generated code is written fast and reviewed shallowly. We need
maximal compile-time protection (`strict`, `noUncheckedIndexedAccess`),
Vue SFC awareness, and enforcement gates that do not depend on a
human remembering to run them.

## Decision Drivers

- Catch whole classes of errors at compile time, not runtime.
- Consistent style without per-file debate.
- Enforcement in CI and pre-commit, not by convention.
- First-class Vue SFC support (template + script analysis).

## Considered Options

- ESLint (typescript-eslint + eslint-plugin-vue) + vue-tsc
- Oxlint + vue-tsc
- Biome + vue-tsc

## Decision Outcome

Chosen option: **ESLint with type-checked typescript-eslint and
eslint-plugin-vue, plus `vue-tsc --noEmit`**, because it is the only
option with mature Vue-aware rules, full type-checking, and a flat
config that the Nuxt ecosystem (`@nuxt/eslint`) integrates directly.

- TypeScript runs with `strict` and `noUncheckedIndexedAccess`.
- ESLint uses flat config with `recommendedTypeChecked` rules for
  TypeScript and `eslint-plugin-vue` for SFCs.
- `vue-tsc --noEmit` gates CI and pre-commit via lint-staged/husky.

### Confirmation

A fresh Nuxt scaffold lands with this exact configuration; a
deliberate type error and a lint error both fail CI.

## Pros and Cons of the Options

### ESLint (typescript-eslint + eslint-plugin-vue) + vue-tsc

- âœ… Good, because type-checked linting catches `await` misuse,
  floating promises, and unsafe `any` spread.
- âœ… Good, because `eslint-plugin-vue` analyzes templates and SFC
  structure, not just script.
- âŒ Bad, because type-checked linting is slower than syntax-only
  linting.

### Oxlint + vue-tsc

- âœ… Good, because it is dramatically faster on large trees.
- âŒ Bad, because Vue SFC and type-aware rule coverage is still
  incomplete.

### Biome + vue-tsc

- âœ… Good, because it bundles format + lint in one fast binary.
- âŒ Bad, because Vue SFC support is immature and the TypeScript
  rule set is narrower than typescript-eslint.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0002](0002-strict-typescript-and-lint-toolchain.md) | Strict TypeScript and lint toolchain | accepted |
```

- [ ] **Step 3: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```powershell
git add docs/adrs/0002-strict-typescript-and-lint-toolchain.md docs/adrs/README.md
git commit -m "docs: add ADR 0002 strict TypeScript and lint toolchain"
```

---

### Task 3: ADR 0003 â€” Pinia per-domain stores

**Files:**

- Create: `docs/adrs/0003-pinia-per-domain-stores.md`
- Modify: `docs/adrs/README.md` (Index table)
- Modify: `docs/adrs/0001-feature-slices-with-domain-driven-organization.md`
  (Links section â€” one reciprocal line)

**Interfaces:**

- Consumes: ADR 0001 (slice structure; stores live per slice).
- Produces: ADR 0003 file; README index row; reciprocal link from ADR
  0001's Links section.

- [ ] **Step 1: Create ADR 0003 with this exact content**

````markdown
---
type: Architecture Decision Record
title: Pinia per-domain stores
description: One Pinia setup-style store per slice is the only cross-slice state channel.
status: accepted
tags: [architecture]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Pinia per-domain stores

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0003 | accepted | 2026-09-12 | Zack |

## Technical Story

The OS holds live state everywhere: open windows, app registry,
settings, chat sessions. The state must be observable, modular, and
debuggable, and it must not entangle slices that are otherwise
independent.

## Context and Problem Statement

State lives inside components today would be invisible to other apps
and impossible to persist or restore. A global event bus would couple
every slice to every other. We need state primitives that are
Vue-idiomatic, per-slice modular, devtools-inspectable, and SSR-safe.

## Decision Drivers

- Vue-idiomatic reactivity and devtools integration.
- Per-slice modularity matching the slice layout.
- A single, controlled channel for cross-slice state.
- SSR-safety without bespoke lifecycles.

## Considered Options

- Pinia, one setup-style store per slice
- Composables-only state
- Pinia plus a global event bus

## Decision Outcome

Chosen option: **Pinia, one setup-style store per slice**, because it
is Vue's official state library, is devtools-first, is SSR-safe, and
its store-per-slice shape maps exactly onto the slice boundaries.

- Each slice owns its store(s) under `app/features/<slice>/stores/`.
- Stores are the only cross-slice state channel; a slice reaches
  another domain's state by importing its store (declared in
  `app/shared/` when the coupling is contractual).
- No global event bus initially; revisit only if OS-wide signal
  fan-out demands it.

### Confirmation

Code review rejects component-private OS state that duplicates a
store; the devtools Pinia panel shows one store per slice.

## Pros and Cons of the Options

### Pinia, one setup-style store per slice

- âœ… Good, because setup stores use plain `ref`/`computed` the team
  already knows.
- âœ… Good, because per-slice stores mirror slice boundaries 1:1.
- âŒ Bad, because another library adds bundle weight.

### Composables-only state

- âœ… Good, because it adds no dependency.
- âŒ Bad, because ad-hoc composable singletons lose devtools tracing
  and consistent patterns for cross-slice state.

### Pinia plus a global event bus

- âœ… Good, because fan-out signals are trivial to broadcast.
- âŒ Bad, because hidden event coupling defeats the slice boundary
  the store layout creates.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0003](0003-pinia-per-domain-stores.md) | Pinia per-domain stores | accepted |
```

- [ ] **Step 3: Add reciprocal link in ADR 0001's Links section**

In `docs/adrs/0001-feature-slices-with-domain-driven-organization.md`,
the Links section currently ends with:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
```

Change it to:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0003](0003-pinia-per-domain-stores.md)
```

- [ ] **Step 4: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 5: Commit**

```powershell
git add docs/adrs/0003-pinia-per-domain-stores.md docs/adrs/README.md docs/adrs/0001-feature-slices-with-domain-driven-organization.md
git commit -m "docs: add ADR 0003 Pinia per-domain stores"
```

---

### Task 4: ADR 0004 â€” DOMinic OS shell and taskbar

**Files:**

- Create: `docs/adrs/0004-dominic-os-shell-and-taskbar.md`
- Modify: `docs/adrs/README.md` (Index table)
- Modify: `docs/adrs/0001-feature-slices-with-domain-driven-organization.md`
  (Links section â€” one reciprocal line)

**Interfaces:**

- Consumes: ADR 0001 (slice layout), ADR 0002 (toolchain context).
- Produces: ADR 0004 file; README index row; reciprocal link from ADR
  0001's Links section (now two added lines there).

- [ ] **Step 1: Create ADR 0004 with this exact content**

````markdown
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
to find and switch between apps â€” on a phone first, and a desktop
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

- âœ… Good, because the OS metaphor carries the product identity.
- âœ… Good, because window and app lifecycle have one natural home.
- âŒ Bad, because windowing chrome wastes space on phone viewports
  unless actively degraded.

### Single-activity mobile-style shell

- âœ… Good, because it is the natural fit for small screens.
- âŒ Bad, because it abandons the desktop metaphor that defines the
  product.

### Hybrid desktop shell with mobile taskbar

- âœ… Good, because it keeps the desktop metaphor while degrading
  cleanly.
- âœ… Good, because one shell serves both form factors.
- âŒ Bad, because two layout modes must both be tested.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0004](0004-dominic-os-shell-and-taskbar.md) | DOMinic OS shell and taskbar | accepted |
```

- [ ] **Step 3: Add reciprocal link in ADR 0001's Links section**

In `docs/adrs/0001-feature-slices-with-domain-driven-organization.md`,
the Links section currently ends with:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0003](0003-pinia-per-domain-stores.md)
```

Change it to:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0003](0003-pinia-per-domain-stores.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
```

- [ ] **Step 4: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 5: Commit**

```powershell
git add docs/adrs/0004-dominic-os-shell-and-taskbar.md docs/adrs/README.md docs/adrs/0001-feature-slices-with-domain-driven-organization.md
git commit -m "docs: add ADR 0004 DOMinic OS shell and taskbar"
```

---

### Task 5: ADR 0005 â€” Agent chat via Vercel AI SDK

**Files:**

- Create:
  `docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md`
- Modify: `docs/adrs/README.md` (Index table)
- Modify: `docs/adrs/0004-dominic-os-shell-and-taskbar.md` (Links
  section â€” one reciprocal line)

**Interfaces:**

- Consumes: ADR 0004 (Settings app as provider-selection surface).
- Produces: ADR 0005 file; README index row; reciprocal link from ADR
  0004's Links section. (ADR 0007's reciprocal back-link is added by
  Task 7, not here â€” this ADR links only to ADRs that exist at its
  commit time.)

- [ ] **Step 1: Create ADR 0005 with this exact content**

````markdown
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

- âœ… Good, because the browser never sees a provider credential.
- âŒ Bad, because the server stores third-party secrets at rest,
  a liability we refuse.

### Bring-your-own-key direct from the browser

- âœ… Good, because the server never touches keys at all.
- âŒ Bad, because every provider's streaming protocol must be
  re-implemented client-side and CORS policies constrain which
  providers work at all.

### Vercel AI SDK via a Nuxt server route with per-request keys

- âœ… Good, because one unified interface covers the provider
  ecosystem, including streaming and tool calls.
- âœ… Good, because keys transit per-request and are never at rest
  on the server.
- âŒ Bad, because a key still transits the server in memory for the
  duration of a request.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md) | Agent chat via Vercel AI SDK with server-side provider proxy | accepted |
```

- [ ] **Step 3: Add reciprocal link in ADR 0004's Links section**

In `docs/adrs/0004-dominic-os-shell-and-taskbar.md`, the Links
section currently ends with:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
```

Change it to:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
```

- [ ] **Step 4: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 5: Commit**

```powershell
git add docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md docs/adrs/README.md docs/adrs/0004-dominic-os-shell-and-taskbar.md
git commit -m "docs: add ADR 0005 agent chat via Vercel AI SDK"
```

---

### Task 6: ADR 0006 â€” Agent-authored runtime-compiled components

**Files:**

- Create:
  `docs/adrs/0006-agent-authored-runtime-compiled-components.md`
- Modify: `docs/adrs/README.md` (Index table)
- Modify: `docs/adrs/0004-dominic-os-shell-and-taskbar.md` (Links
  section â€” one reciprocal line)

**Interfaces:**

- Consumes: ADR 0004 (`DominicApp` contract named there), ADR 0007
  (VFS persists component source â€” conceptual only; 0007 is written
  by Task 7 and back-links here).
- Produces: ADR 0006 file; README index row; reciprocal link from ADR
  0004's Links section (now two added lines there). (Reciprocal
  back-links from ADRs 0007 and 0008 are added by Tasks 7 and 8.)

- [ ] **Step 1: Create ADR 0006 with this exact content**

````markdown
---
type: Architecture Decision Record
title: Agent-authored runtime-compiled components
description: The agent's Vue SFC applications compile at runtime with vue3-sfc-loader and register on a DominicApp contract.
status: accepted
tags: [architecture, agent]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Agent-authored runtime-compiled components

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0006 | accepted | 2026-09-12 | Zack |

## Technical Story

The agent authors Vue single-file component applications from chat
requests. Users expect to install, preview, and run those apps
immediately â€” with no per-component build step, no bundler run, and
no redeploy of the OS itself.

## Context and Problem Statement

A traditional Vue app compiles at build time; DOMinic's apps are born
at runtime. They must compile in the browser, integrate with the
window manager as ordinary apps, persist their source, and be
removable. Compile-in-an-iframe would isolate them but would wall
them off from OS state and styling.

## Decision Drivers

- No build infrastructure per component.
- A live install-and-preview loop from chat.
- Reuse of the Vue ecosystem (components load dependencies, ADR 0008).
- Apps and widgets register through the same contract as first-party
  apps.

## Considered Options

- Runtime-compiled SFC (vue3-sfc-loader), in-process
- Sandboxed iframe compile
- Prebuilt bundles delivered per app

## Decision Outcome

Chosen option: **runtime-compiled SFC via `vue3-sfc-loader`, in
process**, because it compiles agent-authored SFCs directly in the
browser with no per-app infrastructure and keeps compiled apps first-
class OS citizens.

- Compiled components register as ordinary Vue components, apps, or
  widgets through the component registry in the `os` slice.
- A `DominicApp` base component contract standardizes app metadata,
  launch context props, and install/uninstall lifecycle hooks; the
  built-in Settings app (ADR 0004) is the first implementation.
- Component source persists in the VFS (ADR 0007).
- iframe isolation is documented as a future escape hatch for
  untrusted or crashing apps, not the default path.

### Confirmation

An agent-authored SFC installs from chat, appears in the app
registry, launches as a window, and survives reload via its VFS
source.

## Pros and Cons of the Options

### Runtime-compiled SFC (vue3-sfc-loader), in-process

- âœ… Good, because zero per-app build step keeps the live loop fast.
- âœ… Good, because compiled apps share OS state and styling directly.
- âŒ Bad, because a crashing app shares the page with the OS (iframe
  isolation remains the escape hatch).

### Sandboxed iframe compile

- âœ… Good, because crashes and bad CSS are contained.
- âŒ Bad, because postMessage bridging for state, storage, and
  styling is heavy and erodes the app contract.

### Prebuilt bundles delivered per app

- âœ… Good, because runtime cost is minimal.
- âŒ Bad, because it requires per-app build infrastructure the
  product explicitly avoids.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0006](0006-agent-authored-runtime-compiled-components.md) | Agent-authored runtime-compiled components | accepted |
```

- [ ] **Step 3: Add reciprocal link in ADR 0004's Links section**

In `docs/adrs/0004-dominic-os-shell-and-taskbar.md`, the Links
section currently ends with:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
```

Change it to:

```markdown
- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
```

- [ ] **Step 4: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 5: Commit**

```powershell
git add docs/adrs/0006-agent-authored-runtime-compiled-components.md docs/adrs/README.md docs/adrs/0004-dominic-os-shell-and-taskbar.md
git commit -m "docs: add ADR 0006 runtime-compiled components"
```

---

### Task 7: ADR 0007 â€” Virtual filesystem with pluggable storage drivers

**Files:**

- Create:
  `docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md`
- Modify: `docs/adrs/README.md` (Index table)
- Modify: `docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md`
  (Links section â€” one reciprocal line)
- Modify: `docs/adrs/0006-agent-authored-runtime-compiled-components.md`
  (Links section â€” one reciprocal line)

**Interfaces:**

- Consumes: ADR 0005 (keys stored browser-side in VFS), ADR 0006
  (component source persists in VFS).
- Produces: ADR 0007 file; README index row; reciprocal links from
  ADRs 0005 and 0006 Links sections.

- [ ] **Step 1: Create ADR 0007 with this exact content**

````markdown
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

- âœ… Good, because callers are backend-agnostic per path.
- âœ… Good, because tests can swap drivers freely.
- âŒ Bad, because the metadata-per-path mapping adds a small
  coordination cost.

### localStorage JSON tree only

- âœ… Good, because synchronous reads are trivially simple.
- âŒ Bad, because the ~5 MB ceiling starves component libraries.

### IndexedDB-backed filesystem only

- âœ… Good, because capacity and bulk reads are excellent.
- âŒ Bad, because its async-only API burdens tiny settings reads.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md) | Virtual filesystem with pluggable storage drivers | accepted |
```

- [ ] **Step 3: Add reciprocal link in ADR 0005's Links section**

In
`docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md`,
the Links section currently ends with:

```markdown
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
```

Change it to:

```markdown
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
```

- [ ] **Step 4: Add reciprocal link in ADR 0006's Links section**

In
`docs/adrs/0006-agent-authored-runtime-compiled-components.md`, the
Links section currently ends with:

```markdown
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
```

Change it to:

```markdown
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
```

Also add ADR 0006's line to ADR 0007's Links section (reciprocal
from the VFS side), so ADR 0007's Links section becomes:

```markdown
## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
```

- [ ] **Step 5: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 6: Commit**

```powershell
git add docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md docs/adrs/0006-agent-authored-runtime-compiled-components.md docs/adrs/README.md
git commit -m "docs: add ADR 0007 virtual filesystem with pluggable storage drivers"
```

---

### Task 8: ADR 0008 â€” Runtime NPM dependency loading via esm.sh

**Files:**

- Create:
  `docs/adrs/0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md`
- Modify: `docs/adrs/README.md` (Index table)
- Modify: `docs/adrs/0006-agent-authored-runtime-compiled-components.md`
  (Links section â€” one reciprocal line)
- Modify: `docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md`
  (Links section â€” one reciprocal line)

**Interfaces:**

- Consumes: ADR 0006 (compiled apps load dependencies), ADR 0007
  (vetted metadata and cached builds persist in VFS).
- Produces: ADR 0008 file; README index row; reciprocal links from
  ADRs 0006 and 0007 Links sections.

- [ ] **Step 1: Create ADR 0008 with this exact content**

````markdown
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
ready ESM â€” but arbitrary code execution from a CDN is exactly the
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

- âœ… Good, because CJS transpilation and subpath support just work.
- âœ… Good, because no server bundling is needed, ever.
- âŒ Bad, because first request pays esm.sh build latency.
- âŒ Bad, because CDN availability becomes a runtime dependency.

### unpkg/jsDelivr with a runtime resolver

- âœ… Good, because the file CDNs are stable and fast.
- âŒ Bad, because bare-specifier resolution must be re-implemented
  client-side and CJS support is incomplete.

### Server-side pre-bundling per app

- âœ… Good, because bundles are optimized and auditably pinned.
- âŒ Bad, because a server build pipeline contradicts the
  no-build-infra requirement and adds deploy latency per app.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0008](0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md) | Runtime NPM dependency loading via esm.sh with vetting | accepted |
```

- [ ] **Step 3: Add reciprocal link in ADR 0006's Links section**

In
`docs/adrs/0006-agent-authored-runtime-compiled-components.md`, the
Links section currently ends with:

```markdown
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
```

Change it to:

```markdown
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
- Related to [ADR 0008](0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md)
```

- [ ] **Step 4: Add reciprocal link in ADR 0007's Links section**

In
`docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md`,
the Links section currently ends with:

```markdown
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
```

Change it to:

```markdown
- Related to [ADR 0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
- Related to [ADR 0006](0006-agent-authored-runtime-compiled-components.md)
- Related to [ADR 0008](0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md)
```

- [ ] **Step 5: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 6: Commit**

```powershell
git add docs/adrs/0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md docs/adrs/0006-agent-authored-runtime-compiled-components.md docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md docs/adrs/README.md
git commit -m "docs: add ADR 0008 esm.sh dependency loading with vetting"
```

---

### Task 9: ADR 0009 â€” CORS-first networking with Chrome-masking proxy

**Files:**

- Create:
  `docs/adrs/0009-cors-first-networking-with-chrome-masking-proxy-fallback.md`
- Modify: `docs/adrs/README.md` (Index table)

**Interfaces:**

- Consumes: ADR 0004 (os slice hosts the client helper composable).
- Produces: ADR 0009 file; README index row; final ADR of the series.

- [ ] **Step 1: Create ADR 0009 with this exact content**

````markdown
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

Components and the agent must reach external services â€” public APIs,
web pages, feeds â€” that may or may not send CORS headers. The OS
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

- âœ… Good, because the fast path stays direct and cache-friendly.
- âœ… Good, because one generic route is easy to review and harden.
- âŒ Bad, because proxied traffic adds server bandwidth cost.

### Domain allowlist proxy

- âœ… Good, because abuse surface shrinks to known hosts.
- âŒ Bad, because agent-authored apps cannot reach unlisted
  services without an OS change.

### Per-service proxy routes

- âœ… Good, because each route can carry bespoke transformation.
- âŒ Bad, because server code grows with every new integration.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
````

- [ ] **Step 2: Append the index row to `docs/adrs/README.md`**

Add this as the last row of the Index table:

```markdown
| [0009](0009-cors-first-networking-with-chrome-masking-proxy-fallback.md) | CORS-first networking with Chrome-masking proxy fallback | accepted |
```

- [ ] **Step 3: Verify**

Run: `npm run lint:md`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```powershell
git add docs/adrs/0009-cors-first-networking-with-chrome-masking-proxy-fallback.md docs/adrs/README.md
git commit -m "docs: add ADR 0009 CORS-first networking with proxy fallback"
```

---

### Task 10: Final verification sweep

**Files:**

- Read only: `docs/adrs/*.md`, `docs/adrs/README.md`

**Interfaces:**

- Consumes: all nine ADRs from Tasks 1â€“9.
- Produces: verification evidence for the spec's Verification section.

- [ ] **Step 1: Verify file set**

```powershell
Get-ChildItem docs/adrs -Filter "0*.md" | Select-Object -ExpandProperty Name
```

Expected output â€” exactly these ten lines (0000 plus the nine new
ADRs, in order):

```text
0000-record-architecture-decisions.md
0001-feature-slices-with-domain-driven-organization.md
0002-strict-typescript-and-lint-toolchain.md
0003-pinia-per-domain-stores.md
0004-dominic-os-shell-and-taskbar.md
0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md
0006-agent-authored-runtime-compiled-components.md
0007-virtual-filesystem-with-pluggable-storage-drivers.md
0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md
0009-cors-first-networking-with-chrome-masking-proxy-fallback.md
```

- [ ] **Step 2: Verify frontmatter, statuses, and cross-links**

```powershell
Select-String -Path docs/adrs/000*.md -Pattern '^status: accepted$' | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path docs/adrs/000*.md -Pattern '^type: Architecture Decision Record$' | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path docs/adrs/000*.md -Pattern 'generated: \{ by: human:zack' | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: all three counts are `9`.

Then confirm every ADR link target file exists (no dead ADR links):

```powershell
$targets = Select-String -Path docs/adrs/000*.md -Pattern '\]\(([0-9A-Za-z-]+\.md)\)' -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } |
  Sort-Object -Unique
$targets | Where-Object { -not (Test-Path "docs/adrs/$_") }
```

Expected: empty output (no dead links). `template.md` links are not
matched by this pattern, so no false positives are expected.

- [ ] **Step 3: Verify MADR section coverage per file**

```powershell
$sections = '## Technical Story','## Context and Problem Statement','## Decision Drivers','## Considered Options','## Decision Outcome','## Pros and Cons of the Options','## Links'
foreach ($f in (Get-ChildItem docs/adrs -Filter "000[1-9]*.md")) {
  $c = Get-Content $f.FullName -Raw
  $missing = $sections | Where-Object { -not $c.Contains($_) }
  if ($missing) { "$($f.Name): MISSING $($missing -join ', ')" }
}
```

Expected: no output â€” every ADR contains every MADR section.

- [ ] **Step 4: Run full lint**

Run: `npm run lint:md`
Expected: exit 0, zero errors across the whole repo.

- [ ] **Step 5: Final commit (only if Steps 1â€“4 required fixes)**

If any verification step above forced a fix, commit it:

```powershell
git add docs/adrs
git commit -m "docs: fix ADR series verification findings"
```

If nothing needed fixing, skip this step â€” the series is complete.

---

## Self-Review Notes

Spec coverage check (spec section â†’ task):

- Deliverables (nine files, numbering, kebab-case) â†’ Tasks 1â€“9.
- Common conventions (MADR structure, OKF frontmatter, 80-col wrap,
  status authority, lifecycle, cross-links, deciders row) â†’ Global
  Constraints + every task's content block.
- Per-ADR content (0001â€“0009 stories, drivers, options, outcomes) â†’
  Tasks 1â€“9, each carrying its full ADR body in Step 1.
- README index rows â†’ Steps "Append the index row" in Tasks 1â€“9.
- Non-goals (no app code/CI) â†’ Global Constraints.
- Verification (nine files, valid frontmatter, MADR sections,
  cross-links resolve, `lint:md` clean) â†’ Task 10.

Design decisions recorded here for the implementer:

- ADRs link only to earlier ADRs (plus 0000). Reciprocal links to
  later ADRs are added by the later ADR's own task: Task 7 edits
  ADRs 0005 and 0006, and Task 8 edits ADRs 0006 and 0007. After
  Task 8, ADR 0006's Links section lists 0000, 0004, 0007, 0008, and
  ADR 0007's lists 0000, 0005, 0006, 0008.
- The frontmatter uses single bare `generated`/`verified` mappings,
  which OKF Â§5.2 treats as one-element lists.
- Timestamps are `2026-09-12T00:00:00Z` (the spec's authoring date,
  written as ISO-8601 UTC instants).
- Tag sets come from the spec's ADR list table, prefixed with
  `architecture` and deduped.
- Task 4's Links section deliberately omits ADR 0006 (which does not
  exist yet); the reciprocal ADR 0006 line is added in Task 6.
