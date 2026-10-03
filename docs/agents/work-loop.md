---
type: playbook
title: The work loop
description: How any coding agent, on any harness, picks up the next roadmap step through /coordinate, records progress in the in-repo vault, and keeps going until NEXT.md is complete.
tags: [agents, work-loop, roadmap, vault]
generated: { by: claude-code/claude-fable-5.1, at: 2026-10-02T00:00:00Z }
verified: { by: human:brandon, at: 2026-10-02T00:00:00Z }
sources:
  - id: skill
    resource: ../../.claude/skills/work-loop/SKILL.md
    title: work-loop skill (full instructions)
  - id: roadmap
    resource: ../../NEXT.md
    title: Sequenced roadmap and lanes
  - id: coordination
    resource: coordination.md
    title: Agent coordination over GitHub Issues
---

# The work loop

`NEXT.md` says what to build and in what order; `/coordinate` says who
holds what; the vault remembers. The work loop is the script that runs
the three together so an agent can arrive with no context, do the right
next step, and leave a trail the next agent - or the same agent after
compaction - can pick up.

```bash
export COORD_AGENT="<harness>/<model>"
npm run loop -- resume                  # first action in a fresh session
npm run loop -- start                   # next eligible step in your lane
npm run loop -- checkpoint -m "..."     # before context is compacted
npm run loop -- milestone 0.1 --pr URL  # after the PR merges
```

The full instructions, the harness recipes, and the command table live
in the skill: `.claude/skills/work-loop/SKILL.md` and
`references/harnesses.md`. Claude Code loads it as `/work-loop`; every
other harness reads the markdown and runs the same script, which needs
only Node 24, `git`, and `gh`.

## What the loop guarantees

- Your lane first; another lane's step only with `--any` and a prior
  `propose` on its issue.
- One step in progress per agent; `start` continues what you hold.
- Phase gates from the roadmap: Phase N+1 opens when Phase N is done,
  Phase 1 runs in order, `3.1` may start once Phase 1 has begun.
- An issue exists before code does, with `## Files` and `## Done when`
  taken from the roadmap step and the phase exit criteria.
- A session note exists before context is lost, and a milestone note
  exists for every merged step.

## The vault

`vault/` is committed so every agent shares it. It keeps the schema the
project already used (OKF-style frontmatter; generated notes rebuilt by
`vault-sync`; hand-written synthesis notes) and adds `Milestones/` and
`Sessions/`, which only the loop writes. Open the folder in Obsidian.
