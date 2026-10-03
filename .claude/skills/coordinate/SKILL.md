---
name: coordinate
description: Multi-agent task coordination for the DOMinic repo over GitHub Issues via the gh CLI. Use this whenever you are about to start work in this repository, pick up or hand off a task, split work with a teammate's agent, propose or negotiate an interface between slices or workstreams, report progress, get blocked, or wonder what to work on next - even when the user only says "grab the next thing", "sync up", "what is everyone doing", "post an update", or "file that as a task". Also use it to bootstrap the labels and the pinned coordination hub issue.
argument-hint: "[sync|board|hub|new|claim|release|status|block|unblock|question|answer|propose|accept|counter|reject|handoff|review|done|stale|show|setup] ..."
allowed-tools: Bash(gh:*), Bash(bash:*), Bash(sh:*), Bash(git:*), Read
---

# Coordinate: multi-agent work over GitHub Issues

Five engineers and their coding agents (Claude Code, Pi, others) are
editing one repository in the same afternoon. GitHub Issues is the one
shared memory every agent already has: `gh` is installed, authenticated
as its human, and works from any shell. This skill turns Issues into a
task board and a negotiation channel with four primitives:

- **Assignment owns responsibility.** An issue with an assignee has one
  accountable owner. `status:in-progress` identifies active work; the Git
  branch and merge conflict remain the code fence.
- **Labels are the state machine.** `status:*`, `ws:*`, `p0`-`p2`,
  `type:*`, `needs-human`.
- **Structured comments are the conversation.** Every protocol comment
  starts with a bold verb (`**CLAIM**`, `**PROPOSE**`, ...) plus who and
  when, so any agent can parse the history with `gh --jq`.
- **Declared invariants are gates.** File scope, contract state, and
  completion criteria remain mandatory when the current helper cannot yet
  enforce them automatically.

The parameters, working agreements, integration cadence, and failure
signals in this file are the operating guidance;
[references/protocol.md](references/protocol.md) carries the wire format
and the MUST-level invariants behind the commands.

All commands go through one script so every agent applies the same
rules (label transitions, race checks, stale detection). Run it from
anywhere inside the repo:

```bash
COORD="bash .claude/skills/coordinate/scripts/coord.sh"
```

On Windows hosts (PowerShell 5.1+), use the PowerShell counterpart —
it finds `gh.exe` in the standard install dir even when it is not on
`PATH`:

```powershell
$COORD = "powershell -File .claude/skills/coordinate/scripts/coord.ps1"
```

Both scripts share one CLI surface; everything below works with
either. Set the agent identity the same way:

```powershell
$env:COORD_AGENT = "claude-code/claude-fable-5.1"   # or pi/..., cursor/...
```

## Identity

You act as your human's GitHub account (`gh auth status`). Say which
agent you are so teammates can tell agents apart; set this once per
session before any command:

```bash
export COORD_AGENT="claude-code/claude-fable-5.1"   # or pi/..., cursor/...
```

## Start of every session

```bash
$COORD sync
```

`sync` prints the board, your open claims, stale claims, anything marked
`needs-human`, and the last few **SYNC** lines from the canonical
*Coordination hub* issue. Bash uses `COORD_HUB` when set and otherwise
selects the lowest-numbered open issue labelled `hub`. PowerShell currently
assumes exactly one open `hub` label. Read it, then post a one-liner:

```bash
$COORD hub "starting #12 (window drag); nothing blocking"
```

Do this before opening files. After session start, reserve `SYNC` for a
cross-stream merge, blocker, freeze, or final state.

## Picking up work

1. Choose an unclaimed issue in your workstream (`ws:*`), highest
   priority first. `p0` is the critical path of the current roadmap
   phase: if a `p0` is unclaimed and you can do it, take it first.
2. Claim it with a plan and the current code state. Every claim names a
   branch, PR URL, or `no-code-yet`:

   ```bash
   $COORD claim 12 --plan "branch: feat/window-drag; useDraggable + z-index" --eta 30m
   ```

   If someone else holds it the script refuses; use `propose` to split
   it or `question` to ask. If two agents claim within the same seconds
   the earliest **CLAIM** comment wins and the loser is unassigned
   automatically.
3. Keep exactly one owned issue in `status:in-progress` and at most one in
   `status:blocked`. Other assignments may represent queued responsibility
   and remain `status:claimed`.

No matching issue? Create one; that is how work becomes visible:

```bash
$COORD new "Window drag + z-index" --ws os-shell --p 0 \
  --files "app/features/os/**" \
  --done "title bar drags;click focuses and raises;no negative offsets" \
  --depends "#3"
$COORD claim 12 --plan "no-code-yet; branch will be feat/window-drag" --eta 30m
```

`--files` is mandatory. `board` shows the declared scope so an agent about
to edit `app/shared/contracts.ts` can find overlaps. The current helpers
display scope but do not reject overlap; resolve overlap with a recorded
split or common owner before moving either issue to `in-progress`.

## While working

- Post a **STATUS** at milestones, and during active work never go
  longer than 60 minutes without one:
  `$COORD status 12 "drag works; z-index next"`. The full protocol is
  active (ADR 0012): a claim with no issue, branch, or linked-PR activity
  for six hours of a working day gets a `QUESTION`; release only after
  three more hours unanswered, never overnight. `COORD_STALE_MIN`
  defaults to 360. The helper's stale check sees structured issue
  heartbeats, so the caller must inspect Git activity and verify the
  recorded ping.
- Blocked? Say on what and by whom, then move to something else:
  `$COORD block 12 --by "#7" "need the VFS writeFile signature"`.
  When #7 closes, `done` posts a heads-up on every open issue that
  mentions it.
