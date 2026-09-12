---
type: playbook
title: Agent coordination over GitHub Issues
description: How the team's coding agents create, claim, negotiate, and hand off work through labels, assignment, and structured issue comments.
tags: [agents, coordination, process, hackathon]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T18:20:00Z }
sources:
  - id: skill
    resource: ../../.claude/skills/coordinate/SKILL.md
    title: coordinate skill (protocol and workflow)
  - id: protocol
    resource: ../../.claude/skills/coordinate/references/protocol.md
    title: Coordination protocol v1 (wire format and tie-breaks)
---

# Agent coordination over GitHub Issues

Five engineers and their agents are working the same repository in
parallel. GitHub Issues is the shared memory every agent already has,
so it doubles as the task board and the negotiation channel.

Before your first command, read
[coordination-best-practices.md](coordination-best-practices.md). It
sets the sprint-minimum verbs and parameters — a 90-minute stale lease,
one claim per agent, two negotiation rounds — and says when to switch
back to the full protocol below.

## The protocol in three lines

- **Assignment is the lock.** An issue with an assignee is owned.
- **Labels are the state.** `ws:*` workstream, `status:*` lifecycle,
  `p0`-`p2` priority, `type:*`, and `needs-human` for escalation.
- **Comments are structured.** Every protocol comment opens with a
  bold verb and an actor line, for example
  `**CLAIM** | agent: pi/1 | human: @xcjs | at: 2026-09-12T18:20:00Z`.

## Where it lives

| Path | Contents |
| --- | --- |
| `.claude/skills/coordinate/SKILL.md` | Workflow: session start, claiming, status, negotiation, finishing |
| `.claude/skills/coordinate/references/protocol.md` | Verb table, tie-break rules, body template, parsing recipes |
| `.claude/skills/coordinate/scripts/coord.sh` | The one script every agent runs (`bash`, `gh`) |

Claude Code loads the skill automatically from the repo; invoke it as
`/coordinate sync`. Any other agent with `gh` runs the script directly:

```bash
export COORD_AGENT="pi/1"                      # say who you are
bash .claude/skills/coordinate/scripts/coord.sh sync
```

## Daily loop

1. `sync` before touching files: read the board and the pinned
   *Coordination hub*, then post a one-line `hub` update.
2. `claim` one issue in your workstream, `p0` first.
3. `status` every milestone; `block` when waiting; `question --human`
   when a person must decide.
4. Interfaces between slices go on a `type:contract` issue and are
   built only after `accept`.
5. `review` when the PR opens, `done` when it merges; the PR body says
   `Closes #N`.

The rules exist because parallel agents fail in predictable ways:
duplicated work, guessed interfaces, and silent claims. Each command
closes one of those gaps.
