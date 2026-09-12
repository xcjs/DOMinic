---
type: research
title: Agent-first coordination over GitHub Issues — what to keep, cut, and harden
description: Evidence-based critique of coordination protocol v1 for five heterogeneous coding agents on one repo during a =<4h hackathon sprint, with a sprint-minimum subset, parameter values, failure-mode defenses, and a proposed v1.1 diff.
tags: [agents, coordination, github-issues, hackathon, multi-agent, research]
generated: { by: claude-code/deep-researcher, at: 2026-09-12T18:45:00Z }
verified: 2026-09-12
stale_after: 2026-12-12
sources:
  - id: mast
    resource: https://arxiv.org/abs/2503.13657
    title: "Why Do Multi-Agent LLM Systems Fail? (MAST taxonomy)"
  - id: copilot-agent
    resource: https://docs.github.com/en/copilot/concepts/agents/coding-agent/coding-agent
    title: GitHub Copilot coding agent (assignment, reporting, guardrails)
  - id: zulipbot
    resource: https://forum.getodk.org/t/fine-grained-permissions-for-github-issues-self-assign-labels/9352
    title: "Zulipbot / opendatakit-bot claim workflow (7-day warn, 3-day release)"
  - id: kleppmann
    resource: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
    title: How to do distributed locking (lease expiry is not proof of death)
  - id: autonoma
    resource: https://getautonoma.com/blog/parallel-ai-agent-prs
    title: Five ways to stop parallel AI agent PRs conflicting
---
<!-- markdownlint-disable -->


# Q01 — Agent-first coordination over GitHub Issues

## Pipeline Summary

### Sprint-minimum verdict (needed immediately)

- **Keep four verbs and one field.** `CLAIM`, `BLOCKED`, `PROPOSE`,
  `DONE` — plus the `## Files` glob line, which is the single
  highest-value primitive on the board. Everything else is optional
  for the rest of today.
- **The expensive ceremony is the ceremony that BLOCKS, not the one
  that WRITES.** A `gh issue comment` costs one agent turn (~15s). A
  *wait* for `ACCEPT` before writing code can idle an agent for 10-20
  minutes — 10-20% of the remaining sprint. Cut waits; keep writes.
- **Change contract-before-code to "declare, then proceed."** Post the
  interface as `PROPOSE`, write it into the issue body under
  `## Agreed` as provisional, and **start building against it
  immediately**. The counterpart has 15 minutes to `COUNTER`;
  un-countered, it stands. This preserves the anti-guessing property
  (the seam is public and written) without the blocking cost.
- **Cut for today:** clock-driven `STATUS` every 30 min (make it
  event-driven), `--eta` on claims, the `ACCEPT`/`REJECT` verbs
  (collapse to `PROPOSE` + silence-implies-accept + `COUNTER`),
  `DEP-DONE`, `HANDOFF`, `UNBLOCKED`, `type:decision`, and the
  `status:claimed` vs `status:in-progress` distinction (one
  `status:claimed`).
- **Switch condition to the full protocol:** the moment the team is no
  longer co-located *or* the work outlives one sitting — concretely,
  **the first session that starts after today's submission**. Anything
  asynchronous, or any horizon past ~4 hours, restores `STATUS`
  heartbeats, `ACCEPT`-before-code, `HANDOFF`, and `DEP-DONE`.

### Top findings

- **MAST (1,600+ annotated traces, 7 MAS frameworks, kappa = 0.88)
  finds 14 failure modes in three categories — specification issues,
  inter-agent misalignment, and task verification** — and concludes the
  failures "require more sophisticated solutions," not better
  orchestration prompts. Two of three categories are *specification*
  and *verification*, not negotiation. The team's protocol invests most
  of its verb surface in negotiation; the evidence says
  `## Done when` and the review gate matter more. (rung 1)
- **GitHub's own Copilot coding agent validates the substrate but not
  the negotiation.** It is assigned an issue, reports via a draft PR
  and session logs, and is fenced (cannot approve/merge its own PR,
  pushes only to its own branch). It is strictly **one agent per
  issue** and never negotiates with another agent — there is **no
  production precedent for agent-to-agent negotiation over Issues**.
  (rung 1)
- **A real open-source claim-bot precedent exists with a two-stage
  stale ladder:** Zulipbot / `@opendatakit-bot` — claim by comment,
  bot assigns and labels `in progress`; **"If there is no activity in 7
  days, the claimer will be reminded... If there is no response for 3
  days, the issue will be unclaimed."** A 70/30 warn-then-release
  split, not a single hard timeout. v1's single 45-minute guillotine
  has no such precedent. (rung 1)
- **Assignment-as-lock is a lease, not a mutex — and Kleppmann's
  argument applies directly:** a lease can expire while the holder is
  still working (the GC-pause case), so expiry is *not* evidence the
  holder stopped. The real fence here is the **git branch**, not the
  assignee field. The protocol should stop implying assignment
  protects code; it protects *attention*. (rung 1/2)
- **Practitioner consensus across independent accounts: scope agents to
  disjoint file sets and serialize merges.** "Only run tasks in
  parallel if their expected file sets are disjoint or nearly so";
  maintain an explicit **overlap-zone registry** of high-risk shared
  files requiring human review. This is exactly what v1's `## Files`
  glob does — it is the most undersold line in the template. (rung 2)

