---
type: Architecture Decision Record
title: End of the hackathon scope
description: The one-afternoon POC scoping that narrowed every ADR to a golden path is over; the full decisions are the target again, the as-built baseline is accepted, and NEXT.md governs what comes next.
status: accepted
tags: [architecture, process, scope]
generated: { by: claude-code/claude-fable-5.1, at: 2026-10-02T00:00:00Z }
verified: { by: human:brandon, at: 2026-10-02T00:00:00Z }
---

# End of the hackathon scope

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0012 | accepted | 2026-10-02 | Brandon; lane owners by review |

## Technical Story

On hackathon day (2026-09-12) every accepted ADR from 0001 to 0010 was
amended with a "Hackathon POC (Golden Path)" subsection that narrowed its
decision to what five engineers could ship in one afternoon, a "Future /
Out of Scope for POC" subsection that parked the rest, and an "Open
Questions" subsection. `QUESTIONS.md` recorded POC-only recommendations,
`README.md` described the team as five hackathon workstreams, and the
coordination protocol ran in sprint mode (20-minute pings, 30-minute
releases). That scoping did its job: the core loop shipped. It is the
wrong frame for a project that continues.

## Context and Problem Statement

The narrowing was never a decision about the product; it was a decision
about one afternoon. Left in force, a contributor reading ADR 0007
believes "localStorage only" is the architecture rather than a sprint
cut, and an agent reading the coordination skill releases a teammate's
claim after thirty minutes of an ordinary working day. Which limits are
lifted, which as-built divergences are accepted as the new baseline, and
where the deferred work now lives all need one record.

## Decision Drivers

- The ADRs are immutable history; the POC subsections cannot be deleted,
  so their standing has to change through a superseding record.
- The code on `main` already diverges from two decisions in ways that are
  fine and not worth refactoring.
- The roadmap in `NEXT.md` needs a single point that says the "future"
  items are in scope again and in what order.
- Multi-day, part-time collaboration needs the full coordination protocol
  that the v3 playbook already specified.

## Considered Options

- Edit the POC subsections out of each ADR
- Mark ADRs 0001-0010 superseded wholesale and rewrite them
- One superseding ADR that ends the scoping and accepts the baseline

## Decision Outcome

Chosen option: **one superseding ADR that ends the scoping and accepts
the as-built baseline**, because it keeps the record immutable, names
exactly what changes, and leaves the original decisions in force.

With effect from this record:

1. **The golden paths are historical.** The "Hackathon POC (Golden
   Path)" and "Future / Out of Scope for POC" subsections of ADRs
   0001-0010 describe the sprint, not the target. Each record's full
   "Decision Outcome" is the target again. Nothing listed as "future" is
   out of scope; `NEXT.md` sequences it.
2. **The as-built baseline is accepted where it diverges.** Two
   divergences recorded in the "As built (2026-09-12)" subsections are
   adopted as decisions rather than debts:
   - ADR 0001: the slice layout is `os`, `chat`, `apps`, `settings`, and
     `shared` under `app/features/`, with `shared` as the kernel. This
     supersedes the record's `os/agent/apps` naming and its `app/shared/`
     location.
   - ADR 0003: stores may use setup or option syntax, and the app
     registry's state lives in a module-level ref under `apps/registry/`
     rather than a Pinia store. The "one setup store per slice" bullet is
     superseded.

   Every other divergence (no ESLint, no sandbox, no vetting gate, a
   single VFS driver, no proxy, the env-key fallback, the missing
   `{windowId, appId}` props) remains a gap that `NEXT.md` schedules.
3. **Open questions become outcomes.** `QUESTIONS.md` keeps its history
   and gains a status table: each POC recommendation is marked
   implemented, reopened by the roadmap, or no longer applicable.
4. **Coordination runs the full protocol.** Sprint mode is off. Stale
   claims use a six-hour warning and a three-hour grace during active
   workdays, paused overnight (`COORD_STALE_MIN` defaults to 360);
   `STATUS` is event-driven with a 60-minute active-work ceiling; shared
   contracts need an explicit `ACCEPT` before they merge; `HANDOFF` is
   mandatory when ownership crosses a session. Lanes, path ownership, and
   the reviewer rotation are defined in `NEXT.md`.
5. **Labels lose their demo wording.** `p0` means the critical path of
   the current roadmap phase; `ws:*` descriptions name slices and lanes,
   not SDE numbers.

### Confirmation

A new contributor who reads only `README.md`, `NEXT.md`, and this record
can state what the target architecture is, which divergences are
accepted, and how to claim work, without reading any golden-path
subsection. Both coordination helpers default the stale window to 360
minutes, and the repository labels carry the new descriptions.

## Pros and Cons of the Options

### One superseding ADR that ends the scoping and accepts the baseline

- ✅ Good, because the record stays immutable and auditable.
- ✅ Good, because one document answers "is X still out of scope?".
- ❌ Bad, because readers of 0001-0010 must know to look here; the index
  in `docs/adrs/README.md` points them.

### Edit the POC subsections out of each ADR

- ✅ Good, because each record would read cleanly on its own.
- ❌ Bad, because it rewrites accepted history, which ADR 0000 forbids.

### Mark ADRs 0001-0010 superseded wholesale and rewrite them

- ✅ Good, because the new set would describe the target directly.
- ❌ Bad, because the original decisions are still correct; only the
  afternoon-sized scoping was temporary. Ten rewrites for two changed
  bullets is churn without information.

## Links

- Supersedes the golden-path scoping of ADRs 0001 through 0010; amends
  [ADR 0001](0001-feature-slices-with-domain-driven-organization.md) and
  [ADR 0003](0003-pinia-per-domain-stores.md) as stated above
- Sequenced next by [NEXT.md](../../NEXT.md)
- Coordination parameters from
  [coordination best practices v3](../agents/coordination-best-practices-3.md)
