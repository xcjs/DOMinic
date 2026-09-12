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
