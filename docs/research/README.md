---
type: index
title: Research behind the coordination playbooks
description: The Q01 research question and its three answers — two external deep-research runs and one in-session agent report — that produced coordination-best-practices v1 through v3.
tags: [research, coordination, provenance]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T20:45:00Z }
verified: { by: human:michael, at: 2026-09-12T20:45:00Z }
---

# Research behind the coordination playbooks

One question, asked at 14:15 ET on hackathon day, answered three ways
within the hour, and reconciled into the playbooks in `docs/agents/`.
These files are verbatim research artifacts: long lines and external
formatting are kept as delivered (markdownlint is disabled inline), so
read them as sources, not as house-style documents.

| File | What it is |
| --- | --- |
| `2026-09-12-14-15-Q01-question.md` | The research brief, written to the team's question template: context, locked decisions, six sub-questions, required perspectives |
| `2026-09-12-14-16-Q01-answer-1-external.md` | External deep research run by human:michael — the summary as returned (lease don't lock, contracts on seams, tiny PRs into main) |
| `2026-09-12-14-20-Q01-answer-2-external.md` | External deep research run by human:michael — full report (six-verb sprint set, 20-minute lease, file-glob ownership, MAST evidence) |
| `2026-09-12-Q01-answer-agent-report.md` | In-session deep-researcher agent (claude-code/claude-fable-5.1) — declare-then-proceed, two-stage lease, identity by login, a v1.1 diff, `gh --jq` recipes |

How they were used: answer 1 became `coordination-best-practices.md`
(v1); all three were reconciled into `coordination-best-practices-2.md`
(v2); the day's GitHub record scored against v2 became
`coordination-best-practices-3.md` (v3). Each playbook's frontmatter
`sources` names these files.
