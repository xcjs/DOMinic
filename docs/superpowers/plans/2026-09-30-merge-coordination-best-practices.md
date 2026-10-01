# Merge coordination best practices into the coordinate skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `.claude/skills/coordinate/SKILL.md` the single source of coordination guidance by merging the surviving rules from the three playbook versions inline, deleting the four superseded docs, and repointing every live link.

**Architecture:** TDD applied to documentation (writing-skills): RED = baseline retrieval test against the unmerged skill in a temp workspace; GREEN = merge content inline and re-run the same scenarios; verification = repo-wide dangling-link check plus `npm run lint:md`. All content lives inline in SKILL.md (layout A per spec).

**Tech Stack:** Markdown documentation edits; PowerShell 5.1 shell; `task` tool with `subagent_type: "general"` for retrieval tests; `robocopy` for the temp workspace.

**Spec:** `docs/superpowers/specs/2026-09-30-merge-coordination-best-practices-design.md`

## Global Constraints

- Branch: `docs/merge-coordination-best-practices` (already checked out).
- Repo lint runs `markdownlint-cli2` on `**/*.md` excluding `node_modules`, `.superpowers`, `docs/superpowers` — every committed `.md` outside those dirs must pass (hook enforces on commit).
- Do not modify `coord.sh` / `coord.ps1` or any script.
- Dated historical docs (`docs/research/**`, `docs/superpowers/plans/**`) are NEVER touched — their references to deleted files are expected and allowed.
- All new SKILL.md content is the exact markdown given in Task 2; no rewording, no added citations or history narrative.
- OpenCode tool mapping: run shell steps with `bash` (PowerShell syntax); dispatch subagents with `task`, `subagent_type: "general"`.

---

### Task 1: RED — baseline retrieval test before the merge

**Files:**
- Create (temp, outside repo): `C:\Users\Zack\AppData\Local\Temp\opencode\coord-red` (workspace copy)
- Create (record of results): `C:\Users\Zack\AppData\Local\Temp\opencode\coord-red-findings.md` (write by agent, verbatim answers)

**Interfaces:**
- Consumes: unmerged `.claude/skills/coordinate/SKILL.md` + `references/protocol.md` in the temp copy.
- Produces: documented baseline answers per question (verbatim) — the failure record Task 4's GREEN run is compared against.

- [ ] **Step 1: Copy the repo to the temp workspace**

```powershell
robocopy . C:\Users\Zack\AppData\Local\Temp\opencode\coord-red /E /XD .git node_modules .superpowers; if ($LASTEXITCODE -lt 8) { "copy ok" } else { throw "robocopy failed: $LASTEXITCODE" }
```
Expected: `copy ok` (robocopy exit codes 0–7 are success).

- [ ] **Step 2: Strip the four playbook docs in the copy only**

```powershell
Remove-Item -LiteralPath C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\docs\agents\coordination-best-practices.md, C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\docs\agents\coordination-best-practices-2.md, C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\docs\agents\coordination-best-practices-3.md, C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\docs\agents\coordination.md
```

- [ ] **Step 3: Confirm the copy is in RED state**

The temp copy's SKILL.md must still contain the line `Read the active` / `[v3 playbook](...)` (i.e., it is the UNMERGED version) and the four delete paths must not exist:

```powershell
Select-String -LiteralPath C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\.claude\skills\coordinate\SKILL.md -Pattern "v3 playbook"; Test-Path C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\docs\agents\coordination-best-practices-3.md
```
Expected: the Select-String prints its match; `Test-Path` prints `False`.

- [ ] **Step 4: Dispatch the baseline subagent (fresh context, no guidance beyond the prompt)**

Use `task` tool, `subagent_type: "general"`. Prompt (verbatim):