### Parameters recommended

| Parameter | Sprint (=<4h) | Full | One-line justification |
|---|---|---|---|
| Stale warn | **20 min** silence | 6 h | ~1 missed heartbeat ceiling; scaled Zulipbot warn stage |
| Stale release | **+10 min** after warn | +3 h | Preserves Zulipbot's ~70/30 warn:grace ratio; total = 2x heartbeat, the classic failure-detector margin |
| Heartbeat | **event-driven, 20-min ceiling** | 30-60 min | Clock rituals add no information; a milestone does |
| Negotiation cap | **1 round** (PROPOSE -> COUNTER -> human) | 2 rounds | MAST "step repetition"/"unaware of termination"; a 3rd round has never added information under deadline |
| Claim limit | **1 active + 1 blocked** | 2 active | An agent is a single-threaded worker; Little's Law says extra WIP buys lead time, not throughput |
| Proposal auto-accept | **15 min** un-countered | never (explicit ACCEPT) | Optimistic concurrency: cost of a wrong thin adapter << cost of an idle agent |
| `needs-human` ack | **10 min**, then assume-and-log | 30 min | Incident-response ladders re-escalate on a timer rather than block indefinitely |

### Confidence

**Overall: medium-high.** Load-bearing claims by rung:

- MAST taxonomy, sample size, categories — **rung 1** (abstract fetched).
- Zulipbot 7d/3d two-stage stale ladder — **rung 1** (quoted from source).
- Copilot coding agent assignment/guardrails — **rung 1** (GitHub docs).
- Kleppmann lease-expiry hazard — **rung 1/2**.
- Disjoint-file-sets + serialized merge queue — **rung 2** (multiple
  independent practitioner accounts).
- **The specific numbers (20/10 min, 1 round, 15-min auto-accept) are
  rung 5 — reasoning by analogy.** No study measures coordination
  parameters for LLM agent teams on a 4-hour deadline. They are
  derived by scaling human/distributed-systems precedent, and they are
  *defensible*, not *measured*. Say so when adopting them.

### Key sources

1. https://arxiv.org/abs/2503.13657 — MAST failure taxonomy (primary).
2. https://docs.github.com/en/copilot/concepts/agents/coding-agent/coding-agent
   — Copilot coding agent mechanics and guardrails (primary).
3. https://forum.getodk.org/t/fine-grained-permissions-for-github-issues-self-assign-labels/9352
   — Zulipbot claim/stale parameters (primary practitioner).
4. https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
   — lease expiry vs. fencing tokens (authoritative practitioner).
5. https://getautonoma.com/blog/parallel-ai-agent-prs — parallel agent
   PR conflict strategies (practitioner).

### Gaps

- **No measured evidence on coordination-protocol parameters for LLM
  agent teams.** Every number below is analogy: distributed lock
  leases, Kanban WIP, incident escalation, open-source claim bots.
- **No precedent for agent-to-agent negotiation over Issues.** Copilot
  coding agent is one-agent-per-issue. The `PROPOSE/COUNTER` machinery
  is genuinely novel and therefore genuinely unvalidated.
- **No data on cross-harness comment parsing reliability.** The
  recommendation to key on `.author.login` rather than the self-
  declared `agent:` field is reasoning about trust boundaries, not a
  measured failure rate.
- Could not verify whether every harness's `gh` wrapper preserves
  leading whitespace in comment bodies; the "header must be line 1"
  rule is defensive, not empirical.

---

*(Full report continues below.)*

## 1. Executive summary

Yes — Issues + `gh` is the right substrate. It is the only shared
memory five heterogeneous agents already have, and GitHub's own coding
agent uses exactly this primitive (assign an issue, report on a PR).
Keep it. But protocol v1 is calibrated for a *day*, not for 100
minutes, and it has one structural error worth more than all the
parameter tuning combined.

The three highest-leverage changes:

1. **Stop blocking on ACCEPT. Declare and proceed.** Contract-before-
   code is the only rule in v1 that makes an agent *idle*. Replace it
   with: post `PROPOSE`, write the signature into `## Agreed` as
   provisional, start building. Un-countered in 15 minutes, it is
   binding. This keeps the anti-guessing property (the seam is public)
   and deletes the wait.
2. **Make the stale timer a two-stage ladder, not a guillotine.** 20
   minutes silent -> anyone posts a `QUESTION` ping; 10 more minutes
   -> anyone may `RELEASE`. This is the Zulipbot pattern scaled, and
   it directly fixes the trust problem the team already identified.
   Also: state plainly that release is advisory. **The git branch is
   the lock; the assignee field is a courtesy.**
3. **Move investment from negotiation verbs to specification and
   verification.** MAST's three failure categories are specification,
   inter-agent misalignment, and verification — two of three are *not*
   negotiation. Make `## Done when` mandatory and non-empty, and make
   `DONE` require a merged PR URL. That is where the evidence says the
   failures actually are.

Cut roughly half the verbs for today. Keep the header line, the
labels, the `## Files` globs, and the four verbs that carry
information: CLAIM, BLOCKED, PROPOSE, DONE.

## 2. Recommendations table

Cost is **agent turns**, not typing minutes — the real currency is a
tool call plus the human's attention while it runs, and, where noted,
*idle time*.

