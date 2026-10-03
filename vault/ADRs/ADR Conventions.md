---
type: convention
tags: [adr, process]
source: docs/adrs/README.md
ingested: 2026-10-02
repo_head: 0fc772d
---
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
| [[ADR 0000 - Record architecture decisions|0000]] | Record architecture decisions | accepted |
| [[ADR 0001 - Feature slices with domain-driven organization|0001]] | Feature slices with domain-driven organization | accepted |
| [[ADR 0002 - Strict TypeScript and lint toolchain|0002]] | Strict TypeScript and lint toolchain | accepted |
| [[ADR 0003 - Pinia per-domain stores|0003]] | Pinia per-domain stores | accepted |
| [[ADR 0004 - DOMinic OS shell and taskbar|0004]] | DOMinic OS shell and taskbar | accepted |
| [[ADR 0005 - Agent chat via Vercel AI SDK with server-side provider proxy|0005]] | Agent chat via Vercel AI SDK with server-side provider proxy | accepted |
| [[ADR 0006 - Agent-authored runtime-compiled components|0006]] | Agent-authored runtime-compiled components | accepted |
| [[ADR 0007 - Virtual filesystem with pluggable storage drivers|0007]] | Virtual filesystem with pluggable storage drivers | accepted |
| [[ADR 0008 - Runtime NPM dependency loading via esm.sh with vetting|0008]] | Runtime NPM dependency loading via esm.sh with vetting | accepted |
| [[ADR 0009 - CORS-first networking with Chrome-masking proxy fallback|0009]] | CORS-first networking with Chrome-masking proxy fallback | accepted |
| [[ADR 0010 - Agent app interface and tool protocol|0010]] | Agent app interface and tool protocol | accepted |
| [[ADR 0011 - Node 24 LTS runtime standard|0011]] | Node 24 LTS runtime standard | accepted |
| [[ADR 0012 - End of the hackathon scope|0012]] | End of the hackathon scope | accepted |

## As-built reconciliation

On 2026-09-12 each accepted ADR from 0001 to 0010 gained an
`### As built (2026-09-12)` subsection at the end of its Decision
Outcome. It records, with file references, where the code on `main`
matches the golden path and where it diverges. The decision text
itself is unchanged: the record stays a record.

## Hackathon scope ended

[[ADR 0012 - End of the hackathon scope|ADR 0012]] (2026-10-02) ends the
one-afternoon scoping. The "Hackathon POC (Golden Path)" and "Future /
Out of Scope" subsections in ADRs 0001-0010 are historical; each
record's full Decision Outcome is the target again, and ADR 0012 names
the two as-built divergences (slice layout, store style) adopted as the
baseline. Deferred work is sequenced in [NEXT.md](../../NEXT.md).
