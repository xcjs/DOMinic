---
type: playbook
title: Agent coordination over GitHub Issues
description: How coding agents coordinate ownership, active work, interfaces, review, and completion through GitHub Issues.
tags: [agents, coordination, process, hackathon]
generated: { by: codex/gpt-5, at: 2026-09-12T20:13:30Z }
verified: { by: human:michael, at: 2026-09-12T20:13:30Z }
sources:
  - id: skill
    resource: ../../.claude/skills/coordinate/SKILL.md
    title: coordinate skill (protocol and workflow)
  - id: protocol
    resource: ../../.claude/skills/coordinate/references/protocol.md
    title: Coordination protocol v2 (wire format and invariants)
  - id: playbook
    resource: coordination-best-practices-3.md
    title: Coordination best practices v3
---

# Agent coordination over GitHub Issues

Five engineers and their agents are working the same repository in
parallel. GitHub Issues is the shared memory every agent already has,
so it doubles as the task board and the negotiation channel.

Before your first command, read
[coordination-best-practices-3.md](coordination-best-practices-3.md). It is
the active, evidence-calibrated playbook. V1 and v2 remain as historical
records.

## The protocol in four lines

- **Assignment owns responsibility.** An issue with an assignee has one
  accountable owner; `status:in-progress` identifies active work.
- **Labels describe state.** `ws:*` workstream, `status:*` lifecycle,
  `p0`-`p2` priority, `type:*`, and `needs-human` for escalation.
- **Scopes and completion are verified.** `## Files` must cover the linked
  PR diff, and `DONE` requires a merged PR plus checked criteria.
- **Comments are structured.** Every protocol comment opens with a
  bold verb and an actor line, for example
  `**CLAIM** | agent: pi/1 | human: @xcjs | at: 2026-09-12T18:20:00Z`.

## Where it lives

| Path | Contents |
| --- | --- |
| `.claude/skills/coordinate/SKILL.md` | Workflow: session start, claiming, status, negotiation, finishing |
| `.claude/skills/coordinate/references/protocol.md` | Verb table, tie-break rules, body template, parsing recipes |
| `.claude/skills/coordinate/scripts/coord.sh` | The one script every agent runs (`bash`, `gh`) |
| `docs/agents/coordination-best-practices-3.md` | Active rules, evidence, parameters, and automation status |

Claude Code loads the skill automatically from the repo; invoke it as
`/coordinate sync`. Any other agent with `gh` runs the script directly:

```bash
export COORD_AGENT="pi/1"                      # say who you are
bash .claude/skills/coordinate/scripts/coord.sh sync
```

## Daily loop

1. `sync` before touching files. Bash routes `SYNC` to `COORD_HUB` or the
   lowest-numbered open `hub`; PowerShell currently assumes one hub label.
2. Claim responsibility with a declared file scope and a branch, PR URL,
   or `no-code-yet`. Post `status` when work begins; keep one issue
   `in-progress` and at most one blocked.
3. Record milestones before 20 minutes of silence. Ping a silent owner at
   20 minutes; release at 30 only after the unanswered ping.
4. Put cross-slice interfaces in `## Agreed` on a `type:contract` issue.
   The seam owner acknowledges before shared adapter code merges.
5. Before `review`, compare the PR paths with the union of linked issue
   scopes. Before `done`, verify the PR is merged and every criterion is
   checked.

The live board has one canonical hub. Bash also handles duplicate labels
deterministically; PowerShell parity is pending. File-overlap, PR-scope, and
completion checks are protocol requirements but remain manual preflights in
both helpers. They must not be skipped merely because a command succeeds.

The rules exist because parallel agents fail in predictable ways:
duplicated work, guessed interfaces, and silent claims. Each command
closes one of those gaps.
