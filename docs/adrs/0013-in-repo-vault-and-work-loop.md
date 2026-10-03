---
type: Architecture Decision Record
title: In-repo vault and the work loop
description: The project's second brain lives in the repository as vault/, and a harness-agnostic work loop drives roadmap steps through /coordinate while recording sessions and milestones in it.
status: accepted
tags: [process, tooling, agents, vault]
generated: { by: claude-code/claude-fable-5.1, at: 2026-10-02T00:00:00Z }
verified: { by: human:brandon, at: 2026-10-02T00:00:00Z }
---

# In-repo vault and the work loop

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0013 | accepted | 2026-10-02 | Brandon; lane owners by review |

## Technical Story

During the hackathon one collaborator kept an Obsidian vault that mirrored
the repository's docs with a fixed schema (OKF-style frontmatter, generated
notes regenerated from `docs/`, hand-written synthesis notes) and used it to
brief agents, track the board, and record what changed. It lived outside the
repository, so only one machine and one person had it. With the roadmap in
`NEXT.md` and work continuing part-time across five people and several
agent harnesses, the project needs that memory to be shared, and it needs a
way for any agent to pick up the next step, record progress, and survive
the context compaction every harness performs.

## Context and Problem Statement

Agents forget between sessions and inside long ones. Humans forget which
step is next. A roadmap, an issue board, and a vault each hold part of the
answer, but nothing connected them: nothing told an agent arriving cold
what to do first, nothing wrote down a milestone when a PR merged, and
nothing captured a session's state before the harness compressed it away.
Where should the vault live so every agent can read and write it, and what
is the smallest loop that keeps roadmap, board, and vault consistent
without depending on one harness's scheduler?

## Decision Drivers

- Any harness: Claude Code, Codex, Pi, opencode, Cursor, cron, or a human
  must be able to run the same loop with the same tools (`node`, `git`,
  `gh`).
- One shared memory: milestones and session notes must be visible to every
  collaborator and machine, versioned with the code.
- Keep the schema already in use rather than inventing a second one.
- The loop must never hold state itself; restarts and compaction are the
  normal case, not the failure case.
- Respect the coordination protocol: lanes, one in-progress issue, phase
  gates, `## Files` before code.

## Considered Options

- Vault outside the repository, loop inside one harness's scheduler
- Vault in the repository, loop as a plain script any harness can run
- No vault; rely on issues, PR descriptions, and chat history

## Decision Outcome

Chosen option: **vault in the repository, loop as a plain script**,
because shared memory has to travel with the code, and a loop that is just
a script is the only kind every harness can run.

- `vault/` is committed. It adopts the existing schema unchanged - the
  generated folders (`ADRs/`, `Conventions/`, `Coordination/`,
  `Hackathon/`, `Specs & Plans/`, `Repo Config/`, Commit Timeline), the
  hand-written synthesis notes (Home, Architecture Overview, Repo Map,
  Open Questions & Gaps), and OKF-style frontmatter with `repo_head` and
  `ingested` on generated notes - and adds two folders the loop owns:
  `Milestones/` (one note per merged roadmap step) and `Sessions/` (one
  note per checkpoint). `.obsidian/workspace*` is ignored; `app.json` is
  tracked. `vault/` is excluded from markdownlint.
- The loop is `.claude/skills/work-loop/scripts/loop.mjs` (Node 24, no
  dependencies), exposed as `npm run loop`. Commands: `start` (resume brief,
  pick the next eligible step, create and claim its issue through
  `/coordinate`, branch, print the work brief), `checkpoint` (Session note
  plus `STATUS` or `HANDOFF`), `resume` (the post-compaction digest),
  `milestone` (`coord done`, Milestone note, progress refresh), `next`,
  `status`, `vault-init`, `vault-sync`.
- Eligibility is computed from `NEXT.md` and the issue board every time:
  lane first, one in-progress per agent, phase order, sequential order in
  the phases `loop.config.json` names, and declared parallel steps. The
  config also names the roadmap file and the vault path, so the loop
  serves other repositories unchanged.
- `vault-sync` runs the ingest script (Python 3) that regenerates the
  generated half of the vault from `docs/`; a Node port is deferred until
  a contributor lacks Python.
- The Claude Code skill `/work-loop` and `docs/agents/work-loop.md` are the
  two entry points; the former loads automatically, the latter is for
  every other harness.

### Confirmation

A fresh clone plus `export COORD_AGENT=...` and `npm run loop -- start`
claims the next eligible step and prints its brief with no other setup;
`checkpoint` followed by a new session's `resume` reproduces the step,
branch, and next action; `milestone` after a merged PR closes the issue and
leaves a note under `vault/Milestones/` that Home links to.

## Pros and Cons of the Options

### Vault in the repository, loop as a plain script

- ✅ Good, because every agent and machine shares one memory, reviewed
  through the same PRs as the code.
- ✅ Good, because the loop has no harness dependency and no state.
- ❌ Bad, because vault edits add commits and can conflict; mitigated by
  one-note-per-event files and the loop writing only its own folders.

### Vault outside the repository, loop inside one harness's scheduler

- ✅ Good, because it already existed and needed no repo changes.
- ❌ Bad, because only one person had it, and the scheduler would have
  tied the loop to Claude Code.

### No vault; rely on issues, PR descriptions, and chat history

- ✅ Good, because it adds nothing.
- ❌ Bad, because chat history is exactly what compaction destroys, and
  issues do not hold a session's half-finished state.

## Links

- Executes [NEXT.md](../../NEXT.md) through
  [ADR 0012](0012-end-of-hackathon-scope.md)'s full coordination protocol
- Builds on [coordination.md](../agents/coordination.md) and the
  `/coordinate` skill
- Related to [ADR 0011](0011-node-24-lts-runtime-standard.md) (the loop
  targets Node 24)
