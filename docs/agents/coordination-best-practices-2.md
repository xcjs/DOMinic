---
type: playbook
title: Coordination Best Practices v2 — Sprint Minimum and Full Protocol
description: Supersedes coordination-best-practices.md. Reconciles three research answers to Q01 into one sprint-minimum protocol (six verbs, a two-stage lease, declare-then-proceed on seams, file-glob ownership) and the full protocol to switch back to.
tags: [agents, coordination, process, hackathon, research]
status: active
supersedes: coordination-best-practices.md
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T18:45:00Z }
sources:
  - id: q01-answer-1
    resource: Q01 answer 1 — 2026-09-12-14-16-Q01-Agent-First-GitHub-Issues-Coordination.md (external deep research run by human:michael; held outside the repo)
    title: Q01 answer 1 — lease don't lock, contracts on seams, tiny PRs
  - id: q01-answer-2
    resource: Q01 answer 2 — 2026-09-12-14-20-Q01-Agent-First-GitHub-Issues-Coordination.md (external deep research run by human:michael; held outside the repo)
    title: Q01 answer 2 — six-verb sprint set, 20-minute lease, file-glob ownership
  - id: q01-agent
    resource: Q01 agent report — 2026-09-12-Q01-Agent-First-GitHub-Issues-Coordination.md (in-session deep-researcher; held outside the repo)
    title: Q01 agent report — declare-then-proceed, two-stage stale ladder, identity by login
  - id: v1
    resource: coordination-best-practices.md
    title: Coordination best practices v1 (superseded)
  - id: protocol
    resource: ../../.claude/skills/coordinate/references/protocol.md
    title: Coordination protocol v1
---

# Coordination best practices v2 — sprint minimum and full protocol

Supersedes [coordination-best-practices.md](coordination-best-practices.md),
which is kept for the record. Three independent research answers to
the same question (Q01) agree on the shape and disagree on the numbers;
this document is the reconciliation, with every override stated. Read
it in four minutes at session start. Sprint rules apply until
**16:00 ET**; the full protocol applies afterwards.

## Why Issues at all

The agents cannot hear the table. Any decision made aloud is invisible
to four of the five workers. Issues is not overhead; it is the only
write channel into the agents' shared world. Humans talk freely; the
ledger exists so absent agents stay correct. Everything in the protocol
that does not keep an absent agent correct is cuttable today.

## The five rules

1. **Own by assignment; fence by merge.** Assignment says who is
   working on what. It is an efficiency lock with no fencing token, so
   correctness never rests on it: *release is a coordination signal,
   not a code lock — the git branch is the fence.* Small PRs the owner
   merges are where collisions actually get caught.
2. **Files globs are the most valuable field on the board.** Every
   CLAIM names the globs it will touch. Before claiming, check the
   board for overlap. The shared kernel (`app/shared/**`, the stores)
   has one writer; everyone else proposes on its contract issue.
3. **Declare seams before code; do not wait for permission.** On a
   `type:contract` issue, PROPOSE the interface and write it into
   **Agreed** marked *provisional*, then build against it immediately.
   One COUNTER is allowed; a second disagreement goes to
   `needs-human`. Un-countered for 15 minutes, it is binding.
4. **Lease in two stages.** Silent for 20 minutes on all channels —
   comments, commits, PR pushes? Post a QUESTION. Still silent 10
   minutes later? `release --stale`. Never release without the ping.
5. **Tiny PRs into `main`, continuously.** Branch per issue, rebase,
   PR every 20–30 minutes, owner merges. Verify by booting `main`.
   Never push a follow-up commit to an open PR here — open a new one.

## Sprint minimum — until 16:00 ET

| Use | Meaning |
| --- | --- |
| CLAIM | Assign yourself; the body carries a one-line plan and the Files globs. No ETA. |
| BLOCKED | Say by what (`#n` or `@login`) and what would unblock. Fold questions into the body. |
| PROPOSE | Declare a seam interface on a `type:contract` issue, then proceed. |
| ACCEPT | Optional fast confirmation; silence for 15 minutes accepts. |
| DONE | Only with a *merged* PR URL and every `## Done when` box ticked. |
| SYNC | Hub only: once at session start, once when the golden path first boots on `main`, once at your last merge. |

Two more, used sparingly: **QUESTION** to ping a silent claim or to
escalate with `--human`; **RELEASE** to hand a claim back.

Dropped for the sprint (restored in the full protocol): clock-driven
STATUS, plan-and-ETA requirements, COUNTER beyond one round, REJECT,
HANDOFF, UNBLOCKED, DEP-DONE, REVIEW-on-issue, the
`claimed`/`in-progress` distinction (treat them as one state; the
assignee is the real state), and priorities other than `p0`.

Liveness is activity, not ceremony: commits, PR pushes, and issue
updates count as heartbeats. A STATUS is only needed when you have been
silent on all three for 20 minutes.

## Parameters

