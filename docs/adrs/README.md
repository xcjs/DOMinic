# Architecture Decision Records

This directory records significant architecture and tooling decisions
for DOMinic using [MADR 4.0](https://adr.github.io/madr/) (Markdown Any
Decision Records).

## What is an ADR?

A short markdown document that captures one decision: the context that
forced it, the options considered, and the outcome with its consequences.
ADRs are immutable history — we do not rewrite accepted records, we supersede
them with new ones.

## Conventions

- **Numbering:** sequential, zero-padded to 4 digits (`0001`, `0002`, …).
  `0000` is the meta-ADR that establishes this practice.
- **File naming:** `NNNN-short-title.md` with the title in kebab-case, e.g.
  `0001-use-typescript.md`.
- **Statuses:**
  - `proposed` — under discussion.
  - `accepted` — decided and in force.
  - `superseded` — replaced by a later ADR (the file is kept; the status
    line names its successor).
  - `deprecated` — no longer relevant without a direct successor.

## Adding a new ADR

1. Copy `template.md` to `NNNN-short-title.md` using the next free number.
2. Fill in every section; keep it short — the goal is context, not an essay.
3. Set status to `proposed` and open a pull request for discussion.
4. On acceptance, update the status to `accepted` and merge.

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0000](0000-record-architecture-decisions.md) | Record architecture decisions | accepted |
| [0001](0001-feature-slices-with-domain-driven-organization.md) | Feature slices with domain-driven organization | accepted |
| [0002](0002-strict-typescript-and-lint-toolchain.md) | Strict TypeScript and lint toolchain | accepted |
| [0003](0003-pinia-per-domain-stores.md) | Pinia per-domain stores | accepted |
| [0004](0004-dominic-os-shell-and-taskbar.md) | DOMinic OS shell and taskbar | accepted |
| [0005](0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md) | Agent chat via Vercel AI SDK with server-side provider proxy | accepted |
| [0006](0006-agent-authored-runtime-compiled-components.md) | Agent-authored runtime-compiled components | accepted |
| [0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md) | Virtual filesystem with pluggable storage drivers | accepted |
| [0008](0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md) | Runtime NPM dependency loading via esm.sh with vetting | accepted |
| [0009](0009-cors-first-networking-with-chrome-masking-proxy-fallback.md) | CORS-first networking with Chrome-masking proxy fallback | accepted |
| [0010](0010-agent-app-interface-and-tool-protocol.md) | Agent app interface and tool protocol | accepted |