```
You are an agent about to start work in a repository located at
C:\Users\Zack\AppData\Local\Temp\opencode\coord-red

You may read ONLY these two files (do not read any other file, do not run gh):
- C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\.claude\skills\coordinate\SKILL.md
- C:\Users\Zack\AppData\Local\Temp\opencode\coord-red\.claude\skills\coordinate\references\protocol.md

Answer these five questions using only what those two files say. For each answer,
cite which section/file it came from. If a file does not answer the question,
write exactly "NOT COVERED" for that answer. Do not guess from general knowledge.

1. SPRINT STALE LADDER: You have been silent on your claimed issue for 25
   minutes (no issue comments, commits, or PR pushes) during a sprint. Another
   agent wants your claim. What must they do before releasing it, and at what
   point may they release without you?

2. MULTI-DAY STALE LADDER: Same situation, but this is asynchronous multi-day
   work and it is now 22:00 (end of the workday). What does the protocol say
   about warning, grace, and overnight?

3. OPEN PR FIX: Review left a one-line fix on your open, unmerged PR. What
   does the protocol tell you to do — push a commit to the PR, or something
   else? State the rule.

4. NEEDS-HUMAN TIMEOUT: You posted question --human. Ten minutes have passed
   and no human answered. What does the protocol say you do now?

5. KERNEL FILE: You need to edit app/shared/stores.ts and no issue claims it.
   What does the protocol require before you write code there?

Return the five answers verbatim with their citations.
```
Expected (RED): answers 2, 3, 4, 5 are NOT COVERED or wrong (5 partially covered: `--files` scope exists, but the one-writer/kernel rule and stub-first guidance are absent; answer 1 is covered by the existing sprint bullet). Save the returned answers to `C:\Users\Zack\AppData\Local\Temp\opencode\coord-red-findings.md`.

- [ ] **Step 5: Record baseline gaps in the findings file**

Append to `coord-red-findings.md` a list of every question the baseline failed or answered only partially. These are the failures the GREEN content must fix.

Step 2 note: if `Remove-Item` errors on a missing path, re-check Step 1 output.

---

### Task 2: GREEN — merge playbook rules inline into SKILL.md

**Files:**
- Modify: `.claude/skills/coordinate/SKILL.md` (all edits below)

**Interfaces:**
- Consumes: merged rule set approved in the spec (parameters, written-vs-spoken test, escalation ladder, integration cadence, failure signals).
- Produces: SKILL.md sections `## Parameters — sprint and full modes`, `## Written down versus said aloud`, `## Escalation and board hygiene`, `## Integration cadence`, `## Failure signals on the board`; removal of both v3-playbook links.

- [ ] **Step 1: Replace the "read the v3 playbook" paragraph with the inline-source statement**

Use edit on `C:\Users\Zack\Projects\xcjs\DOMinic\.claude\skills\coordinate\SKILL.md`:

oldString:
```
Read the active
[v3 playbook](../../../docs/agents/coordination-best-practices-3.md) before
starting work. It supersedes the sprint-era v1 and v2 playbooks.
```
newString:
```
The parameters, working agreements, integration cadence, and failure
signals in this file are the operating guidance;
[references/protocol.md](references/protocol.md) carries the wire format
and the MUST-level invariants behind the commands.
```

- [ ] **Step 2: Insert the Parameters section before Negotiating**

oldString (anchor):
```
## Negotiating: interfaces, splits, disputes
```
newString:
```
## Parameters — sprint and full modes

| Parameter | Sprint | Full / async (multi-day) | Why |
| --- | --- | --- | --- |
| Stale ladder | Ping at 20 minutes without issue, branch, or linked-PR activity; release 10 minutes after the unanswered ping (`COORD_STALE_MIN=30`) | Six-hour warning, three-hour grace during active workdays; pause stale release overnight | Releasing without a recorded ping destroys trust in the board; minute-scale values do not survive sleep |
| Claims | Exactly one `status:in-progress`, at most one `status:blocked`; queued responsibility stays `status:claimed` | Same | Assignments may also represent queued ownership, so WIP is read from status, not assignment count |
| Negotiation | One `COUNTER`, then `needs-human` | Same | Loops burn clock; escalation resolves faster than re-arguing |
| Contracts | `PROPOSE` must produce the exact provisional contract under `## Agreed` in the same operation; silence never accepts; the seam owner acknowledges before shared adapter code merges | Explicit `ACCEPT` before a shared contract or adapter merges | Silent auto-accept produced no shared understanding; a written record is faster and safer |
| Heartbeat | On state change; a STATUS inside 20 minutes when working outside GitHub | Event-driven STATUS with a 60-minute active-work ceiling | GitHub secondary limits (80 content-creates/min) bite before the hourly cap |
| Dependency updates | Fold into a STATUS; the board derives dependency state | Batch into a dashboard; never one comment per dependent issue | Per-issue dependency comments spam the board |

