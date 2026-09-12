---
type: Architecture Decision Record
title: Node 24 LTS runtime standard
description: Node 24 LTS is the sole supported runtime, pinned via .nvmrc and enforced in engines and CI.
status: accepted
tags: [tooling, node]
generated: { by: agent/opencode-glm, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Node 24 LTS runtime standard

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0011 | accepted | 2026-09-12 | Zack |

## Technical Story

The repository had no declared Node version. Local development
followed whatever a contributor had installed, CI pinned Node 22 in
the workflow file, and nothing told version managers (nvm, fnm, Volta)
what to use. As DOMinic grows a Nuxt app with runtime-compiled agent
code, an undeclared runtime becomes a source of avoidable
environment drift.

## Context and Problem Statement

- Node 24 is the active LTS line (maintenance begins 2026-10, end of
  life 2028-04), while Node 22 enters maintenance and loses novelty
  features the platform may want.
- Tooling that reads `.nvmrc` (nvm, fnm, Volta, `actions/setup-node`
  with `node-version-file`) cannot be pointed at `package.json`.
- Divergent Node versions between local machines and CI produce
  flaky installs and diffs in `package-lock.json`.

## Decision Drivers

- One declared Node version for every contributor and every machine.
- Version managers and CI read the same source of truth.
- Patch-level precision now, minor-level flexibility later without
  churn.

## Considered Options

- Pin exact patch in `.nvmrc`, range in `engines`
- Pin major only (`24`) everywhere
- Stay on Node 22 LTS

## Decision Outcome

Chosen option: **pin the exact LTS patch in `.nvmrc` with a
compatible `engines` range**, because it gives contributors a
reproducible exact version via their version manager while letting
npm installs succeed across newer Node 24 patches.

- `.nvmrc` contains `24.21.0`, the current Node 24 LTS release
  (published 2026-09-08).
- `package.json` sets `"engines": { "node": ">=24.21.0 <25" }`.
- CI uses `actions/setup-node` with `node-version-file: .nvmrc` so
  the workflow file no longer carries its own version number.
- When a new Node 24 LTS patch ships, update `.nvmrc` and `engines`
  in a routine PR; no ADR amendment needed.

### Confirmation

`node --version` inside a freshly `nvm use`d shell matches `.nvmrc`,
and CI installs with the same version.

## Pros and Cons of the Options

### Pin exact patch in `.nvmrc`, range in `engines`

- ✅ Good, because every contributor and CI runner gets an identical,
  reproducible runtime.
- ✅ Good, because `engines` accepts newer Node 24 patches without a
  repo change.
- ❌ Bad, because patch bumps require touching `.nvmrc` (intentional
  friction).

### Pin major only (`24`) everywhere

- ✅ Good, because it never needs updating mid-line.
- ❌ Bad, because "some Node 24" is not reproducible; two
  contributors on 24.1 and 24.21 can diverge in behavior.

### Stay on Node 22 LTS

- ✅ Good, because it is the line CI already used and needs no
  migration.
- ❌ Bad, because it enters maintenance sooner (2027-04 end of life)
  and forfeits the longer support runway and newer platform
  features of 24.

## Links

- Related to [ADR 0002](0002-strict-typescript-and-lint-toolchain.md)
- Related to [Node.js release schedule](https://github.com/nodejs/release#release-schedule)