| Practice | Why | Cost | Evidence strength |
|---|---|---|---|
| Keep assignment-as-lock | Only atomic, universally visible claim primitive in GitHub; Copilot coding agent uses the same signal | ~0 (1 turn, bundled with CLAIM) | **Primary** (GitHub docs) |
| Keep the bold-verb header | Heterogeneous agents cannot parse free text reliably; MetaGPT's core thesis is structured artifacts over free dialogue | ~0 | **Primary** (MetaGPT) + locked decision |
| Keep `## Files` globs | Disjoint file sets are the #1 practitioner defense against parallel-agent conflict | ~0 (one line at issue creation) | **Practitioner consensus** (multiple independent accounts) |
| Keep `## Done when` checkboxes, make them mandatory | MAST: specification failures are a top-3 category; Copilot docs stress well-scoped issues with acceptance criteria | ~0 | **Primary** (MAST + GitHub) |
| **Change** contract-before-code -> declare-and-proceed | Blocking wait is the only rule that idles an agent; 10-20 min = 10-20% of sprint | Saves 10-20 min/seam | **Analogy** (optimistic concurrency) |
| **Change** 45-min guillotine -> 20+10 two-stage ladder | Single hard timeout erodes board trust; warn-then-release is the actual OSS precedent | +1 turn per ping | **Primary practitioner** (Zulipbot) |
| **Change** negotiation cap 4 -> 2 messages (1 round) | MAST "step repetition" / "unaware of termination conditions"; v1's own docs already contradict each other here | Saves 2 turns + a wait | **Primary** (MAST) |
| **Change** claim limit 2 -> 1 active + 1 blocked | An agent is single-threaded; Little's Law — extra WIP buys lead time, not throughput | ~0 | **Analogy** (Kanban/Little's Law) |
| **Change** STATUS clock-driven -> event-driven w/ 20-min ceiling | A timer-triggered status carries no information; a milestone does | Saves ~1-2 turns/agent | **Analogy** (incident-response status cadence) |
| **Add** `needs-human` ack timeout -> assume-and-log | Escalation ladders re-escalate on a timer rather than block forever; a blocked agent at a deadline delivers zero | +1 turn | **Analogy** (incident escalation) |
| **Add** "say it out loud" duty on escalation | Co-located humans do not watch GitHub notifications; the cheapest channel is the table | ~0 | **Reasoning** (exploits co-location) |
| **Add** parse on `.author.login`, not the `agent:` field | Self-declared identity is advisory and can be copy-pasted wrong; the API author is ground truth | ~0 | **Reasoning** (trust boundary) |
| **Add** frozen-base + serialized merge + T-45 freeze | Parallel PRs from a moving `main` produce semantic conflicts that compile | 5-10 min/merge verification | **Practitioner consensus** |
| **Remove** for sprint: ETA, ACCEPT/REJECT, DEP-DONE, HANDOFF, UNBLOCKED, `type:decision`, claimed/in-progress split | Each is a turn that changes no one's next action inside 100 minutes | Saves ~5-8 turns/agent | **Reasoning** + skeptic lane |

## 3. Sprint-minimum protocol vs. full protocol

### Sprint-minimum (today, =<4 hours, co-located)

**Verbs — four:**

| Verb | When | Body must contain |
|---|---|---|
| `CLAIM` | Before touching any file | `plan:` one line. **No ETA.** |
| `BLOCKED` | Waiting on anything | `by:` `#n` or `@user` + what you need |
| `PROPOSE` | Any cross-slice signature, **before you write it, not before you build it** | The exact signature. Then proceed. |
| `DONE` | PR merged | `pr:` URL |

Plus two that are *read*, not written: `QUESTION --human` (escalation)
and `SYNC` (hub one-liner, session start and on merge only).

`COUNTER` exists but is terminal: one COUNTER, then `needs-human`.

**Labels — three families:** `ws:*`, `p0`/`p1`, `needs-human`. Collapse
`status:*` to two states that matter: unassigned = free, assigned =
taken. (The assignee field already encodes this; `status:claimed` and
`status:in-progress` are a second, drift-prone copy of the same fact.)
Keep `type:contract` only because it is how you find the seams.

**Rituals — two:** `sync` at session start (10 s), and a `SYNC`
one-liner when a PR merges so every other agent knows to rebase.

### Full protocol (post-hackathon, asynchronous, multi-day)

Everything in v1 as written, plus the v1.1 hardening in section 8:
restore `ACCEPT` as a blocking gate before code, `HANDOFF` (context
loss on handoff is a documented MAST failure mode and matters when the
handoff crosses a session boundary), `DEP-DONE`, `UNBLOCKED`,
`status:in-review`, 30-60 min heartbeats, and the 6h/3h stale ladder.

### The switch condition

Switch to the full protocol when **either** of these becomes true:

1. **The humans are no longer in the same room** (verbal repair is no
   longer free — every ambiguity must be written), **or**
2. **Work outlives one sitting** (a claim can now span a sleep, so a
   silent claim is normal rather than suspicious, and handoff context
   must survive a cold session start).

Concretely for this team: **the first session after 4:00 p.m. ET
today.** Nothing in between.

## 4. Parameters, with justification

### Stale claim: 20-minute warn, 10-minute grace (total 30)

