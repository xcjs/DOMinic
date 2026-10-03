# Merge coordination best practices into the coordinate skill

Date: 2026-09-30
Status: approved (user confirmed design; branch `docs/merge-coordination-best-practices`)

## Goal

The three playbook versions (`docs/agents/coordination-best-practices.md`,
`-2.md`, `-3.md`) plus the overview doc (`docs/agents/coordination.md`)
duplicate and fragment guidance that the coordinate skill needs at session
start. After this change, the skill (`.claude/skills/coordinate/SKILL.md`)
is the single source of coordination guidance; the four docs are deleted;
all inbound links are repointed.

## Scope decisions (user-approved)

- **End state:** merge and delete — surviving rules live in the skill;
  playbook files are removed.
- **Merge scope:** current + gaps — carry v3's active rules and the
  surviving v1/v2 ideas not already in the skill. No sprint history,
  evidence narrative, or citations move over.
- **Layout:** A — all inline in SKILL.md. No new reference file.
- **Cleanup reach:** delete `coordination.md` too; fix links in
  `README.md`, `JUDGES.md`, and `references/protocol.md`. Dated historical
  docs (`docs/research/`, `docs/superpowers/plans/`) stay untouched.

## SKILL.md changes

Replace the "read the v3 playbook" paragraph (SKILL.md lines ~28–30) with
the merged content itself, inline. Add these sections, trimmed:

1. **Sprint vs full parameter table** (merged from all three versions):
   - Stale ladder: ping at 20 min, release at 30 min (sprint; `COORD_STALE_MIN=30`); default stale 45 min.
   - Claims: exactly one `status:in-progress`; at most one `status:blocked`; queued stays `status:claimed`.
   - Negotiation: `PROPOSE` → one `COUNTER` → `needs-human`.
   - Contracts: sprint = binding written provisional contract under `## Agreed`, never accept by silence; async/full = explicit `ACCEPT` before merge.
   - Full/async time horizon: six-hour warning + three-hour grace during active workdays; pause stale release overnight; `HANDOFF` when ownership crosses a session (branch, PR, validation state, stopping point, next action); 60-min status ceiling; batch dependency/review-queue updates, no per-issue comment spam.
2. **Written down versus said aloud:** the test — *would an agent that was
   not in the room produce wrong code without this?* Must be written: seam
   interfaces, `## Done when`, files ownership and changes, blockers and
   what unblocks, any decision an absent agent must honour. Can stay
   spoken: nudges, merge timing, coffee.
3. **Integration cadence:**
   - One writer per kernel file (`app/shared/**`, the stores); everyone else proposes on the contract issue; stub interfaces early.
   - Single-purpose PRs: one purpose and one declared file union — not line counts. Never let one PR become an integration bucket; if it closes several issues, its body lists each and the union of scopes.
   - Verify by booting `main`, not by reading the board.
   - Never push a follow-up commit to an open PR; open a new PR instead.
   - Request independent review as soon as the PR opens; review captain rotates every 15 minutes in deadline sprints; any eligible non-author merges; do not queue merges behind the repo owner; if policy requires two approvals, request both immediately.
   - Freeze new features early enough to leave one full review-and-rebase cycle.
4. **Escalation and board hygiene:**
   - `needs-human` unanswered 10 minutes → post the reversible assumption being proceeded on, and continue.
   - ≤ 1 board read per minute, event-driven, never poll in a loop; honor `retry-after`.
5. **Failure signals table** (compact):
   protocol theater (comments rise, merges flat → stop coordinating, ship);
   PR touching kernel files with no linked contract → PROPOSE the seam;
   ghost lock (claimed, silent 20 min → ping at 20, release at 30);
   one login two active claims → release one;
   DONE with unchecked criteria → reopen, merge first;
   "as we discussed" with no issue link → write it on the issue;
   429s → slow reads, honor retry-after.
6. Existing "Automation status" table stays; the v3-link sentence and the
   link at line 192 are removed (content now inline).

Frontmatter: unchanged (description already covers triggering conditions).

## Files deleted

- `docs/agents/coordination-best-practices.md`
- `docs/agents/coordination-best-practices-2.md`
- `docs/agents/coordination-best-practices-3.md`
- `docs/agents/coordination.md`

## Link fixes

- `README.md` table rows referencing `docs/agents/coordination*.md` → point
  to `.claude/skills/coordinate/SKILL.md`.
- `docs/JUDGES.md` (~lines 142–143) → point to skill paths instead of the
  deleted docs.
- `.claude/skills/coordinate/references/protocol.md` line 8 "active
  operating guidance" → point to the sibling `../SKILL.md`.
- No other inbound links (grep verified: remaining matches are in dated
  historical files, which stay as-is).

## Verification

1. **Retrieval test (writing-skills TDD for reference skills):**
   - RED: dispatch a fresh-context subagent in a temp workspace copy where
     the four playbook docs are deleted but SKILL.md is unmerged; ask it to
     answer five gap-targeted questions (sprint stale ladder, multi-day
     stale ladder, open-PR fix rule, `needs-human` timeout, kernel-file
     one-writer rule). Scenarios target known gaps of the current skill,
     since completion-gate and contract-acceptance rules are already
     covered there. Record gaps.
   - GREEN: same scenarios against the merged SKILL.md; answers must be
     correct and sourced from the skill.
2. **Link check:** grep the repo for the deleted paths; every remaining
   reference must be inside `docs/research/` / `docs/superpowers/plans/`
   (historical, untouched) or re-pointed. No dangling doc links in live
   docs (README, JUDGES, skill files).

## Non-goals

- No changes to `coord.sh` / `coord.ps1` behavior.
- No new helper enforcement; manual invariants remain documented as manual.
- No restructuring of the verb table or label table in the skill.