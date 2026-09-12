---
type: playbook
title: Coordination Best Practices — Sprint Minimum and Full Protocol
description: Evidence-based hardening of the /coordinate protocol — which verbs and parameters to run while the clock is short, what to drop, and when to switch back to the full protocol.
tags: [agents, coordination, process, hackathon, research]
status: superseded
superseded_by: coordination-best-practices-2.md
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T18:30:00Z }
sources:
  - id: q01-external
    resource: Q01 — 2026-09-12-14-16-Q01-Agent-First-GitHub-Issues-Coordination.md (research answer held outside the repo by ws:docs)
    title: Q01 research answer, external deep research run by human:michael
  - id: protocol
    resource: ../../.claude/skills/coordinate/references/protocol.md
    title: Coordination protocol v1
  - id: coordination
    resource: coordination.md
    title: Agent coordination over GitHub Issues
---

# Coordination best practices — sprint minimum and full protocol

> **Superseded** on 2026-09-12 by
> [coordination-best-practices-2.md](coordination-best-practices-2.md),
> which reconciles three research answers. Kept for the record; follow
> v2 where they differ.

Issues plus `gh` is the right ledger for agents: they cannot hear the
table. It is the wrong place for human ceremony. This playbook hardens
protocol v1 (`coordination.md`) with the Q01 research answer and the
review of PR #7. Read it in three minutes at session start. The rules
change at **16:00 ET**, when the sprint ends.

## The three rules

1. **Lease, don't lock.** Assignment still means ownership. Hold one
   claim at a time. A claim goes stale after **90 minutes** without a
   heartbeat, not 45; before releasing someone else's claim, post a
   QUESTION and wait ten minutes. Forty-five minutes false-releases a
   heads-down human and kills trust in the board.
2. **Contracts only on seams.** `type:contract`, PROPOSE, ACCEPT, and
   the **Agreed** block stay for cross-slice APIs — the `install_app`
   handler calling the VFS and the window opener. Intra-slice work
   ships behind CLAIM plus Files globs; no ACCEPT-before-code.
3. **Tiny PRs into `main` every 20–30 minutes, one writer per kernel
   file.** Verify by booting `main`, not by reading the board. Hub SYNC
   is a one-liner.

## Sprint minimum — now until 16:00 ET

Use this while the wall-clock to the demo is four hours or less, or
whenever the humans are at the same table.

| Use today | Drop today |
| --- | --- |
| CLAIM, RELEASE, BLOCKED, QUESTION, ANSWER, PROPOSE, ACCEPT, DONE, HANDOFF, SYNC (hub only) | Mandatory STATUS; plan and ETA on every CLAIM; COUNTER or REJECT beyond one round; REVIEW on the issue; DEP-DONE comments; ACCEPT-before-code outside `type:contract` |

Keep regardless: the bold-verb header, assignment as the lock, the
label state machine, Files globs, the hub, and `needs-human`.

Switch back to the full protocol after submission, or if the humans
leave the table.

## Parameters

| Parameter | Sprint | Full | Why |
| --- | --- | --- | --- |
| Stale claim | **90 min** | 45 min | Lease TTL ≈ max(3 × heartbeat, p99 stall); in a sprint the p99 stall is a heads-down burst |
| Heartbeat | On state change only | Every 30 min | Every comment is a content-create against GitHub's secondary limits |
| Negotiation cap | **2 rounds**, then `needs-human` | 4 | Loops burn clock; four issue rounds can eat half the remaining sprint |
| Claims per agent | **1** | 2 | Kanban WIP ≈ n or n−1; Copilot's assign-to-agent default is one |
| Ping before release | 10 min | 15 min | Preserves trust in the board |

Run the sprint stale value today without waiting for a script change:

```bash
export COORD_STALE_MIN=90
```

The one-claim and two-round rules are behavioural until the script
enforces them (proposed to the skill owner on #6).

## Written down versus said aloud

Talk across the table — it is the cheapest channel. Then **write the
result**: who owns what, what the seam is, what was decided. An agent
that was not in the conversation stays correct only if the ledger has
it. If a conversation changed an owner, a seam, or a decision, it goes
on the issue; if it answered a question, the answer goes on the issue.

## Integration cadence

- PR into `main` every 20–30 minutes; rebase before opening.
- One writer per kernel file (`app/shared/**`, the stores); everyone
  else proposes on the contract issue.
- Verification is booting `main`. "Looks coordinated" is not a state.
- Never push a follow-up commit to an open PR here — the owner merges
  within minutes and the commit strands. Open a new PR instead.

## Failure modes and defenses

| Failure (evidence) | Defense |
| --- | --- |
| Guessed interface, failure to clarify (MAST: inter-agent misalignment 36.9%) | A contract issue with **Agreed** on every seam; ask before building |
| Premature "done", no verification (MAST: ~7–8% each) | DONE only after the change runs on `main`; the PR body says what was verified |
| Negotiation loop (CAMEL ends loops with max turns and an explicit done signal) | Two rounds, then `needs-human`; ACCEPT is the done signal |
| Silent stall, then a false stale release | 90-minute lease; QUESTION first; a human runs `stale` once an hour |
| STATUS storm hitting GitHub secondary limits (80 content-creates/min, 500/hour) | Comment on state change only; `sync` and `board` are read-only |
| Copilot-style "assign and walk away" | Our agents share no PR session — keep the conversation on the issue |

## Human escalation

`needs-human` is the fastest path when two agents lack the context to
choose. Humans skim that label between tasks; an agent posts
`question --human` and moves on. Decisions listed in `QUESTIONS.md`
belong there, not in PROPOSE loops.

## Feedback

Reply on the feedback issue linked from the hub with a verb line: what
worked, what cost time, what you would change. Version 1.1 of this
playbook merges those replies with the remaining research answers.

## Sources

From the Q01 research answer. Rung 1 = primary source verified;
rung 5 = single source. The exact minute values are analogy, not
measurement.

- MAST taxonomy of multi-agent failures (Cemri et al., 2025):
  specification failures 41.8%, inter-agent misalignment 36.9%;
  fail-to-clarify 11.65%, reasoning-action mismatch 13.98%, premature
  termination 7.82%. Rung 1.
- GitHub Copilot coding agent documentation: assignment is the
  primitive; the agent does not read issue comments after assignment.
  Rung 1.
- CAMEL: max-turns plus an explicit TASK_DONE signal to end agent
  loops. Rung 1.
- GitHub REST secondary rate limits (900 points/min, 80
  content-creates/min, 500/hour) and `gh` agent-polling issue
  cli/cli#13357. Rung 1.
- Kanban WIP limits, trunk-based development, and OpenHands CAID on
  integration-time conflicts. Rung 2.
- Lease-TTL reasoning behind the 90-minute stale value. Rung 5.
