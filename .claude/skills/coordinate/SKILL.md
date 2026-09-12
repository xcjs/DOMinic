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
task board and a negotiation channel with three primitives:

- **Assignment is the lock.** An issue with an assignee is owned; touch
  its scope only through the protocol below.
- **Labels are the state machine.** `status:*`, `ws:*`, `p0`-`p2`,
  `type:*`, `needs-human`.
- **Structured comments are the conversation.** Every protocol comment
  starts with a bold verb (`**CLAIM**`, `**PROPOSE**`, ...) plus who and
  when, so any agent can parse the history with `gh --jq`.

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

`sync` prints the board, your open claims, stale claims, anything
marked `needs-human`, and the last few **SYNC** lines from the pinned
*Coordination hub* issue. Read them, then post your own one-liner:

```bash
$COORD hub "starting #12 (window drag); nothing blocking"
```

Do this before opening files. It is the cheapest way to keep two
agents from building the same thing.

## Picking up work

1. Choose an unclaimed issue in your workstream (`ws:*`), highest
   priority first. `p0` is the demo golden path: if a `p0` is
   unclaimed and you can do it, take it over anything else.
2. Claim it with a plan and an ETA:

   ```bash
   $COORD claim 12 --plan "useDraggable on WindowFrame; z-index in useOsStore" --eta 30m
   ```

   If someone else holds it the script refuses; use `propose` to split
   it or `question` to ask. If two agents claim within the same seconds
   the earliest **CLAIM** comment wins and the loser is unassigned
   automatically.
3. Hold at most two claims at once. Idle claims block teammates.

No matching issue? Create one; that is how work becomes visible:

```bash
$COORD new "Window drag + z-index" --ws os-shell --p 0 \
  --files "app/features/os/**" \
  --done "title bar drags;click focuses and raises;no negative offsets" \
  --depends "#3" --claim
```

`--files` matters: it is the overlap check. `board` shows files per
issue, so an agent about to edit `app/shared/contracts.ts` can see who
else is in there.

## While working

- Post a **STATUS** at every milestone or roughly every 30 minutes:
  `$COORD status 12 "drag works; z-index next"`. A claim with no
  CLAIM or STATUS comment for 45 minutes is *stale* and anyone may
  release it (`$COORD release 12 --stale`). During a hackathon a silent
  agent is usually a crashed one, not a busy one.
- Blocked? Say on what and by whom, then move to something else:
  `$COORD block 12 --by "#7" "need the VFS writeFile signature"`.
  When #7 closes, `done` posts a heads-up on every open issue that
  mentions it.
- Need a human decision (model choice, scope cut, anything from
  `QUESTIONS.md`)? `$COORD question 12 --human "..."` adds
  `needs-human`; humans skim that label.

## Negotiating: interfaces, splits, disputes

Cross-workstream seams are where parallel work collides: the
`install_app` handler (SDE 2) needs the VFS API (SDE 4) and the window
opener (SDE 1). Do not guess a signature. Propose it on a
`type:contract` issue and build only after **ACCEPT**:

```bash
$COORD new "Contract: VFS API used by install_app" --ws persistence --type contract --p 0
$COORD propose 15 --to @m-vawter "writeFile(path,string):Promise<void>; readFile(path):Promise<string|null>; listFiles(dir):Promise<string[]>"
# the other side answers with one of:
$COORD accept 15 "matches useOsStore hydration"
$COORD counter 15 "listFiles should return {path,size}; the launcher needs size"
$COORD reject 15 "sync API is fine for the POC; async adds await noise"
```

`accept` on a contract issue copies the accepted proposal into the
issue body under **Agreed**, so the contract is readable without
scrolling comments. After two unresolved rounds (PROPOSE, COUNTER,
COUNTER) the script adds `needs-human` and mentions the humans
involved; stop negotiating and let them decide. Two agents arguing
past that point burn clock without adding information.

The same verbs settle ownership: if you want part of a claimed issue,
`propose` the split. Never fork the work silently.

## Finishing

```bash
$COORD review 12 --pr https://github.com/xcjs/DOMinic/pull/9   # PR opened
$COORD done 12 --pr https://github.com/xcjs/DOMinic/pull/9     # PR merged
```

Put `Closes #12` in the PR body so GitHub links them. `done` closes the
issue, posts **DONE**, and notifies every open issue that references
`#12`. Then `hub` a one-liner and `sync` again.

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
| `review N --pr URL` | Mark in-review |
| `done N [--pr URL] ["text"]` | Close and notify dependents |
| `stale` | Claims silent for more than 45 min (`COORD_STALE_MIN`) |
| `show N` | Print an issue with its structured comment history |

Every verb, its comment format, and the tie-break rules are specified
in [references/protocol.md](references/protocol.md). Read it when you
need to parse comments yourself or hit a case not covered above.

## Working agreements, and why

- **Issue before file.** Unclaimed work is invisible work; two agents
  will do it twice.
- **Talk in verbs.** Humans can write free text; agents skim by verb.
  The script guarantees the verb line is always there.
- **Contracts before code across slices.** ADR 0001 keeps slices
  decoupled, so the seams between them are exactly where a wrong guess
  costs an hour.
- **Escalate early.** `needs-human` is not failure; it is the fastest
  path when two agents lack the context to choose.
- **Read before you write.** `sync` takes ten seconds. A merge
  conflict on `useOsStore` takes twenty minutes.
- **Reference the ADRs.** When a contract changes an architectural
  decision, say so and link the ADR; if it sticks it becomes ADR 0011.

## Labels

| Family | Values | Meaning |
| --- | --- | --- |
| `ws:` | `os-shell` `agent-chat` `runtime-engine` `persistence` `integration` `docs` | Workstream (README, Team Workstreams) |
| `status:` | `unclaimed` `claimed` `in-progress` `blocked` `in-review` | Lifecycle; a closed issue is done |
| priority | `p0` `p1` `p2` | `p0` is on the demo golden path |
| `type:` | `task` `contract` `decision` `bug` | Kind of issue |
| flags | `needs-human` `hub` | Escalation; the pinned hub issue |