| Parameter | Sprint | Full | Basis |
| --- | --- | --- | --- |
| Stale ladder | warn at **20 min**, release at **30 min** | 45 min | A lease is a small fraction of lifetime (Chubby); remind-then-unclaim is the OSS claim-bot norm (Zulipbot); the fence sentence bounds the harm |
| Negotiation | PROPOSE → one COUNTER → `needs-human` | four rounds | Escalate early (SRE); loops are a documented agent failure (MAST step repetition; CAMEL max turns) |
| Auto-accept | 15 min un-countered | explicit ACCEPT | Below the 20-min silence ceiling, so a live agent will have seen it |
| Claims per agent | **1 active** (+1 blocked) | 2 | Little's law; unfinished work at a hard deadline scores zero |
| `needs-human` unanswered | 10 min → post the reversible assumption, continue | wait | Escalation ladders re-escalate; they do not block forever |
| Board polling | ≤ 1 read per minute, one `gh issue list --json` call | same | GitHub secondary limits — 900 points/min, 80 content-creates/min, 100 concurrent — bite before the 5,000/hour cap |

Run the sprint values today with no script change:

```bash
export COORD_STALE_MIN=30   # the script releases at 30; you ping at 20
```

The three answers disagreed on the lease: 90 minutes (answer 1, to
protect heads-down humans), 20 minutes (answer 2), 20 + 10 (agent). The
two-stage ladder with the fence sentence adopts answer 1's concern —
nobody is released without a ping — while keeping a value that means
something in a 100-minute window. Recorded as our judgment; the exact
minutes are analogy in all three sources.

## Written down versus said aloud

The test: *would an agent that was not in the room produce wrong code
without this?* If yes, write it before the conversation ends — the
deciding human's agent writes it immediately. Must be written: seam
interfaces, `## Done when`, Files ownership and changes to it, blockers
and what unblocks them, any decision an absent agent must honour. Can
stay aloud: nudges, merge timing, coffee.

## Integration cadence

- Branch per issue; tiny PRs into `main`; the owner merges
  continuously.
- One integration checkpoint, once: the first time the golden path
  (ask → install → use → reload → update) runs end to end on `main`.
  Merge or explicitly defer every open PR at that moment.
- Kernel files: a contract issue each, one writer, stub the interface
  early so dependents build against the stub.

## Identity and parsing — for a heterogeneous fleet

- Ownership keys on the GitHub **assignee/login**; time keys on the
  API's `createdAt`. The typed `agent:` and `at:` header fields are
  advisory — two teammates on the same model produce identical
  `agent:` strings.
- The header is always the comment's **first line**. Parsers use the
  anchored form `test("^\\*\\*(CLAIM|...)\\*\\*")`; no-bash agents match
  the literal prefix `**CLAIM**`.
- Fallback timestamp: `date -u +%Y-%m-%dT%H:%M:%SZ` (portable across
  BSD and GNU `date`).
- Where v1's SKILL.md and protocol.md disagree — the negotiation cap,
  the comment matcher — follow this document.

## Failure modes on the board

| Signal | Failure | Response |
| --- | --- | --- |
| Comments rising, merged PRs flat over 30 min | Protocol theater (MAST: failures are organizational; more verbs do not buy correctness) | Stop coordinating; ship |
| A PR touches a kernel file with no linked contract | Guessed interface (MAST specification failures, 41.8%) | PROPOSE the seam now; the PR waits for the provisional Agreed |
| `status:claimed`, no commits, no comments for 20 min | Ghost lock | QUESTION, then `release --stale` at 30 |
| One login on two active claims | Over-claiming | Release one |
| DONE with unchecked `## Done when` boxes | Premature done (MAST: verification is where failures hide; a verification step raised ChatDev success 15.6 points) | Reopen; merge first |
| "As we discussed" with no issue link | Board talk substituting for the ledger | Write the decision on the issue |
| 429s in an agent's log | Rate-limit storm | One board read per minute; honour `retry-after` |

## Human escalation

`needs-human` is the fastest path when two agents lack the context to
choose; the humans are two feet away. Post `question --human`, then
say the one-liner aloud — co-location is the fastest notification
channel the team has. Unanswered for 10 minutes: post the reversible
assumption you are proceeding on and continue.

## Feedback and versioning

Review this document on its PR or reply on issue #19 with a verb line:
what worked, what cost time, the one change. v3 merges those replies
after 16:00 ET, when the full protocol resumes.

## Sources

Three answers to Q01, reconciled above. Rung 1 = primary source
verified; rung 5 = single source or analogy.

- Cemri et al., "Why Do Multi-Agent LLM Systems Fail?" (MAST),
  arXiv:2503.13657, NeurIPS 2025 — 1,642 traces, κ = 0.88; specification
  41.8%, inter-agent misalignment 36.9%, verification 21.3%. Rung 1.
- Kleppmann, "How to do distributed locking" (2016) — efficiency versus
  correctness locks; fencing tokens. Rung 1.
- Burrows, "The Chubby lock service", OSDI 2006 — lease design. Rung 1.
- Hong et al., "MetaGPT", arXiv:2308.00352 — shared message pool; the
  hub is our analogue. Rung 1 for the source, analogy for the transfer.
- GitHub docs — REST rate limits and secondary limits; Copilot coding
  agent (one agent per issue, no negotiation; it ignores issue comments
  after assignment). Rung 1.
- Zulipbot and OSS claim-bot conventions — remind, then unclaim.
  Rung 2.
- CAMEL — max turns plus an explicit done signal. Rung 1.
- Google SRE book — escalate early. Rung 1 for the source; analogy.
- Trunk-based development; Little's law and Kanban WIP; optimistic
  concurrency at low contention; Conway (1968). Rung 2; transfer by
  analogy.
- GitButler "Grit" field report — parallel agents breaking shared
  state. Rung 5.
- Exact minute values — analogy in all three answers; not measured on
  agent teams.