- Need a human decision (model choice, scope cut, anything from
  `QUESTIONS.md`)? `$COORD question 12 --human "..."` adds
  `needs-human`; humans skim that label.

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

Cross-lane seams are where parallel work collides: the `install_app`
handler (chat lane) needs the VFS API (persistence lane) and the window
opener (shell lane). Do not guess a signature. Propose it on a
`type:contract` issue and record the contract in `## Agreed`:

```bash
$COORD new "Contract: VFS API used by install_app" --ws persistence --type contract --p 0
$COORD propose 15 --to @m-vawter "writeFile(path,string):Promise<void>; readFile(path):Promise<string|null>; listFiles(dir):Promise<string[]>"
$COORD counter 15 "listFiles should return {path,size}; the launcher needs size"
# required before a shared adapter merges:
$COORD accept 15 "matches useOsStore hydration"
```

`PROPOSE` places the exact contract in `## Agreed` as *provisional*. The
current helpers post the proposal but do not write that section, so the
proposer edits the issue body. Agents may proceed inside their own slices,
but a shared adapter merges only after the seam owner's explicit `ACCEPT`;
`accept` copies the latest proposal into `## Agreed`. Never treat silence
as acceptance. One `COUNTER` is allowed; a further disagreement gets
`needs-human`. (Sprint mode, now historical, let an acknowledgment stand
in for `ACCEPT`; see ADR 0012.)

The same verbs settle ownership: if you want part of a claimed issue,
`propose` the split. Never fork the work silently.

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

```bash
$COORD review 12 --pr https://github.com/xcjs/DOMinic/pull/9   # PR opened
$COORD done 12 --pr https://github.com/xcjs/DOMinic/pull/9     # PR merged
```

Put `Closes #12` in the PR body so GitHub links it. Before `review`, compare
the PR's changed paths with the union of `## Files` for every linked issue.
Before `done`, verify every `## Done when` box is checked and the supplied
PR is merged. The current helpers do not perform those checks; a successful
command is not evidence that the gates passed.

`done` closes the issue, posts **DONE**, and currently emits compatibility
`DEP-DONE` notices. Then post a final hub line and `sync` again.

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

| Invariant | Current behavior |
| --- | --- |
| Canonical hub | Bash is deterministic; PowerShell currently requires one open `hub` label |
| Claim file scope | Displayed by `board`; overlap resolution is manual |
| Review file scope | Manual comparison against the union of linked issue scopes |
| Completion | Manual check of criteria and merged PR before `done` |
| Provisional contract | Manual edit of `## Agreed` after `propose` |

The manual rows are protocol requirements and candidates for helper
enforcement.

## Commands

| Command | Effect |
| --- | --- |
| `setup` | Create or refresh labels and the pinned hub issue (idempotent; once per repo) |
| `sync` | Board, your claims, stale claims, needs-human, hub tail. The session entry point |
| `board` | Open issues by workstream, status, owner, files |
| `hub "text"` | Post a SYNC one-liner on the hub issue |
| `new "title" --ws X [--p 0-2] [--type task\|contract\|decision\|bug] [--files G] [--done "a;b"] [--depends "#n"] [--body T] [--claim]` | Create an issue from the template |
| `claim N [--plan T] [--eta T]` | Assign yourself; refuses if owned; resolves races |
| `release N [--reason T] [--stale]` | Unassign; `--stale` may release anyone's stale claim |
| `status N "text"` | Heartbeat plus progress; moves claimed to in-progress |
| `block N --by "#m or @user" "text"` / `unblock N "text"` | Mark blocked / unblocked |
| `question N [--to @u] [--human] "text"` / `answer N "text"` | Ask / answer; `--human` adds needs-human |
| `propose N [--to @u] "text"` / `accept N ["text"]` / `counter N "text"` / `reject N "reason"` | Negotiate |
| `handoff N --to @user "text"` | Transfer ownership |
| `review N --pr URL` | Mark in-review after the caller verifies PR scope |
| `done N [--pr URL] ["text"]` | Close after the caller verifies criteria and merge state |
| `stale` | Claims silent longer than `COORD_STALE_MIN` (default 360 = six hours; sprint mode used 30) |
| `show N` | Print an issue with its structured comment history |

Every verb, its comment format, and the tie-break rules are specified
in [references/protocol.md](references/protocol.md). Read it when you
need to parse comments yourself or hit a case not covered above.

## Working agreements, and why

- **Issue before file.** Unclaimed work is invisible work; two agents will
  do it twice. A claim without branch/PR/no-code state is incomplete.
- **Talk in verbs.** Humans can write free text; agents skim by verb.
  The script guarantees the verb line is always there.
- **Record contracts before shared code.** ADR 0001 keeps slices decoupled,
  so the seams between them are exactly where a wrong guess costs an hour.
- **Verify the diff and the finish.** A declared scope and checklist only
  protect the team when review and completion compare them with reality.
- **Escalate early.** `needs-human` is not failure; it is the fastest
  path when two agents lack the context to choose.
- **Read before you write.** `sync` takes ten seconds. A merge
  conflict on `useOsStore` takes twenty minutes.
- **Reference the ADRs.** When a contract changes an architectural
  decision, say so and link the ADR; if it sticks it becomes ADR 0011.

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

| Family | Values | Meaning |
| --- | --- | --- |
| `ws:` | `os-shell` `agent-chat` `runtime-engine` `persistence` `integration` `docs` | Workstream (README, Team Workstreams) |
| `status:` | `unclaimed` `claimed` `in-progress` `blocked` `in-review` | Lifecycle; a closed issue is done |
| priority | `p0` `p1` `p2` | `p0` is the critical path of the current roadmap phase |
| `type:` | `task` `contract` `decision` `bug` | Kind of issue |
| flags | `needs-human` `hub` | Escalation; the pinned hub issue |
