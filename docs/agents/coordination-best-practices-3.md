---
type: playbook
title: Coordination Best Practices v3 — Evidence from One Sprint
description: An evidence-calibrated GitHub Issues protocol based on the DOMinic hackathon record from 13:00 to 16:00 ET on 2026-09-12.
tags: [agents, coordination, process, retrospective, evidence]
status: active
supersedes: coordination-best-practices-2.md
generated: { by: codex/gpt-5, at: 2026-09-12T20:00:31Z }
verified: { by: human:michael, at: 2026-09-12T20:13:30Z }
sources:
  - id: v2
    resource: https://github.com/xcjs/DOMinic/blob/main/docs/agents/coordination-best-practices-2.md
    title: Coordination best practices v2
  - id: protocol
    resource: https://github.com/xcjs/DOMinic/blob/main/.claude/skills/coordinate/references/protocol.md
    title: Coordination protocol v1
  - id: q01-agent
    resource: Q01 agent report held in the separate DOMinic research workspace
    title: Q01 agent-first coordination research report
  - id: q01-answer-1
    resource: Q01 external answer 1 held in Michael's main thread and reconciled in v2
    title: Q01 external answer 1
  - id: q01-answer-2
    resource: Q01 external answer 2 held in Michael's main thread and reconciled in v2
    title: Q01 external answer 2
  - id: retrospective
    resource: https://github.com/xcjs/DOMinic/issues/19#issuecomment-5648371337
    title: V3 retrospective summary and derived findings
  - id: feedback
    resource: https://github.com/xcjs/DOMinic/issues/19
    title: Coordination playbook feedback thread
---

# Coordination best practices v3 — evidence from one sprint

## Verdict

**Judgment:** Keep GitHub Issues as the shared ledger, but make the ledger
describe reality instead of asking agents to perform ceremony. Assignment,
declared files, structured comments, and independent review paid for
themselves. Silent auto-accept, unchecked completion criteria, unrestricted
hub updates, and assignment-as-WIP did not. For the next sprint, enforce file
and completion invariants in the script, distinguish responsibility from
active work, and make every claim name its branch or say that no code exists.

This is one sprint, not a controlled experiment. Protocol v1 merged at 14:11
ET and v2 at 14:42, so v2 governed only the final 77 minutes. Treat the
numbers below as calibration evidence, not universal constants.

## Enforcement status

V3 makes three invariants normative. Passing a helper command does not yet
prove all three: canonical hub selection is automated, while scope and
completion require a manual preflight until the helpers implement the same
gates.

| Invariant | Protocol requirement | Current helper status |
| --- | --- | --- |
| Canonical hub | Keep one `hub`; Bash uses `COORD_HUB` or the lowest-numbered open hub | Bash automated since PR #57; PowerShell assumes a unique label |
| File scope | Claim a non-empty scope; resolve active overlap; PR paths must be within the union of linked issue scopes | Required; manual at claim and review |
| Completion | Every `Done when` box is checked and the linked PR is merged | Required; manual before `done` |

The wire protocol records these as MUST-level checks. The helpers' current
limitations are tracked as automation work, not exceptions to the rules.

## What the record shows

All statements in this section are **observed** unless marked otherwise.

1. The team merged 25 PRs in the three-hour window. Median open-to-merge
   time was 6.9 minutes; the median PR changed 219 lines across three files.
   Only 8 of 25 changed 100 lines or fewer.
2. The board received 190 protocol comments. After v2 merged, 44 of 113
   protocol comments were `SYNC`; v2's narrow hub cadence was not adopted.
   Peak traffic was eight protocol comments in one minute, with no reported
   HTTP 429 or rate-limit failure.
3. Every claimed issue, 23 of 23, declared a non-empty `## Files` scope.
   Nevertheless, #40 crossed four issue scopes and overlapped #39, #42, and
   #45. Declaring files worked as discovery, but nothing enforced them.
4. Duplicate persistence PR #31 opened before its author's first board event.
   It was detected after 3.2 minutes and closed 2.5 minutes later. **Reported
   on #19:** late claims allowed parallel work to begin without visible
   ownership; claims should carry a branch/PR link or `no code yet`.
5. All 14 `DONE` comments linked a PR that was already merged. Zero of the 14
   had their `Done when` boxes checked, and six closed issues had no `DONE`.
   Merge truth was strong; acceptance-criteria truth was absent.
6. Six hub messages explicitly reported a second-review wait across seven
   PRs. For nine PRs with two distinct approvals, the median wait between
   approvals was 5.1 minutes. Independent reviews also found real bugs in
   #35 and #40, so removing review is the wrong fix.
