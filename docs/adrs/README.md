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
