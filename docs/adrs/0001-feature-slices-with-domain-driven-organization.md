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

### Hackathon POC (Golden Path)

For the hackathon POC, the team implements three core slices:

- `app/features/os`: Window manager, taskbar, desktop canvas, and app
  registry.
- `app/features/agent`: Chat dock/drawer, prompt templates, streaming
  client, and tool execution handlers.
- `app/features/apps`: Runtime SFC loader engine (`vue3-sfc-loader`) and
  the built-in Settings app.

A thin `app/shared/` kernel holds minimal contracts: shared TypeScript
interfaces (`DominicApp`, `WindowState`, `AppMetadata`) and storage
keys. Slices import from `app/shared/` but avoid cross-slice coupling.
During the hackathon sprint, boundaries are respected by convention
among the 5 SDEs rather than blocking commits on custom lint rules.

### Future / Out of Scope for POC

- Automated ESLint import-boundary enforcement rules.
- Dynamic slice discovery and dynamic micro-frontend packaging.
- AST-based architecture dependency graphing.

### Open Questions

- **OPEN QUESTION: Shared Styling in Runtime Components**: How should
  design tokens and Tailwind utility classes be shared between the host
  OS shell and agent-compiled components without stylesheet pollution?
  (Current POC path: Inject Tailwind via CDN / global stylesheet).

### Confirmation

Dependency direction is enforced by ESLint import rules once the
lint toolchain lands; code review rejects slice-to-slice imports.

### As built (2026-09-12)

**Matches the golden path:**

- Slices are vertical directories under `app/features/` (`os`, `chat`,
  `apps`, `settings`, `shared`), with `srcDir: "app/"` in `nuxt.config.ts:5`.
- `os` holds the window store (`app/features/os/stores/os.ts:21`); `apps`
  holds the SFC runner (`app/features/apps/runner/loader.ts:5`).
- No slice imports another slice; the only cross-directory imports inside
  `app/features` target `../../shared/vfs`
  (`app/features/apps/registry/registry.ts:2`). `app/app.vue:3-14` is the
  sole composition root and wires slices via callbacks (`app/app.vue:123`).
- Boundaries are held by convention: the pre-commit hook only runs
  `npm run lint:md` (`.husky/pre-commit:1`) and no ESLint config exists.

**Differs from this record:**

- ADR names the agent slice `app/features/agent` -> main names it
  `app/features/chat` (`app/features/chat/index.ts:1`).
- ADR puts the Settings app inside `apps` and the app registry in `os` ->
  main has a `settings` slice (`app/features/settings/index.ts:1`) and
  keeps the registry in `app/features/apps/registry/registry.ts:18`.
- ADR names the kernel `app/shared/` -> main has no such directory; it uses
  `app/features/shared/`, auto-imported by `imports.dirs`
  (`nuxt.config.ts:10`).
- ADR says the kernel holds `DominicApp`, `WindowState`, `AppMetadata` and
  storage keys -> it holds a localStorage VFS (`app/features/shared/vfs.ts:1`)
  and a `vue3-sfc-loader` type shim; `WindowState` is a string union at
  `app/features/os/stores/os.ts:4` (the window record is `OsWindow`, `:6`),
  the metadata type is `AppMeta` in `app/features/apps/registry/registry.ts:4`,
  and `DominicApp` is prose (`app/features/chat/prompts/systemPrompt.ts:23`).

**Open question outcome:**

- Resolved as the POC path: the Tailwind Play CDN script is injected in
  `nuxt.config.ts:32` next to build-time content globs (`nuxt.config.ts:17`).
- Runtime SFC styles are appended to `document.head` with no host-side
  isolation, tagged `data-app-id` (`app/features/apps/runner/loader.ts:34`).

Reconciled against main on 2026-09-12; the decision text above is unchanged.

## Pros and Cons of the Options

### Slice-local vertical directories

- ✅ Good, because each bounded context is one navigable directory.
- ✅ Good, because ownership boundaries are explicit and enforceable.
- ❌ Bad, because shared infrastructure needs a deliberate home
  (`app/shared/`).

### Classic layer-first directories

- ✅ Good, because it is the Nuxt default with zero configuration.
- ❌ Bad, because one feature change scatters edits across many
  directories.
- ❌ Bad, because unbounded layer directories blur slice ownership
  over time.

### Hybrid: layer-first with per-slice subdirectories

- ✅ Good, because it preserves familiar top-level layer names.
- ❌ Bad, because it adds nesting without fixing scattered ownership.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0003](0003-pinia-per-domain-stores.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
