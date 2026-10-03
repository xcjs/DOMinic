---
name: work-loop
description: Continuous roadmap execution for DOMinic - jump on, read NEXT.md, take the next eligible step in your lane through /coordinate, work it to a merged PR, record the milestone in the vault, and repeat until the roadmap is complete. Use this whenever an agent starts a session on this repo, asks what to work on, finishes a step, is about to run out of context, resumes after compaction, or is told to keep going - even when the user only says "keep working", "next", "pick something up", "save your place", or "where was I". Works from any agentic coding harness; Claude Code's built-in /loop is one way to self-schedule it, not a requirement.
argument-hint: "[start|next|status|checkpoint|resume|milestone|vault-init|vault-sync] ..."
allowed-tools: Bash(node:*), Bash(npm:*), Bash(git:*), Bash(gh:*), Bash(bash:*), Read
---

# Work loop: finish the roadmap, together, without stopping

`NEXT.md` is a sequenced roadmap with phases, exit criteria, and a lane
per collaborator. `/coordinate` turns GitHub Issues into the shared
board. The vault (`vault/`) is the project's second brain. This skill is
the loop that runs those three together so that any agent, on any
harness, can arrive cold, do the right next thing, leave a trail, and
hand off cleanly - and so several agents can do that at once without
colliding.

The whole skill is one script. It never holds state: the roadmap is in
`NEXT.md`, ownership is in issues and branches, memory is in the vault.

```bash
LOOP="node .claude/skills/work-loop/scripts/loop.mjs"   # or: npm run loop --
```

## Before the first command

```bash
export COORD_AGENT="<harness>/<model>"   # e.g. codex/gpt-5, claude-code/claude-fable-5.1
gh auth status                           # you act as your human's GitHub account
node --version                           # >= 24 (ADR 0011)
```

If two sessions of the same human run at once, suffix the agent id
(`.../vault`, `.../loop`) so the record shows who did what.

## The cycle

```text
start -> work -> checkpoint (as you go) -> PR -> review others -> milestone -> start
```

1. **`$LOOP start`** - prints your last session note and the board,
   picks the next eligible step (your lane first, then unowned steps),
   creates the issue if it does not exist, claims it with a branch name,
   checks out `step/<id>-<slug>` from `origin/main`, and prints the work
   brief: work, why, phase exit criteria, files you may touch. It never
   picks a step another lane owns unless you pass `--any`; it never picks
   a gated step (phase order, and sequential order inside Phase 1).
2. **Work the step** inside the issue's `## Files`. Touching another
   lane's path makes that lane's owner your reviewer.
3. **`$LOOP checkpoint -m "what changed; what is next"`** at every
   milestone and **before your context is compacted**. It writes a
   Session note to `vault/Sessions/`, refreshes Home, and posts `STATUS`
   on the issue. Pass `--handoff @login` to transfer ownership instead.
4. **Open the PR** with `Closes #N`, one step per PR, ideally under 300
   changed lines. While you wait for review, review someone else's:
   `start` lists PRs awaiting a non-author approval whenever nothing is
   eligible for you. Any non-author approver merges once CI is green.
5. **`$LOOP milestone <id> --pr <url>`** once merged. It runs
   `coord done`, writes `vault/Milestones/<id> - <title>.md` with what
   shipped and the exit criterion it serves, and refreshes progress.
6. **`$LOOP start`** again. Stop only when it prints
   `ROADMAP COMPLETE`, or when a human tells you to.

## Context: checkpoint before, resume after

Agent sessions get compacted or restarted. The loop assumes it and makes
the handover cheap:

- **Before compaction or stopping:** `$LOOP checkpoint -m "..."`. Say
  what is done, what is half-done, and the exact next action; the note
  captures branch, last commit, dirty files, and the PR state for you.
- **First action after compaction or a fresh start:**
  `$LOOP resume`. It prints your latest session note in full, the recent
  milestones, the board, and what is eligible next. Read it before
  touching a file. `start` runs a short form of it automatically.

If you cannot tell whether compaction is near, checkpoint anyway; a
spare session note costs nothing and a lost one costs an hour.

## Keeping it going on any harness

The loop is re-entrant: every `start` recomputes everything from the
repo, so "non-stop" just means "run `start` again after `milestone`".
How you get re-invoked depends on the harness; the recipes are in
[references/harnesses.md](references/harnesses.md). In short:

| Harness | How to self-schedule |
| --- | --- |
| Claude Code | built-in `/loop 20m` wrapping `npm run loop -- start`, or `ScheduleWakeup` |
| Codex / opencode / Pi / Cursor agents | the harness's own run loop or a shell `while` over `npm run loop -- start` |
| cron / CI | a scheduled job that runs `start` and hands the brief to an agent |
| a human | re-prompt with `/work-loop start` (Claude Code) or paste the brief |

Whatever the harness, the checkpoint/resume pair is what makes a restart
safe, so never skip step 3.

## Not stepping on each other

These come from the v3 coordination playbook and the lanes in `NEXT.md`;
the loop enforces the first three mechanically:

- **Lane first.** `start` offers your lane's eligible steps before any
  other; another lane's step is taken only with `--any` and after a
  `propose` on its issue.
- **One in progress.** `start` continues the step you already hold
  rather than claiming a second one.
- **Phase gates.** Phase N+1 opens when Phase N's steps are all done;
  Phase 1 steps open in order; `3.1` may start once Phase 1 has begun.
- **Scope follows the issue.** Keep the diff inside `## Files`; widen the
  issue before widening the PR.
- **Six hours, then a ping.** The full protocol is active (ADR 0012):
  silence is not abandonment until a `QUESTION` has gone unanswered for
  three more hours.

## The vault

`vault/` is committed in the repo so every agent and machine shares it.
It keeps the schema the project already used: OKF-style frontmatter on
every note; generated notes (`ADRs/`, `Conventions/`, `Coordination/`,
`Hackathon/`, `Specs & Plans/`, `Repo Config/`, Commit Timeline) rebuilt
by `vault-sync` and never hand-edited; synthesis notes (Home,
Architecture Overview, Repo Map, Open Questions & Gaps) hand-written;
plus the two folders the loop owns:

- `Milestones/` - one note per completed step: PR, author, files, the
  roadmap context, the exit criterion it serves.
- `Sessions/` - one note per checkpoint: step, branch, state, summary,
  next action, resume command.

`vault-init` scaffolds the schema in a repo that lacks it; `vault-sync`
regenerates the generated half after a pull (needs Python 3). Open the
folder in Obsidian; `.obsidian/workspace*` is ignored by git.

## Commands

| Command | Effect |
| --- | --- |
| `start [--step ID] [--any] [--no-git] [--dry-run]` | Resume brief, pick, create/claim, branch, work brief |
| `next [--mine\|--any]` | Show eligible steps without claiming |
| `status [--write]` | Progress by phase; `--write` refreshes `Roadmap Progress.md` + Home |
| `checkpoint [-m T] [--step ID] [--handoff @u] [--no-post]` | Session note + `STATUS`/`HANDOFF` |
| `resume [--all]` | Latest session note(s), milestones, board, next |
| `milestone ID --pr URL [-m T]` | `coord done` + Milestone note + progress |
| `vault-init` | Scaffold the vault schema (idempotent) |
| `vault-sync` | Regenerate generated vault notes from repo docs |

Add `--roadmap <file>` or `--vault <dir>` to point the loop elsewhere;
defaults live in `loop.config.json`, which also holds the phase-gating
rules (`sequentialPhases`, `parallel`) so the loop can serve another
roadmap or another repo unchanged.
