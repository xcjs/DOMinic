---
type: index
title: Coordination Protocol
description: How DOMinic's coding agents divided work over GitHub Issues — the /coordinate skill, the wire protocol, the v1→v3 playbooks, and the research behind them.
tags: [coordination, agents, moc, dominic]
repo_head: "be8645f"
ingested: 2026-09-12
refreshed: 2026-09-12T23:40:00Z
---

# Coordination Protocol

Five engineers and their coding agents (Claude Code, Codex, Pi, opencode) edited one repo in one afternoon. GitHub Issues was the shared memory: a task board and a negotiation channel at once. This is the map of how that worked. Back to [[DOMinic Home]].

## The pieces

| Note | What it is |
| --- | --- |
| [[Agent Coordination over GitHub Issues]] | The overview doc (`docs/agents/coordination.md`): the protocol in four lines, where it lives, the daily loop. |
| [[Coordination Best Practices v3]] | **Active playbook** — evidence from the sprint, six calibrated rules, enforcement status. Read this first for the rules that actually held. |
| [[Coordination Best Practices v2]] | Reconciliation of all three research answers into one sprint playbook (historical). |
| [[Coordination Best Practices v1]] | First cut from the first research answer (historical). |
| [[Coordination Research (Q01)]] | The research question asked at 14:15 and its three answers — two external deep-research runs and one in-session agent report — that seeded the playbooks. |

The runnable pieces live in the repo, not the vault: `.claude/skills/coordinate/` holds `SKILL.md` (workflow), `references/protocol.md` (wire format v2 + invariants), and the two scripts `coord.sh` (bash) and `coord.ps1` (the Windows PowerShell port, #36).

## The protocol in four lines

- **Assignment owns responsibility** — an issue with an assignee has one accountable owner; `status:in-progress` marks active work.
- **Labels describe state** — `ws:*` workstream, `status:*` lifecycle, `p0`–`p2` priority, `type:*`, `needs-human`.
- **Scopes and completion are verified** — a `## Files` glob must cover the linked PR's diff, and `DONE` requires a merged PR plus checked criteria.
- **Comments are structured** — every protocol comment opens with a bold verb and an actor line: `**CLAIM** | agent: pi/1 | human: @xcjs | at: <ISO-8601 UTC>`.

## How it evolved

1. **The skill** (`/coordinate`, PR #7) was built at the start: labels, a pinned hub issue (#5), a verb protocol, and `coord.sh`. It seeded the board and ran the whole sprint.
2. **The research** (Q01) was run in parallel by Michael — two external deep-research passes plus an in-session agent — asking how autonomous agents should coordinate in a short sprint.
3. **v1 → v2 → v3.** v1 came from the first answer; v2 reconciled all three; **v3** scored the day's actual GitHub record against v2 and kept, changed, or dropped each rule with evidence. v3 is the one to follow next time.
4. **Hardening** (#75) folded v3's invariants — file-scope coverage, completion checks, one canonical hub — back into the protocol doc and scripts.

## Going forward: lanes and the review rotation

> [!note] Active mode since ADR 0012 (PR #78): the full protocol
> Sprint mode is off. Stale window six hours + three-hour grace (`COORD_STALE_MIN` default 360), `STATUS` at least hourly during active work, explicit `ACCEPT` before a shared contract merges, `HANDOFF` across sessions. See [[Agent Coordination over GitHub Issues]] and [[ADR 0012 - End of the hackathon scope]].

The post-sprint [[Post-Hackathon Roadmap (NEXT)#Roles and working agreement|roadmap]] assigns each collaborator a lane (paths they own + roadmap steps), a path-ownership rule (a PR touching another lane needs that owner as reviewer), a reviewer rotation, and the issue → PR → merge loop from v3: one issue per step, single-purpose PRs, distributed merge by any non-author approver once CI is green.

## What actually happened on the board

76 PRs, a pinned hub (#5), a late second `hub`-labelled dashboard (#54) that briefly split SYNCs until [[Commit Timeline|#57]] fixed hub selection, and two of the user's own Claude sessions coordinating a work split over the same clone (see [[Repo Watch Log]]). The live board snapshot at sprint's end is [[Coordination Board]].

> [!note] This vault owner built the skill
> The `/coordinate` skill and its protocol were authored in this project's Claude sessions (Brandon, `@r0073d-l053r`), then adopted and hardened by the team. The [[Submission Form Draft#Team contributions|contribution record]] and [[Commit Timeline]] carry the PR-level detail.
