# Running the work loop from any harness

The loop is one Node script with no state of its own, so "keep going"
means "run `start` again". Each harness has its own way to re-invoke an
agent; this file collects the recipes. In every case the agent runs the
same three commands at the same moments: `start` to begin a step,
`checkpoint` before context is lost, `milestone` when the PR merges.

Common setup for every recipe:

```bash
export COORD_AGENT="<harness>/<model>"
gh auth status
npm run loop -- resume      # first action in any fresh session
```

## Claude Code

The built-in `/loop` self-paces a prompt; use it to wrap the loop:

```text
/loop 20m npm run loop -- start
```

or, when the model is driving itself, call `ScheduleWakeup` after each
`milestone` with the same prompt. Before a compaction warning, run
`npm run loop -- checkpoint -m "..."`; after compaction, `resume`.
The project skill `/work-loop` loads these instructions automatically.

## Codex CLI

Codex has no scheduler; drive it from a shell loop that hands the brief
back to the agent each iteration:

```bash
while true; do
  npm run loop -- start > /tmp/brief.txt || break
  grep -q 'ROADMAP COMPLETE' /tmp/brief.txt && break
  codex exec "$(cat .claude/skills/work-loop/SKILL.md)
$(cat /tmp/brief.txt)
Work this step to a PR, checkpoint before you stop, then exit."
done
```

Codex reads `AGENTS.md`, which this repo keeps local-only; point it at
`docs/agents/work-loop.md` in your local `AGENTS.md`.

## Pi, opencode, Cursor, Aider, and similar

Same shape as Codex: the harness's `run`/`exec` command inside a `while`
loop, with `start`'s output as the task prompt and the SKILL as
instructions. If the harness supports a persistent session, run
`checkpoint` at the end of each turn and `resume` at the start of the
next instead of restarting.

## cron or CI

A scheduled job can keep the board moving even when nobody is at a
keyboard:

```bash
*/30 * * * *  cd /srv/DOMinic && git pull -q && npm run loop -- status --write && git add vault && git commit -qm "vault: progress" && git push -q
```

That refreshes the vault's progress view; executing a step still needs
an agent, so pair it with one of the harness recipes above.

## A human

Re-prompt the agent with `/work-loop start` (Claude Code) or paste the
brief from `npm run loop -- start`. Humans also run `milestone` after
they merge a PR, and `status --write` whenever the vault's progress view
looks stale.

## When nothing is eligible

`start` says so and lists open PRs that lack a non-author approval.
Reviewing one is the most useful thing an idle agent can do: merges are
distributed, and the only thing that unblocks a gated phase is the
previous phase's PRs landing.
