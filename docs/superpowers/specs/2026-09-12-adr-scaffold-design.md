# Design: MADR ADR Scaffold in `docs/adrs/`

Date: 2026-09-12

## Goal

Set up an Architecture Decision Record (ADR) practice for the DOMinic
project using the MADR (Markdown Any Decision Records) 4.0 format, in
English. The scaffold is documentation-only: no build tooling or config
files.

## Deliverables

Three markdown files in `docs/adrs/`:

### 1. `0000-record-architecture-decisions.md`

Meta-ADR documenting the decision to use MADR for recording architecture decisions.

- Format: MADR 4.0 structure.
- Title: "Record architecture decisions".
- Status: `accepted`, dated 2026-09-12.
- Content: explains that decisions are recorded in `docs/adrs/`, numbered
  sequentially with zero-padding, named in kebab-case, and that MADR was
  chosen for being lightweight and tool-friendly. Includes considered
  alternatives (Nygard classic format, no ADR practice) and the standard
  MADR outcome sections.

### 2. `template.md`

The standard MADR 4.0 template for future ADRs:

- `# {title}` with placeholder.
- Metadata table: ADR number, status, date, deciders.
- Sections: Technical Story, Context and Problem Statement, Decision
  Drivers, Considered Options (with ✅/❌ pros-cons table), Decision
  Outcome, Pros and Cons, Links.

### 3. `README.md`

Conventions doc covering:

- What an ADR is and why the project uses them.
- Numbering: next sequential zero-padded number (0001, 0002, …).
- File naming: kebab-case (`NNNN-short-title.md`).
- Status lifecycle: proposed → accepted → superseded/deprecated;
  superseded ADRs are kept, not deleted.
- Workflow: copy `template.md`, fill it in, commit.

## Non-Goals

- No `adr-tools`, markdownlint, or CI integration.
- No ADRs beyond 0000.

## Verification

- The three files exist under `docs/adrs/`.
- 0000 ADR and template render correctly as markdown (valid headers/tables).
- README accurately describes the numbering and status conventions used
  by the template and 0000 ADR.
