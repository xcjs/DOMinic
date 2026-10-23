---
type: changelog
title: DOMinic changelog
description: What each roadmap phase from NEXT.md delivered, newest first, with the pull requests behind it.
tags: [changelog, release-notes, roadmap]
generated: { by: claude-code/claude-opus-5.5, at: 2026-10-23T22:34:00Z }
---

# Changelog

What each roadmap phase in [NEXT.md](NEXT.md) delivered, newest first.

## Phase 0: Stabilize the floor (2026-10-02 to 2026-10-05)

The core loop now has a test that gates every merge, the server no
longer reads keys from its environment, and the docs match the code.

### Exit criteria

- **CI runs lint, typecheck, build and e2e, all green on `main`.**
  Branch protection requires all five jobs: Markdown lint, Typecheck,
  Build and E2E since #104, and ESLint since #130.
- **No key is read from the environment.** The chat route returns 401
  without a per-request key (#89).
- **The ADRs match the code.** ADR 0012 records the five-slice layout
  and the store style (#78), and ADR 0002 records the lint toolchain as
  built after 0.4 (#127).

### The six steps

| Step | What landed | PR |
| --- | --- | --- |
| 0.1 | A Playwright test of the core loop (install, reload, update, break, Ask Agent to Fix), required on `main` | #91, #104 |
| 0.2 | The server's env-var API-key fallback, removed | #89 |
| 0.3 | A baseline Content Security Policy | #90 |
| 0.4 | ESLint with a slice-boundary rule, and lint-staged in pre-commit; `vue-tsc` stays in CI (ADR 0002) | #94 |
| 0.5 | The README truth pass, and ADR 0012 | #86, #78 |
| 0.6 | The dead `useChatStore`, removed; the registry is the one source of installed apps | #98 |

### Also landed

- Ask Agent to Fix reaches the agent when the chat is closed (#95).
- Coordination:
  - the playbook is folded into the coordinate skill (#85);
  - `COORD_HUMAN` lets an agent's account sign for its human (#96);
  - `coord.sh` fixes for macOS (#88), for `done` (#97, #119), and for
    a `COORD_HUMAN` with a leading `@` (#129).
- Phase 3, early: the phone layout below 768px (3.1, #100), window
  snapping (3.2, #103), multi-desktop workspaces (3.2b, #123), and
  README follow-ups (#122, #125).

21 pull requests merged from October 2 to 6.

### Next: Phase 1, harden the two seams

In order: 1.1 an async VFS with a driver registry, 1.2 the sandboxed
runner, 1.3 the dependency vetting gate, then 1.4 tightening the CSP to
the sandbox model. Phase 1 is sequential, with one owner per seam, and
the Phase 0 e2e suite stays the definition of "still works".