7. API author identity was reliable: zero `human:`/login mismatches across
   190 protocol comments. Self-declared time was not: nine invalid `at:`
   values and four values skewed by more than one minute. The same
   `claude-code/claude-fable-5.1` agent ID appeared under two human logins.
8. One real `needs-human` episode lasted 7.7 minutes, below v2's 10-minute
   acknowledgment target. No claim was released by the 20/30 ladder, so the
   release threshold itself remains untested.

The public evidence summary and reproducibility notes are attached to
[issue #19](https://github.com/xcjs/DOMinic/issues/19#issuecomment-5648371337).

## Rules for the next sprint

### 1. Assignment owns responsibility; state marks active work — change

Keep assignment as the universally visible owner. Stop treating the number
of assignments as active WIP: peak open assignments per login ranged from one
to five because the board also assigned queued responsibilities.

- Put exactly one owned issue in `status:in-progress` per login.
- Allow one additional `status:blocked` issue. Leave queued responsibility in
  `status:claimed`; do not collapse `claimed` and `in-progress`.
- In every `CLAIM`, include `branch: <name>`, `pr: <URL>`, or `no-code-yet`.
- Treat the Git branch and merge conflict as the fence. A release transfers
  attention; it cannot make another branch disappear.

This keeps v2's WIP intent while making it measurable. The first board event
for @ImNewToC0de arrived 1.5 minutes after duplicate PR #31 had opened.

### 2. Declare files, then verify the diff — keep and enforce

Keep `## Files`; it had complete adoption and helped detect overlap. Add two
checks:

1. Refuse a claim whose scope overlaps an open in-progress claim until the
   issue records a split or common owner.
2. At `review`, compare the PR's changed paths with the union of `## Files`
   on every linked issue. Refuse or warn on undeclared paths.

Do not let a convenience PR become an integration bucket. If one PR closes
several issues, its body must list each issue and the union of their scopes.

### 3. Record seams before shared code; do not accept by silence — change

The only contract issue, #14, received one `PROPOSE`, zero real accepts, and
no recorded `Agreed` contract before it closed. Its proposed registry path
also differed from the merged implementation, while duplicate #31 followed
the earlier shape. Silent auto-accept did not create shared understanding.

- Name one seam owner in the contract issue.
- Make `PROPOSE` atomically write the exact provisional contract under
  `## Agreed`; never rely on a later edit.
- Let agents proceed inside their own slices, but require the seam owner to
  acknowledge the shared adapter before it merges.
- If implementation changes the contract, update `Agreed` in the same PR.
- Permit one `COUNTER`, then escalate. Do not add negotiation rounds.

Drop the 15-minute silence-implies-accept timer. A binding provisional record
is faster and safer than assuming another agent polled the board.

### 4. Ping, then release — keep with instrumentation

Keep the sprint ladder: ping after 20 minutes with no visible activity, then
allow release after 10 more minutes without an answer. Count issue comments,
linked-PR pushes, and branch updates as activity. For work outside GitHub,
such as video production, the owner must post a brief `STATUS` inside the
20-minute ceiling.

Never release without a recorded ping. The single real human escalation was
answered in 7.7 minutes, but zero stale releases means the 20/30 values have
low empirical confidence. Revisit them after three sprints.

### 5. Ship single-purpose PRs; distribute review and merge — change

Replace “tiny PR” with “one purpose and one declared file union.” Line counts
are a poor boundary when scaffolds and lockfiles are large, but #40 shows the
cost of aggregation: seven files, four issue scopes, four overlap episodes,
three changes-requested reviews, and 24.3 minutes to merge.

- Request an independent review as soon as the PR opens.
- During a deadline sprint, rotate a review captain every 15 minutes.
- Let any eligible non-author merge after required checks and approvals; do
  not queue every merge behind the repository owner.
- If policy requires two approvals, request both immediately and surface the
  second-review queue as one dashboard, not repeated `SYNC` messages.
- Freeze new features early enough to leave one full review-and-rebase cycle.

Do not remove independent review. It caught failures that would have broken
the golden path.

### 6. Route every summary to one canonical hub — keep and enforce

A status dashboard temporarily shared the `hub` label with the original
coordination hub. Deterministic routing prevented split-brain writes, but the
label should identify one issue, not a class of summaries.

- If `COORD_HUB` is set, route to that issue.
- Otherwise, route to the lowest-numbered open issue labelled `hub`.
- Keep exactly one canonical issue labelled `hub`; use a distinct dashboard
  marker for editable status summaries.
- Restrict `SYNC` to session start, cross-stream merge, blocker, freeze, and
  final state.

## Protocol surface

V2's six-verb minimum did not match use. After it merged, agents still used
11 `STATUS`, nine `HANDOFF`, eight `REVIEW`, nine `DEP-DONE`, five `ANSWER`,
and one `UNBLOCKED` comment. Preserve the useful state transitions and remove
duplicates of GitHub-native state.

| Keep | Use |
| --- | --- |
| `CLAIM` | Establish owner, declared scope, and branch/PR/no-code state |
| `STATUS` | Record a milestone or satisfy the activity lease |
| `BLOCKED` | Name the dependency and required action |
| `QUESTION` / `ANSWER` | Drive human escalation and clear `needs-human` |
| `PROPOSE` / `COUNTER` | Record one seam decision round |
| `HANDOFF` | Transfer responsibility with context |
| `DONE` | Close only after merged PR and verified acceptance criteria |
| `RELEASE` | Return responsibility after handoff or stale ladder |
| `SYNC` | Session start, cross-stream merge, blocker, freeze, final state |

Drop `DEP-DONE`; it generated 16 notices against only three `UNBLOCKED`
comments. Let the board derive dependency state. Drop protocol `REVIEW`
comments after the issue stores its PR URL; GitHub already records reviews.
Fold `UNBLOCKED` into `STATUS`. Keep `ACCEPT` only in asynchronous full mode.

Make `DONE` a real gate: refuse it while a `Done when` box is unchecked or
the linked PR is unmerged. Do not auto-check criteria merely because CI is
green; the caller must attest or update each criterion.

## Parameter decisions

| V2 parameter | Decision | Next-sprint setting | Evidence |
| --- | --- | --- | --- |
| 20/30 stale ladder | **Keep** | ping at 20, release at 30 | One response at 7.7 minutes; no releases, so low confidence |
| One active claim | **Change** | one `in-progress` + one `blocked`; assignments may represent queued ownership | Assignment peaks of 1–5 made the old measure ambiguous |
| One-counter negotiation cap | **Keep** | `PROPOSE` → one `COUNTER` → human | No real chain exceeded one counter |
| 15-minute auto-accept | **Drop** | binding written provisional contract + seam-owner acknowledgment before merge | #14 never recorded `Agreed`; implementation drifted |
| 10-minute human acknowledgment | **Keep** | answer or reversible logged decision by 10 minutes | Only real episode resolved in 7.7 minutes; evidence is thin |
| At most one board read/minute | **Keep as a ceiling** | event-driven reads; never poll in a loop | Peak writes were 8/minute and no 429 was reported |
| Event-driven heartbeat | **Keep** | milestones, with 20-minute silence ceiling in sprint mode | `STATUS` reappeared 11 times after v2 because it carried useful state |
| Comment/merge anti-theater ratio | **Change** | use as a review prompt, not a hard quota | 190 comments and 25 merges coexisted; causality is unknown |

## Full protocol after the sprint

For asynchronous or multi-day work, keep the same ownership and completion
invariants, then change only the time horizon:

- Require explicit `ACCEPT` before merging a shared contract or adapter.
- Use a six-hour warning plus three-hour grace during active workdays; pause
  stale release overnight. Do not reuse sprint-minute values across sleep.
- Require `HANDOFF` when ownership crosses a session, including current
  branch, PR, validation state, exact stopping point, and next action.
- Keep event-driven `STATUS` with a 60-minute active-work ceiling.
- Maintain one canonical hub. Enforce exactly one `hub` label; use a separate
  dashboard marker for an editable status summary.
- Batch dependency changes and review queues into the dashboard. Do not emit
  one comment per dependent issue.

## What we still do not know

- This record has no control group, and v2 arrived late. It cannot prove that
  the protocol caused throughput, duplication, or review delay.
- Only one teammate posted the requested #19 qualitative feedback. Most
  conclusions therefore come from behavior, not self-report.
- The GitHub API returned no readable branch-policy configuration to this
  account. Review requirements are reconstructed from reviews and hub text.
- Board-read frequency and agent attention time were not recorded. Comment
  counts measure writes, not ceremony cost or cognitive load.
- No stale release occurred, no negotiation spiral occurred, and no 429
  occurred. Those safeguards remain plausible defaults, not validated limits.
- Cross-harness bodies did produce malformed timestamps, but no login
  mismatch. We do not yet know whether other header fields fail often enough
  to justify a stricter schema.

## Evidence archive

The frozen JSON, timelines, query map, and deterministic derivation remain in
the separate DOMinic research workspace. The durable public summary records
the key metrics and method on
[issue #19](https://github.com/xcjs/DOMinic/issues/19#issuecomment-5648371337).
The repository playbook links that public record rather than a
workstation-only path.
