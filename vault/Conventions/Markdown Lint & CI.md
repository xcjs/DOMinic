---
type: convention
title: Markdown Lint & CI
description: The repo's markdownlint, husky, Node 24, and GitHub Actions (lint + typecheck + build) setup, and what the golden path defers.
tags: [dominic, tooling, ci, lint]
sources:
  - id: pkg
    resource: package.json
  - id: lintcfg
    resource: .markdownlint.jsonc
  - id: ci
    resource: .github/workflows/ci.yml
  - id: hook
    resource: .husky/pre-commit
  - id: adr-0002
    resource: docs/adrs/0002-strict-typescript-and-lint-toolchain.md
repo_head: "be8645f"
ingested: 2026-09-12
refreshed: 2026-09-12T23:40:00Z
---

# Markdown Lint & CI

The repo's quality gates as of `be8645f`. Markdown linting was the
only gate early on; CI now also runs `nuxt typecheck` and `nuxt build`.
Raw copies of every config file are in `Repo Config/`. Back to
[[DOMinic Home]].

## Commands

```bash
npm ci               # installs husky + markdownlint-cli2; `prepare` wires the hook
npm run lint:md      # markdownlint-cli2 "**/*.md" "#node_modules" "#.superpowers" "#docs/superpowers"
npm run typecheck    # nuxt typecheck (vue-tsc); runs in CI, not in the hook
npm run build        # nuxt build; runs in CI
```

## markdownlint rules (`.markdownlint.jsonc`)

| Rule | Setting | Effect |
| --- | --- | --- |
| `default` | `true` | All standard rules on |
| `MD013` line length | 80 cols; **headings, code blocks, tables exempt** | Prose must hard-wrap at 80 |
| `MD025` single H1 | `front_matter_title: ""` | An OKF `title:` in frontmatter does not count as a second H1 |

> [!warning] The glob scans dot-directories
> `**/*.md` matches `.claude/skills/**/SKILL.md` too (verified with a probe file). Skills, agent notes, anything markdown anywhere in the tree must obey the 80-column rule or the commit is rejected. The `/coordinate` skill's files (SKILL.md, protocol.md, coord.sh, coord.ps1)
were written to comply. The lint glob also excludes `#docs/superpowers` and
`#.superpowers` so the verbatim plan/spec and research artifacts are not
reformatted.

## Pre-commit hook (`.husky/pre-commit`)

```
npm run lint:md
```

Runs on every commit against the whole tree (no lint-staged). Only active after `npm ci` has run in that clone — a fresh clone without it commits unchecked, but CI catches it.

## GitHub Actions (`.github/workflows/ci.yml`)

- Triggers: push to `main`/`master`, every pull request.
- **Three jobs** on `ubuntu-latest`, each `actions/setup-node` with
  `node-version-file: .nvmrc` (Node 24) + npm cache → `npm ci`:
  - `markdownlint` → `npm run lint:md`
  - `typecheck` → `npm run typecheck` (added #67)
  - `build` → `npm run build` (added #67; `NUXT_TELEMETRY_DISABLED=1`)
- `main` is **branch-protected** and **requires one approving review** (a PR
  author cannot self-approve); PRs are squash-merged. Zack held the merge gate.

## Node, EditorConfig, and line endings

- **Node 24 LTS** is the sole runtime: `.nvmrc` pins `24.21.0`,
  `package.json` `engines` requires `>=24.21.0 <25`, and CI reads `.nvmrc`
  ([[ADR 0011 - Node 24 LTS runtime standard|ADR 0011]]).
- EditorConfig: UTF-8, final newline, trim trailing whitespace, 2-space
  indent; `*.md` keeps trailing whitespace.
- `.gitattributes` sets `*.sh text eol=lf` (PR #7) — bash cannot run CRLF
  files on Windows checkouts, which is why the Windows `coord.ps1` port
  exists alongside `coord.sh` (#36).

## `.gitignore`

- `.superpowers/` — the brainstorming tool's scratch dir (the committed docs live in `docs/superpowers/`).
- `AGENTS.md` — **per-agent instructions are deliberately local-only** (added in PR #2). See [[Open Questions & Gaps]] §5.
- Standard Node ignores plus `.husky/_/`.

## What ADR 0002 defers for the POC

[[ADR 0002 - Strict TypeScript and lint toolchain|ADR 0002]]'s golden path
keeps only `strict: true` in `tsconfig.json`. **No ESLint** was ever
installed — slice-boundary rules stayed convention. The pre-commit hook runs
markdownlint only; type-checking and build moved into **CI** (#67) rather
than the hook, and `nuxt.config` sets `typeCheck: false` so `nuxt build`
does not double-check types (an environment-specific `TS5023`/`TS5042` on
Windows). See [[Open Questions & Gaps]] §7–8.

## Writing a doc that passes

1. OKF frontmatter per [[OKF Frontmatter Convention]] (`type` at minimum; `title`, `description`, `tags`, `generated`, `verified` recommended). Frontmatter lines are exempt from the 80-column rule.
2. One `# H1` matching the frontmatter `title`.
3. Wrap prose at 80 columns; tables and fenced code can run wide.
4. `npm run lint:md` before committing, or let the hook catch it.
