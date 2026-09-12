# ADR Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Create a MADR 4.0 ADR scaffold (meta-ADR, template, README) in `docs/adrs/`.

**Architecture:** Documentation-only deliverable — three
standalone markdown files with no tooling. Conventions
(numbering, naming, status lifecycle) are defined in the
README and demonstrated by ADR-0000.

**Tech Stack:** Markdown only.

## Global Constraints

- All documents in English.
- Location: `docs/adrs/`.
- ADR format: MADR 4.0 (Markdown Any Decision Records).
- File naming: zero-padded 4-digit number + kebab-case title, e.g. `0000-record-architecture-decisions.md`.
- Status values: `proposed`, `accepted`, `superseded`, `deprecated`.
- Today's date for the meta-ADR: 2026-09-12.
- No build tooling, no config files (no adr-tools, no markdownlint).
- Note for executors: this workspace is **not a git
  repository**. Before any commit step, ask the user
  whether to run `git init`; if declined, skip all
  commit steps.

---

### Task 1: Meta-ADR `0000-record-architecture-decisions.md`

**Files:**

- Create: `docs/adrs/0000-record-architecture-decisions.md`

**Interfaces:**

- Consumes: nothing.
- Produces: the canonical ADR-0000 referenced by the README index in Task 3.

- [ ] **Step 1: Create the file with this exact content**

````markdown
# Record architecture decisions

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0000 | accepted | 2026-09-12 | Zack |

## Technical Story

The DOMinic project needs a lightweight, durable way to record significant architecture and tooling decisions so that future contributors understand not just *what* was decided, but *why*.

## Context and Problem Statement

Projects accumulate decisions that are cheap to revisit but expensive to re-litigate without context: which libraries to use, which patterns to follow, which conventions to adopt. Tribal knowledge and chat history do not survive team changes. We need a practice for capturing decisions in a format that lives with the code.

## Decision Drivers

- Decisions must be recorded in version-controllable plain text.
- The format must be quick to write and quick to read.
- The format must be understandable without special tooling.
- The practice must be easy for new contributors to adopt.

## Considered Options

- Michael Nygard's classic ADR format
- MADR (Markdown Any Decision Records) 4.0
- No formal ADR practice

## Decision Outcome

Chosen option: **MADR 4.0**, because it keeps Nygard's strengths (plain markdown, short documents) while adding structure that improves quality: explicit decision drivers, considered options with pros/cons, and a decision outcome with consequences. It is widely adopted and works well in code review and pull requests.

Decisions are recorded in this directory (`docs/adrs/`), numbered sequentially starting at 0001 for real decisions (0000 is this meta-ADR), with kebab-case file names.

### Confirmation

Practice confirmed for the start of the project; revisit if the format proves too heavyweight for small decisions.

## Pros and Cons of the Options

### Michael Nygard's classic ADR format

- ✅ Minimal, extremely well known.
- ❌ No explicit place for considered options or their trade-offs.

### MADR (Markdown Any Decision Records) 4.0

- ✅ Lightweight and markdown-native.
- ✅ Forces explicit consideration of alternatives.
- ❌ Slightly more boilerplate than Nygard.

### No formal ADR practice

- ✅ Zero overhead.
- ❌ Decision context is lost over time.

## Links

- [MADR project](https://adr.github.io/madr/)
- [Nygard's original ADR format](http://adamdrake.com/content/2015/07/03/architecture-decision-records-adrs/)
````

- [ ] **Step 2: Verify**

Read the file back and confirm: table renders with a
`Status` cell of `accepted`, date is `2026-09-12`, and
all headings listed above are present.

- [ ] **Step 3: Commit**

If the user approved `git init`: `git add
docs/adrs/0000-record-architecture-decisions.md && git commit
-m "docs: add ADR 0000 (record architecture decisions)"`.
Otherwise skip.

---

### Task 2: MADR Template `template.md`

**Files:**

- Create: `docs/adrs/template.md`

**Interfaces:**

- Consumes: nothing.
- Produces: the template referenced by the README workflow in
  Task 3. Its placeholder fields (`{...}`) are the
  intentional deliverable.

- [ ] **Step 1: Create the file with this exact content**

````markdown
# {title}

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| {NNNN} | proposed | {YYYY-MM-DD} | {everyone involved} |

## Technical Story

{describe the technical story, issue, or requirement that motivates this decision}

## Context and Problem Statement

{describe the context and problem statement in plain language, e.g. using free form / two to three sentences or a list}

## Decision Drivers

- {driver 1, e.g. a force, facing concern, ...}
- {driver 2, e.g. a force, facing concern, ...}
- {driver N, e.g. a force, facing concern, ...}

## Considered Options

- {option 1}
- {option 2}
- {option N}

## Decision Outcome

Chosen option: **{option N}**, because {justification, e.g. only option that meets the decision drivers | which forces and concerns are resolved}.

<!-- This is an optional element. Feel free to remove it. -->
### Confirmation

{describe how you will communicate and/or confirm the decision was implemented correctly}

## Pros and Cons of the Options

### {option 1}

- ✅ Good, because {argument}
- ✅ Good, because {argument}
- ❌ Bad, because {argument}

### {option 2}

- ✅ Good, because {argument}
- ✅ Good, because {argument}
- ❌ Bad, because {argument}

## Links

- {link type, e.g. Refined by} {ADR(s), e.g. ADR-0005}
- {link type, e.g. Related to} {reference(s)}
````

- [ ] **Step 2: Verify**

Read the file back and confirm: the `{...}` placeholders are
present exactly as above, all MADR section headings exist,
and the pros/cons table uses ✅/❌ bullets.

- [ ] **Step 3: Commit**

If the user approved `git init`: `git add docs/adrs/template.md && git
commit -m "docs: add MADR ADR template"`. Otherwise skip.

---

### Task 3: README with Conventions

**Files:**

- Create: `docs/adrs/README.md`

**Interfaces:**

- Consumes: file names from Tasks 1–2 (`0000-record-architecture-decisions.md`, `template.md`).
- Produces: the index and conventions for all future ADRs.

- [ ] **Step 1: Create the file with this exact content**

````markdown
# Architecture Decision Records

This directory records significant architecture and tooling decisions for DOMinic using [MADR 4.0](https://adr.github.io/madr/) (Markdown Any Decision Records).

## What is an ADR?

A short markdown document that captures one decision: the context that forced it, the options considered, and the outcome with its consequences. ADRs are immutable history — we do not rewrite accepted records, we supersede them with new ones.

## Conventions

- **Numbering:** sequential, zero-padded to 4 digits (`0001`, `0002`, …). `0000` is the meta-ADR that establishes this practice.
- **File naming:** `NNNN-short-title.md` with the title in kebab-case, e.g. `0001-use-typescript.md`.
- **Statuses:**
  - `proposed` — under discussion.
  - `accepted` — decided and in force.
  - `superseded` — replaced by a later ADR (the file is kept; the status line names its successor).
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
````

- [ ] **Step 2: Verify**

Read the file back and confirm: the index row links to
`0000-record-architecture-decisions.md` (created in Task 1), the workflow
references `template.md` (created in Task 2), and status values match the
Global Constraints.

- [ ] **Step 3: Commit**

If the user approved `git init`: `git add docs/adrs/README.md && git
commit -m "docs: add ADR conventions README"`. Otherwise skip.