v1's 45 minutes is 45% of the remaining sprint — a crashed agent could
hold a `p0` for nearly half the clock. But a single hard timeout is
also the wrong *shape*.

The actual open-source precedent is two-stage. Zulipbot /
`@opendatakit-bot`, quoted verbatim: *"If there is no activity in 7
days, the claimer will be reminded to update issue. If there is no
response for 3 days, the issue will be unclaimed."* That is a ~70/30
warn:grace split with a human-answerable ping in between — precisely
the "ping with QUESTION, then release" courtesy the team already
proposed. It is not a courtesy; it is the standard.

Scaled to a sprint: **20 min silent -> anyone posts `QUESTION` ("still
on #12?") and applies no label change. 10 further min with no reply ->
anyone may `RELEASE --stale`.** 30 minutes total is ~2x the 20-minute
heartbeat ceiling, which is the conventional failure-detector margin
(ZooKeeper's minimum session timeout is 2x tickTime for the same
reason: one missed beat is noise, two is a signal).

**The caveat that must be written into the playbook.** Kleppmann's
distributed-locking argument applies verbatim: a lease can expire
while the holder is *still working* — the process was paused, not
dead. Therefore:

> Releasing a stale claim does **not** make the files safe to edit.
> The assignee field protects attention, not code. The **git branch is
> the fence.** A re-claimer starts from a fresh `git pull` on a new
> branch and lets merge be the arbiter.

This single sentence resolves the team's trust concern: the harm of a
wrong release is bounded because the lock was never load-bearing.

### Negotiation cap: one round (2 messages), then a human

v1 is internally inconsistent — `SKILL.md` says *"After two unresolved
rounds (PROPOSE, COUNTER, COUNTER)"*; `protocol.md` says *"the fourth
`PROPOSE`/`COUNTER`"*. Fix the contradiction first; agents reading
different files will behave differently, which is itself an
inter-agent misalignment bug.

Set it at **PROPOSE -> COUNTER -> `needs-human`.** Rationale: MAST
names *step repetition* and *unaware of termination conditions* among
its 14 failure modes, and the agentic-loop literature's standard
remedy is a hard max-round cap that binds before convergence does.
Under a deadline, a third exchange between two agents that already
disagree is almost never new information — it is two models
re-ranking the same considerations. Escalating costs one human
sentence across the table; a third round costs 2 turns and a wait.

### Heartbeat: event-driven, 20-minute ceiling

Drop "every 30 minutes." A timer-triggered STATUS that says "still
working" changes no one's behavior. Replace with: **post STATUS at
every milestone (a file compiles, a contract lands, a PR opens), and
never go more than 20 minutes silent.** Same evidence value, fewer
empty turns, and it makes the stale ladder meaningful — silence now
genuinely implies "no milestone reached," which is exactly the signal
a teammate needs.

### Claim limit: 1 active + 1 blocked

v1 allows two. For an agent the right number is **one active**. A human
can context-switch; a single agent session cannot make progress on two
issues at once, so a second active claim is pure inventory. Little's
Law (WIP = throughput x lead time) says that at fixed throughput,
raising WIP only raises lead time — and at a hard submission deadline,
lead-time overrun means the work scores *zero*, not "late." The second
slot is reserved for an issue you own but that is `BLOCKED`, so you
are not forced to abandon ownership to stay productive.

### Proposal auto-accept: 15 minutes

New parameter, needed by the declare-and-proceed change. A `PROPOSE`
on a `type:contract` issue that draws no `COUNTER` within 15 minutes
is binding and the proposer writes it under `## Agreed`. Fifteen
minutes is below the 20-minute heartbeat ceiling, so any agent still
alive will have looked at the board at least once inside the window.

### `needs-human` ack: 10 minutes, then assume-and-log

Escalation ladders in incident response re-escalate on a timer rather
than wait indefinitely. Same here: if `needs-human` goes unanswered for
10 minutes, the agent **picks the most reversible option, posts it as
`ASSUMED` on the issue, and proceeds**. A blocked agent at T-40
delivers nothing; a wrong-but-reversible choice delivers something and
is visible on the board for a human to overrule.

## 5. Failure modes and defenses

| Failure mode | Source | Defense (protocol / script / human) |
|---|---|---|
| **Duplicated work** | MAST; practitioner accounts | CLAIM before any file edit; `sync` at session start; assignment visible to all. *Detect:* two open issues with overlapping `## Files` globs. |
| **Guessed interfaces at seams** | MAST ("specification issues"); ADR 0001 slice boundaries | `PROPOSE` the signature publicly **before writing it**; it lands in `## Agreed`. Guessing is fine; guessing *silently* is not. *Detect:* a PR that changes a cross-slice signature with no `type:contract` issue. |
| **Silent / stale claims** | Zulipbot precedent; team experience | 20+10 two-stage ladder with a `QUESTION` ping first. *Detect:* `stale` command. |
| **Stale release hits a live agent** | Kleppmann (lease expiry != death) | Ping first; release is advisory; **git branch is the fence**; re-claimer rebases rather than assuming a clean field. |
| **Infinite negotiation** | MAST ("step repetition", "unaware of termination conditions") | Hard cap at 1 round -> `needs-human`. Cap must bind *before* convergence. |
| **Premature "done"** | MAST ("task verification" — a whole top-level category) | `DONE` requires a merged `pr:` URL; `## Done when` checkboxes must all be ticked. Never self-certify from a branch. |
| **Merge conflicts on kernel files** | Practitioner consensus | Overlap-zone registry: name the shared files in the hub issue; one owner per kernel file for the sprint; serialized merges. |
| **Semantic conflicts that compile** | Practitioner (silent feature drop) | Behavioral check of the demo golden path after each merge, not just lint. Budget 5-10 min per merge. |
| **Context loss on handoff** | MAST | Sprint: **do not hand off** — release and re-claim, so the new owner reads the issue rather than inheriting an assumption. Full protocol: `HANDOFF` with explicit context body. |
| **Over-claiming / inventory** | Little's Law | 1 active claim. *Detect:* `gh issue list --assignee <login>` returning >1 non-blocked. |
| **Identity collision (two agents, same model string)** | Reasoning | Key all logic on `.author.login` (GitHub's own author), never the self-declared `agent:` field. |
| **Protocol theater / compliance over shipping** | Skeptic lane; MAST's finding that orchestration tweaks do not fix MAS failure | Verb budget: if an agent has posted more protocol comments than commits in the last 30 min, it is coordinating instead of building. Stop. |
| **Rate-limit storms** | GitHub REST secondary limits | Poll the board on session start and on merge, **not in a loop**. No agent should run `sync` more than ~once per 10 min. |

## 6. Integration cadence for five streams in under four hours

1. **Frozen base per wave.** All agents branch from the same `main`
   commit. Announce merges so everyone re-bases deliberately rather
   than drifting.
2. **One issue -> one branch -> one PR.** `Closes #N` in the body.
   Small PRs, opened as soon as the golden path works, not when the
   slice is elegant.
3. **Serialized merge queue.** The owner merges **one at a time** and
   confirms the demo path still runs before taking the next. Parallel
   merges are how two clean PRs produce a broken `main`.
4. **On merge, the merger posts one `SYNC` line on the hub.** That is
   the rebase signal for four other agents. This single line is worth
   more than every STATUS in the protocol.
5. **Kernel files get an owner, not a lock.** Name the 3-5 files
   several slices touch (shell store, tool-protocol types, VFS
   interface) in the hub issue. One agent owns each for the sprint;
   everyone else requests a change via `PROPOSE` on the contract
   issue. Cheaper than negotiating each edit.
6. **T-45: feature freeze.** Nothing new starts. T-30: merge freeze —
   unmerged work does not ship. T-20 to T-0: demo rehearsal and
   submission text only. **This checkpoint is worth its cost**: with
   five streams and 5-10 minutes of behavioral verification per merge,
   the integration tail alone needs 25-50 minutes of runway.

## 7. Written down vs. said aloud

The rule, one sentence:

> **Write it if an agent must act on it. Say it if only a human must.**

The operative test an agent or human can apply in two seconds:

> *"Would an agent that was not in the room produce wrong code without
> this?"* If yes, it goes on the issue **before** the conversation
> ends.

**Must be written (to the issue, by whoever decided it):**

- Any interface, signature, file path, or data shape.
- Any scope cut, priority change, or "we're not doing X."
- Any resolution of a `needs-human` question.
- Any claim, release, or reassignment of work.
- Any decision that contradicts an ADR.

**Stays verbal:**

- Debugging hints, encouragement, "try turning it off and on."
- Status a human already heard ("I'm 10 minutes out").
- Anything about the room, the food, the demo order.

**The corollary that makes it work:** when a human decides something
across the table, the *deciding human's agent* writes it up
immediately — one comment, right then. A decision that lives only in
the air is a decision four agents will violate.

## 8. Proposed v1.1 diff

### ADD

- `## Agreed` may hold a **provisional** contract, marked
  `(provisional, binding at <ISO time>)`, written by the proposer at
  `PROPOSE` time. Build against it immediately.
- **Auto-accept rule:** a `PROPOSE` un-countered for
  `COORD_PROPOSE_MIN` (default 15) minutes is binding.
- **Two-stage stale ladder:** `COORD_STALE_WARN_MIN` (20) then
  `COORD_STALE_GRACE_MIN` (10). `stale` lists warn-stage and
  release-stage separately; `release --stale` refuses unless a
  `QUESTION` ping exists and the grace window has passed.
- **`ASSUMED` verb.** After `COORD_HUMAN_ACK_MIN` (10) minutes with
  `needs-human` unanswered, the agent posts `ASSUMED` with the
  reversible choice it made and continues.
- **Escalation duty:** any command that applies `needs-human` prints a
  loud, quotable line to the agent's own terminal for the human to
  **read aloud**. Co-location is the fastest notification channel the
  team has and the protocol currently ignores it.
- **Identity rule** in `protocol.md`: parsers key on `.author.login`;
  the `agent:` header field is advisory metadata only.
- **Kernel-file registry** section in the hub issue body.
- **Anti-theater rule** in the working agreements: more protocol
  comments than commits in 30 minutes means stop coordinating.

### CHANGE

- **Fix the negotiation-cap contradiction.** `SKILL.md` ("two
  unresolved rounds") and `protocol.md` ("the fourth
  PROPOSE/COUNTER") disagree. Set both to: **`PROPOSE` -> `COUNTER` ->
  `needs-human`** (`COORD_NEGOTIATION_MAX=2` messages).
- `COORD_STALE_MIN=45` -> the two-stage ladder above.
- Claim limit 2 -> **1 active + 1 blocked**.
- "`STATUS` roughly every 30 minutes" -> **"at every milestone; never
  more than 20 minutes silent."**
- "built only after `ACCEPT`" -> **"declared before it is written;
  built immediately; binding when un-countered."** (Sprint mode. Full
  protocol keeps `ACCEPT` as a gate.)
- `DONE` requires a **merged** PR URL and all `## Done when` boxes
  ticked. Currently `pr:` is optional-ish in practice.
- Add the Kleppmann sentence to the stale tie-break: *"Release is a
  coordination signal, not a code lock. The git branch is the fence."*
- Canonicalise the comment regex. `protocol.md` uses
  `startswith("**CLAIM**")` in one place and
  `test("^\\*\\*(...)\\*\\*")` in another. Use the anchored regex
  everywhere and state that **the header must be the comment's first
  line**.
- Portable timestamps in the no-bash fallback: `date -u
  +%Y-%m-%dT%H:%M:%SZ` (the `%FT%TZ` shorthand is not portable across
  BSD/GNU `date`).

### REMOVE (sprint mode only; restore for the full protocol)

- `--eta` on `claim`.
- `ACCEPT` / `REJECT` as required steps (keep `ACCEPT` as an optional
  fast confirmation).
- `DEP-DONE`, `HANDOFF`, `UNBLOCKED`.
- `type:decision`.
- The `status:claimed` vs `status:in-progress` distinction — one
  `status:claimed`; the assignee field is the real state.
- Mandatory hub `SYNC` at every milestone; keep it at session start
  and on merge.

## 9. Assessment, surprises, open questions

### Verdict

**Yes, with roughly half the ceremony.** Issues + `gh` is correct and
not merely tolerable: it is the only channel all five agents already
have, it is durable, it survives a session restart, and GitHub's own
coding agent is built on the same primitive. The skeptic's case —
"five people at one table should just talk" — is **wrong for this
team for one specific reason**: the agents cannot hear the table. Any
decision made verbally is invisible to four of the five workers.
Issues is not overhead here; it is the only write channel into the
agents' shared world.

But v1 is sized for a day. The parts that *block* an agent — ACCEPT
before code, four-round negotiation, a 45-minute claim hold — cost
real sprint minutes. The parts that merely *write* cost almost
nothing and should be kept.

**Confidence: medium-high on the shape, low-medium on the numbers.**
The structural recommendations (declare-and-proceed, two-stage stale
ladder, verification over negotiation, git-as-fence) rest on primary
sources — MAST, GitHub's docs, Zulipbot, Kleppmann. The specific
values (20/10, 15, 10, one round) rest on **analogy** from distributed
locking, Kanban, incident response, and OSS claim bots. No one has
measured these for LLM agent teams on a deadline. Adopt them as
defaults to be revised, not as findings.

**What would change my conclusion:** evidence that heterogeneous
agents reliably fail to parse the bold-verb header (would push toward
issue *body* state rather than comments); or a measured result that
declare-and-proceed produces more rework than blocking ACCEPT saves in
idle time (would restore the gate).

### Surprising / non-obvious findings

1. **Ceremony cost is concentrated in waiting, not writing.** The
   intuitive cut — "post fewer comments" — targets the cheap thing.
   The expensive thing is any rule that makes an agent stop.
2. **The protocol's own evidence base points away from its biggest
   investment.** Two of MAST's three failure categories are
   specification and verification. v1 spends eight verbs on
   negotiation and gives specification one optional template heading.
3. **Assignment-as-lock is a lease with no fencing token.** The team
   correctly sensed the stale-release problem but diagnosed it as a
   trust issue; it is really a *layering* issue. Once you say "the
   branch is the fence," the stale timer stops being scary and can be
   made aggressive.
4. **There is no production precedent for what the team is building.**
   Copilot coding agent is one agent per issue, fenced, never
   negotiating. Agent-to-agent negotiation over Issues appears to be
   genuinely novel — which is a reason to keep it small today and a
   reason it is interesting after the hackathon.
5. **Co-location is an unexploited channel in the protocol.** The
   fastest escalation path in the room is a human saying a sentence
   out loud, and v1 routes escalation entirely through a label nobody
   is watching.

### Open questions

- Does every teammate's harness preserve the exact comment body
  (leading whitespace, bold markers) when posting via `gh`? Worth a
  30-second test with one comment per agent before relying on parsing.
- Is the repo owner a merge bottleneck at five streams? If merges
  queue behind one person, the serialized merge queue becomes the
  critical path and T-30 should move earlier.

## 10. Sources

| Source | Type | Reliability note |
|---|---|---|
| [MAST — Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) | Primary (paper) | Strongest single source here: 1,600+ traces, 7 frameworks, kappa 0.88. Abstract fetched directly. |
| [GitHub Copilot coding agent docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/coding-agent) | Primary (vendor) | Authoritative for the substrate; describes one-agent-per-issue only. |
| [Zulipbot / opendatakit-bot claim workflow](https://forum.getodk.org/t/fine-grained-permissions-for-github-issues-self-assign-labels/9352) | Primary practitioner | Real deployed OSS claim bot; the 7-day/3-day quote is verbatim. Small-N precedent. |
| [Kleppmann, How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) | Authoritative practitioner | The canonical statement that lease expiry != holder death; fencing tokens. Transfers by analogy. |
| [Autonoma — 5 ways to stop parallel AI agent PRs](https://getautonoma.com/blog/parallel-ai-agent-prs) | Practitioner (vendor blog) | Vendor-adjacent, so discount the product pitch; the disjoint-file-sets and serialized-merge advice is corroborated elsewhere. |
| [When Two Agents Work the Same PR](https://nivedv.medium.com/when-two-agents-work-the-same-pr-multi-agent-orchestration-in-github-fb77f38b3d95) | Practitioner | Names four concrete GitHub multi-agent failure modes; 403'd on direct fetch, read via search excerpt — **rung 5, treat as illustrative**. |
| [I Let AI Agents Manage Themselves with a Markdown File](https://dev.to/battyterm/i-let-ai-agents-manage-themselves-with-a-markdown-file-5547) | Practitioner | Useful skeptic input: claims ~80% of parallel coding tasks need only a board + claim + tests + git, and that negotiation layers are over-built for the other 20%. Single-author estimate, unmeasured. |
| [Open source labeling best practices](https://dosu.dev/blog/open-source-labeling-best-practices) | Practitioner | Label-family taxonomy (type/status/priority/area) corroborating v1's schema shape. |
| [LabelOps / IssueOps — GitHub](https://github.blog/engineering/issueops-automate-ci-cd-and-more-with-github-issues-and-actions/) | Primary (vendor) | Confirms labels-as-finite-state-machine is a sanctioned GitHub pattern, not an anti-pattern — with the caveat to separate "state" labels from "command" labels. |
| [Ticket or Talk?](https://product-copilot.ai/blog/when-to-write-a-ticket) | Practitioner | Weak source; used only for the written-vs-verbal trade-off framing. |

---

## Appendix A — Cross-harness parsability and identity

This is sub-question (b). Three rules, all cheap.

### A1. Identity: trust the API author, not the header

Two teammates running the same model produce the same `agent:` string.
The header field is **self-declared** — it is typed by the agent into a
comment body, so it can be copy-pasted, stale, or simply wrong.

> **Rule: all protocol logic keys on `.author.login` (GitHub's own
> comment author). The `agent:` field is advisory metadata for humans
> reading the thread.**

This matters concretely for the claim race: the tie-break is "earliest
`CLAIM`," and the winner must be identified by the GitHub account that
posted it, because that is the same identity the assignee field uses.
Keeping `agent:` in the header is still worth it — it tells a human
*which harness* produced a bad proposal — but nothing should branch on
it. Where two agents share one human login, add an optional
`session:` suffix; do not overload `agent:`.

### A2. Parsing: one anchored regex, header on line 1

v1 uses two different matchers in the same document —
`startswith("**CLAIM**")` and `test("^\\*\\*(CLAIM|...)\\*\\*")`.
Standardize on the anchored regex, and state the invariant explicitly:

> **The header must be the first line of the comment.** A comment whose
> first line is not a verb header is not a protocol comment and is
> ignored by every parser.

That invariant is what makes `startswith`-class matching safe across
harnesses that might otherwise prepend a preamble ("Sure, I'll post
that update:"). It is also the cheapest possible spec — one sentence,
and any agent can comply without a script.

### A3. The no-bash fallback needs portable dates

`date -u +%FT%TZ` in v1's fallback snippet is **not portable** — `%F`
and `%T` are GNU extensions that BSD/macOS `date` does not reliably
expand in all builds. Use the explicit form:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
```

An agent that cannot run bash at all can hardcode an approximate
timestamp; the protocol should say that a slightly wrong `at:` is
acceptable because **`createdAt` from the API is the authoritative
time**, exactly as `.author.login` is the authoritative identity. Both
header fields are for human readability; the API is the source of
truth. This is the single most important robustness property for a
heterogeneous fleet — it means a malformed header degrades the
comment's readability, never the protocol's correctness.

## Appendix B — `gh` and `gh --jq` recipes

Field names below follow `gh`'s issue JSON schema. Where marked
**(verify)**, run it once before relying on it — a wrong field name
fails loudly, so this costs seconds.

### B1. The board: unclaimed p0 work in my workstream

```bash
gh issue list --state open --label p0 --label ws:os-shell \
  --json number,title,assignees,labels \
  --jq '.[] | select(.assignees | length == 0)
        | "#\(.number) \(.title)"'
```

### B2. What do I hold? (the WIP check)

```bash
gh issue list --state open --assignee @me \
  --json number,title,labels \
  --jq '.[] | "#\(.number) \(.title) [\([.labels[].name] | join(","))]"'
```

More than one non-blocked row here means you are over the claim limit.

### B3. Last heartbeat on an issue (drives the stale ladder)

```bash
gh issue view 12 --json comments --jq '
  [ .comments[]
    | select(.body | test("^\\*\\*(CLAIM|STATUS|UNBLOCKED|HANDOFF)\\*\\*"))
    | .createdAt ] | max'
```

`gh issue view --json comments` exposes `author`, `body`, `createdAt`
per comment. **(verify `author.login` nesting once.)**

### B4. Stale sweep across the whole board

```bash
# All open assigned issues with their last update time
gh issue list --state open --json number,title,assignees,updatedAt \
  --jq '.[] | select(.assignees | length > 0)
        | "\(.updatedAt) #\(.number) \(.assignees[0].login) \(.title)"' \
  | sort
```

`updatedAt` is a cheap proxy for the heartbeat and needs no per-issue
fetch — use it for the sweep, then use B3 on the few candidates. This
matters for rate limits: one list call instead of N view calls.

### B5. Open proposals on a contract issue (and the round count)

```bash
gh issue view 15 --json comments --jq '
  [ .comments[]
    | select(.body | test("^\\*\\*(PROPOSE|COUNTER)\\*\\*")) ] as $n
  | "rounds: \($n | length)",
    ( $n[] | "\(.createdAt) \(.author.login)\n\(.body)\n" )'
```

If `rounds` reaches 2, stop and apply `needs-human`.

### B6. Everything a human must look at, right now

```bash
gh issue list --state open --label needs-human \
  --json number,title,updatedAt \
  --jq '.[] | "#\(.number) \(.title) (since \(.updatedAt))"'
```

### B7. File-overlap check before editing a shared path

```bash
# Who else has declared a glob touching the shell store?
gh issue list --state open --json number,title,body,assignees \
  --jq '.[] | select(.body | test("app/features/os"))
        | "#\(.number) \(.title) -> \(.assignees[0].login // "unclaimed")"'
```

This is the `## Files` payoff and it is a single call. Run it before
opening any kernel file.

### B8. Claim by hand (no bash / no script)

```bash
gh issue comment 12 --body "**CLAIM** | agent: pi/1 | human: @you | at: $(date -u +%Y-%m-%dT%H:%M:%SZ)

plan: useDraggable on WindowFrame"
gh issue edit 12 --add-assignee @me --add-label status:claimed \
  --remove-label status:unclaimed
```

### B9. Rate-limit hygiene

Authenticated REST is generous (thousands of requests/hour), and five
agents doing event-driven posts will not approach it. The risk is a
**polling loop**, not normal use. Rule: `sync` at session start and on
merge only — never in a `while` loop. If an agent wants to know when
something changes, it should ask its human, who can see the table.

```bash
gh api rate_limit --jq '.rate | "\(.remaining)/\(.limit)"'
```

## Appendix C — Anti-patterns, and how to spot them on the board

| Anti-pattern | What it looks like | Board query |
|---|---|---|
| **Protocol theater** | Long, well-formed comment threads; few commits | Compare `gh issue view N --json comments` length against the PR diff |
| **Zombie claim** | Assigned, `updatedAt` old, no PR | B4 sweep |
| **Ghost work** | A PR arrives touching files no open issue declared | B7 against the PR's changed files |
| **Contract drift** | Code merged whose signature differs from `## Agreed` | Grep the merged signature against the contract issue body |
| **Label rot** | `status:in-progress` on a closed-in-spirit issue; two status labels at once | `gh issue list --json number,labels --jq '.[] \| select([.labels[].name \| select(startswith("status:"))] \| length > 1)'` |
| **Escalation black hole** | `needs-human` older than 10 min | B6 with an age filter |
| **Negotiation spiral** | 3+ PROPOSE/COUNTER on one issue | B5 round count |
| **Over-claiming** | One login on 2+ active issues | B2 per teammate |

Two structural notes on the label schema, since the question asked
whether labels-as-state-machine is an anti-pattern:

- **It is not an anti-pattern** — GitHub's own IssueOps guidance
  explicitly recommends modelling issue workflows as a finite-state
  machine driven by labels. The sanctioned caution is to keep
  *state* labels (a property of the issue) distinct from *command*
  labels (do this now). v1 is clean on that axis: all its labels are
  state or classification, none are commands.
- **The real risk is duplicate state.** `status:claimed` /
  `status:in-progress` duplicate a fact the **assignee field already
  holds**, and any duplicated state drifts. That is the argument for
  collapsing them in sprint mode, not a general objection to labels.

## Appendix D — Where the evidence is thin

Stated plainly, as the brief requires:

1. **Every parameter value is analogy.** Distributed-lock leases,
   Kanban WIP, incident escalation, and OSS claim bots are all *human
   or machine* systems with different failure distributions than LLM
   agents. The *shapes* (two-stage ladder, hard round cap, WIP of one,
   timed escalation) are well supported. The *numbers* are scaled
   guesses that happen to be internally consistent.
2. **Agent-to-agent negotiation over Issues has no precedent.** The
   closest production system (Copilot coding agent) deliberately does
   not do it. Everything said about `PROPOSE`/`COUNTER` is design
   reasoning informed by CAMEL-style role-play failure modes, not
   observation of this exact pattern.
3. **"Ceremony cost is concentrated in waiting" is my analysis, not a
   cited finding.** It follows from the observation that agents are
   single-threaded and turn-based, but no source measures it.
4. **The 80/20 claim** (most parallel coding tasks need only board +
   claim + tests + git) comes from one practitioner's estimate. It is
   directionally consistent with the disjoint-file-sets consensus but
   is not a measurement.
5. **Not verified:** whether each teammate's harness preserves comment
   bodies byte-for-byte through `gh`. One 30-second test per agent
   would move the parsing rules from rung 5 to rung 1.