## Negotiating: interfaces, splits, disputes
```

- [ ] **Step 3: Insert the written-down and escalation sections before Finishing**

oldString (anchor):
```
## Finishing
```
newString:
```
## Written down versus said aloud

The test: *would an agent that was not in the room produce wrong code
without this?* If yes, write it on the issue before the conversation
ends. Must be written: seam interfaces, `## Done when` criteria, files
ownership and changes to it, blockers and what unblocks them, any
decision an absent agent must honour. Can stay spoken: nudges, merge
timing, coffee. Humans talk freely — the ledger exists so absent agents
stay correct.

## Escalation and board hygiene

- `needs-human` unanswered for 10 minutes: post the reversible
  assumption you are proceeding on and continue. Escalation re-escalates;
  it does not block forever. Say the one-liner aloud too when the humans
  are two feet away.
- Read the board at most once per minute, event-driven — never poll in a
  loop — and honour `retry-after` on rate-limit errors.

## Finishing
```

- [ ] **Step 4: Insert the integration-cadence section before Automation status**

oldString (anchor):
```
## Automation status
```
newString:
```
## Integration cadence

- Branch per issue; small PRs into `main`; **verify by booting `main`**,
  not by reading the board. "Looks coordinated" is not a state.
- Never push a follow-up commit to an open PR — the owner merges within
  minutes and the commit strands. Open a new PR instead.
- Kernel files (`app/shared/**`, the stores) have one writer. Everyone
  else proposes on the contract issue; stub the interface early so
  dependents build against the stub.
- Single-purpose PRs: one purpose and one declared file union — line
  counts are a poor boundary. If one PR closes several issues, its body
  must list each issue and the union of their scopes; never let a
  convenience PR become an integration bucket.
- Request an independent review as soon as the PR opens. In a deadline
  sprint, rotate a review captain every 15 minutes. Any eligible
  non-author merges after required checks and approvals; do not queue
  every merge behind the repository owner. If policy requires two
  approvals, request both immediately.
- Freeze new features early enough to leave one full review-and-rebase
  cycle. Independent review caught real breakages; never remove it.

