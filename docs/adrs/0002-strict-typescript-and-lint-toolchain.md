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

- ✅ Good, because type-checked linting catches `await` misuse,
  floating promises, and unsafe `any` spread.
- ✅ Good, because `eslint-plugin-vue` analyzes templates and SFC
  structure, not just script.
- ❌ Bad, because type-checked linting is slower than syntax-only
  linting.

### Oxlint + vue-tsc

- ✅ Good, because it is dramatically faster on large trees.
- ❌ Bad, because Vue SFC and type-aware rule coverage is still
  incomplete.

### Biome + vue-tsc

- ✅ Good, because it bundles format + lint in one fast binary.
- ❌ Bad, because Vue SFC support is immature and the TypeScript
  rule set is narrower than typescript-eslint.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0001](0001-feature-slices-with-domain-driven-organization.md)
