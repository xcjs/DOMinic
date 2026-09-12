# Coordination protocol v1

The wire format behind `coord.sh`. Any agent with `gh` can follow it by
hand; the script only guarantees consistency.

## Comment header

Every protocol comment begins with one header line, then a blank line,
then a free-form body:

```text
**VERB** | agent: <agent-id> | human: @<login> | at: <ISO-8601 UTC>

<body>
```

- `agent-id` follows the OKF actor convention (`claude-code/<model>`,
  `pi/<version>`, `human` when typed by a person).
- Parse with `select(.body | startswith("**CLAIM**"))` in `gh --jq`.
- Header lines are ASCII so they survive every terminal encoding.

## Verbs

| Verb | Posted by | Side effects | Body should contain |
| --- | --- | --- | --- |
| `CLAIM` | claimant | assign self; `status:claimed` | `plan:`, `eta:` |
| `RELEASE` | owner, or anyone if stale | unassign; `status:unclaimed` | reason |
| `STATUS` | owner | `status:claimed` becomes `in-progress` | progress, next step |
| `BLOCKED` | owner | `status:blocked` | `by:` `#n` or `@user`, what is needed |
| `UNBLOCKED` | owner | `status:in-progress` | what changed |
| `QUESTION` | anyone | `needs-human` if `--human` | question, `to:` |
| `ANSWER` | anyone | removes `needs-human` | answer |
| `PROPOSE` | anyone | none | one concrete proposal, `to:` |
| `ACCEPT` | counterpart | contracts: proposal appended to body under **Agreed** | optional note |
| `COUNTER` | counterpart | fourth PROPOSE/COUNTER adds `needs-human` | revised proposal |
| `REJECT` | counterpart | none | reason |
| `HANDOFF` | owner | reassign; `status:claimed` | `to:`, context |
| `REVIEW` | owner | `status:in-review` | `pr:` |
| `DONE` | owner | close; `DEP-DONE` on dependents | `pr:`, summary |
| `DEP-DONE` | script | none | which dependency closed |
| `SYNC` | anyone | hub issue only | on / blocked / next |

Verbs in the heartbeat set (`CLAIM`, `STATUS`, `UNBLOCKED`, `HANDOFF`)
reset the stale timer.

## Tie-breaks and edge cases

1. **Claim race.** Among the current assignees, the author of the
   earliest `CLAIM` comment keeps the issue. The script checks two
   seconds after assigning and backs the loser off with a `RELEASE`.
2. **Stale claim.** An assigned issue with no heartbeat verb for
   `COORD_STALE_MIN` minutes (default 45), or with an assignee who
   never posted a `CLAIM`, may be released by anyone with
   `release N --stale`. Post what you observed in the reason.
3. **Negotiation cap.** When a fourth `PROPOSE`/`COUNTER` lands, the
   script labels the issue `needs-human` and mentions every human who
   took part. Agents stop there.
4. **Who decides `needs-human`.** The humans of the agents involved.
   If they are unavailable, the repo owner (`@xcjs`) decides.
5. **File overlap.** Ownership of a path follows the claimed issue
   whose `## Files` globs match it. When two claimed issues overlap,
   the later claimant proposes a split; the earlier one answers.
6. **Dependencies.** Write `#n` under `## Depends on` in the body.
   `done n` finds open issues whose body mentions `#n` and posts
   `DEP-DONE` there; the owner decides whether to `unblock`.
7. **Hub issue.** One open issue labelled `hub`, pinned. `SYNC`
   comments only. If it is missing, `setup` recreates it.

## Issue body template

```markdown
## Goal
<one paragraph>

## Done when
- [ ] <observable criterion>

## Files
<globs this issue will touch>

## Depends on
#n

## Notes
_(created by <agent> for @<login> at <time>)_

## Agreed
_(contracts only; appended by `accept`)_
```

## Parsing examples

Last heartbeat on an issue:

```bash
gh issue view 12 --json comments \
  --jq '[.comments[] | select(.body|test("^\\*\\*(CLAIM|STATUS|UNBLOCKED|HANDOFF)\\*\\*")) | .createdAt] | max'
```

All open proposals on a contract issue:

```bash
gh issue view 15 --json comments \
  --jq '.comments[] | select(.body|startswith("**PROPOSE**") or startswith("**COUNTER**")) | "\(.createdAt) \(.author.login)\n\(.body)\n"'
```

Everything assigned to you:

```bash
gh issue list --assignee @me --state open --json number,title,labels \
  --jq '.[] | "#\(.number) \(.title) [\([.labels[].name]|join(","))]"'
```

## For agents that cannot run bash

Follow the table above with raw `gh` commands. A claim, by hand:

```bash
gh issue comment N --body "$(printf '**CLAIM** | agent: pi/1 | human: @you | at: %s\n\nplan: ...' "$(date -u +%FT%TZ)")"
gh issue edit N --add-assignee @me --add-label status:claimed --remove-label status:unclaimed
```

The same claim in PowerShell 5.1 (watch out: inline `--jq` filters
with parentheses mangle in double quotes — prefer plain `--json`
output and `ConvertFrom-Json`):

```powershell
$hdr = '**CLAIM** | agent: pi/1 | human: @you | at: ' + `
  (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
gh issue comment N --body "$hdr`n`nplan: ..."
gh issue edit N --add-assignee @me --add-label status:claimed --remove-label status:unclaimed
```

The labels and the header line are the contract; the script is a
convenience.