## Automation status
```

- [ ] **Step 5: Drop the v3 link under Automation status**

oldString:
```
The manual rows are protocol requirements and candidates for helper
enforcement. See the
[v3 enforcement rationale](../../../docs/agents/coordination-best-practices-3.md#enforcement-status).
```
newString:
```
The manual rows are protocol requirements and candidates for helper
enforcement.
```

- [ ] **Step 6: Insert the failure-signals section before Labels**

oldString (anchor):
```
## Labels
```
newString:
```
## Failure signals on the board

| Signal | Failure | Response |
| --- | --- | --- |
| Comments rising while merged PRs stay flat | Protocol theater | Stop coordinating; ship |
| A PR touches a kernel file with no linked contract | Guessed interface | PROPOSE the seam; the PR waits for the provisional `## Agreed` |
| `status:claimed` with no commits or comments for 20 minutes | Ghost lock | QUESTION at 20; `release --stale` at 30 |
| One login on two active claims | Over-claiming | Release one |
| DONE with unchecked `## Done when` boxes | Premature done | Reopen; merge first |
| "As we discussed" with no issue link | Board talk substituting for the ledger | Write the decision on the issue |
| 429s in an agent's log | Rate-limit storm | One board read per minute; honour `retry-after` |

## Labels
```

- [ ] **Step 7: Verify all six edits landed and no v3 pointers remain in the skill**

```powershell
Select-String -LiteralPath .claude\skills\coordinate\SKILL.md -Pattern "coordination-best-practices|## Parameters|## Written down versus said aloud|## Escalation and board hygiene|## Integration cadence|## Failure signals on the board"
```
Expected: the five new headings print; `coordination-best-practices` prints no match.

- [ ] **Step 8: Commit**

```powershell
git add .claude/skills/coordinate/SKILL.md; if ($?) { git commit -m "docs(coord): merge playbook rules into the coordinate skill" }
```
Expected: pre-commit `lint:md` hook passes (0 errors), commit created.

---

### Task 3: Delete the playbooks and repoint links

**Files:**
- Delete: `docs/agents/coordination-best-practices.md`, `docs/agents/coordination-best-practices-2.md`, `docs/agents/coordination-best-practices-3.md`, `docs/agents/coordination.md`
- Modify: `README.md` (rows 47–50), `docs/JUDGES.md` (lines 142–143), `.claude/skills/coordinate/references/protocol.md` (lines 7–9)

**Interfaces:**
- Consumes: SKILL.md as the new single source (Task 2).
- Produces: zero live references to the deleted paths outside `docs/research/` and `docs/superpowers/`.

- [ ] **Step 1: Delete the four docs**

```powershell
git rm docs/agents/coordination-best-practices.md docs/agents/coordination-best-practices-2.md docs/agents/coordination-best-practices-3.md docs/agents/coordination.md
```

- [ ] **Step 2: Repoint the README rows**

Use edit on `C:\Users\Zack\Projects\xcjs\DOMinic\README.md`:

oldString:
```
| [docs/agents/coordination.md](docs/agents/coordination.md) | Multi-agent task coordination over GitHub Issues (`/coordinate`) |
| [docs/agents/coordination-best-practices.md](docs/agents/coordination-best-practices.md) | Coordination playbook v1 (superseded; kept for the record) |
| [docs/agents/coordination-best-practices-2.md](docs/agents/coordination-best-practices-2.md) | Coordination playbook v2 (superseded; kept for the record) |
| [docs/agents/coordination-best-practices-3.md](docs/agents/coordination-best-practices-3.md) | Active coordination playbook — sprint evidence and enforceable invariants |
```
newString:
```
| [.claude/skills/coordinate/SKILL.md](.claude/skills/coordinate/SKILL.md) | Multi-agent task coordination over GitHub Issues (`/coordinate`): protocol, parameters, working agreements |
```

- [ ] **Step 3: Repoint the JUDGES.md sentence**

Use edit on `C:\Users\Zack\Projects\xcjs\DOMinic\docs\JUDGES.md`:

oldString:
```
Issues with a small protocol (`docs/agents/coordination.md`,
`docs/agents/coordination-best-practices-2.md`).
```
newString:
```
Issues with a small protocol (`.claude/skills/coordinate/SKILL.md`).
```

- [ ] **Step 4: Repoint protocol.md's operating-guidance line**

Use edit on `C:\Users\Zack\Projects\xcjs\DOMinic\.claude\skills\coordinate\references\protocol.md`:

oldString:
```
The active operating guidance is
[coordination best practices v3](../../../../docs/agents/coordination-best-practices-3.md).
V1 and v2 of the playbook are historical records.
```
newString:
```
The active operating guidance is the [coordinate skill](../SKILL.md),
which carries the parameters, working agreements, integration cadence,
and failure signals.
```

- [ ] **Step 5: Verify no live dangles remain**

```powershell
Get-ChildItem -Recurse -File -Filter *.md | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.superpowers\\|\\docs\\superpowers\\|\\docs\\research\\' } | Select-String -Pattern 'coordination-best-practices|docs/agents/coordination\.md' | Select-Object Path, LineNumber, Line
```
Expected: no output. Any hit outside the excluded dirs must be fixed before commit.

- [ ] **Step 6: Commit**

```powershell
git add README.md docs/JUDGES.md .claude/skills/coordinate/references/protocol.md; if ($?) { git commit -m "docs: remove superseded coordination playbooks and repoint links" }
```
Expected: lint hook passes; commit includes the four `git rm` deletions plus the three repointed files.

---

### Task 4: GREEN verification — retrieval re-test and link check

**Files:**
- Modify (only if gaps found): `.claude/skills/coordinate/SKILL.md`
- Create (record): `C:\Users\Zack\AppData\Local\Temp\opencode\coord-green-findings.md`

**Interfaces:**
- Consumes: merged SKILL.md (Task 2) in the real repo; baseline gaps recorded in `coord-red-findings.md` (Task 1).
- Produces: verified answers for all five scenarios, sourced from the skill; final lint state.

- [ ] **Step 1: Dispatch the same scenarios against the merged skill**

Use `task` tool, `subagent_type: "general"`. Prompt (verbatim — identical questions, real repo paths):

```
You are an agent about to start work in a repository located at
C:\Users\Zack\Projects\xcjs\DOMinic

You may read ONLY these two files (do not read any other file, do not run gh):
- C:\Users\Zack\Projects\xcjs\DOMinic\.claude\skills\coordinate\SKILL.md
- C:\Users\Zack\Projects\xcjs\DOMinic\.claude\skills\coordinate\references\protocol.md

Answer these five questions using only what those two files say. For each answer,
cite which section/file it came from. If a file does not answer the question,
write exactly "NOT COVERED" for that answer. Do not guess from general knowledge.

1. SPRINT STALE LADDER: You have been silent on your claimed issue for 25
   minutes (no issue comments, commits, or PR pushes) during a sprint. Another
   agent wants your claim. What must they do before releasing it, and at what
   point may they release without you?

2. MULTI-DAY STALE LADDER: Same situation, but this is asynchronous multi-day
   work and it is now 22:00 (end of the workday). What does the protocol say
   about warning, grace, and overnight?

3. OPEN PR FIX: Review left a one-line fix on your open, unmerged PR. What
   does the protocol tell you to do — push a commit to the PR, or something
   else? State the rule.

4. NEEDS-HUMAN TIMEOUT: You posted question --human. Ten minutes have passed
   and no human answered. What does the protocol say you do now?

5. KERNEL FILE: You need to edit app/shared/stores.ts and no issue claims it.
   What does the protocol require before you write code there?

Return the five answers verbatim with their citations.
```
Expected (GREEN): every answer a RED baseline marked NOT COVERED (or wrong) is now correct — question 2 answered as six-hour warning / three-hour grace / pause overnight (Parameters table); question 3 answered as open a new PR, never push to an open PR (Integration cadence); question 4 answered as post the reversible assumption and continue (Escalation); question 5 answered as kernel one-writer rule with early stubs (Integration cadence); question 1 unchanged-correct. Save answers to `coord-green-findings.md` and compare each against the baseline findings.

- [ ] **Step 2: Close any remaining gap**

If any still-missed answer traces to missing/unclear merged wording, edit SKILL.md to close it (smallest change possible), then re-dispatch the failing question only. Repeat until all five pass.

- [ ] **Step 3: Run the repo lint**

```powershell
npm run lint:md
```
Expected: `0 error(s)`.

- [ ] **Step 4: Final dangling-link check (committed state)**

```powershell
git grep -n "coordination-best-practices" -- . ":(exclude)docs/research" ":(exclude)docs/superpowers"; git grep -n "docs/agents/coordination.md" -- . ":(exclude)docs/research" ":(exclude)docs/superpowers"
```
Expected: no output for either.

- [ ] **Step 5: Commit any fixes (only if Step 2 made edits)**

```powershell
git add .claude/skills/coordinate/SKILL.md; if ($?) { git commit -m "docs(coord): close retrieval gaps found in verification" }
```
Expected: if no edits were made, skip; lint and link checks already clean.