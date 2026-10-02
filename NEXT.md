---
type: Roadmap
title: DOMinic Post-Hackathon Roadmap
description: The sequenced roadmap from hackathon demo to a self-hostable product that safely runs untrusted agent-authored code, with named lanes for each collaborator.
tags: [roadmap, future, roles]
generated: { by: claude-code/claude-fable-5.1, at: 2026-10-02T00:00:00Z }
verified: { by: human:brandon, at: 2026-10-02T00:00:00Z }
sources:
  - id: adrs
    resource: docs/adrs/README.md
    title: Architecture decision records 0000-0011
  - id: questions
    resource: QUESTIONS.md
    title: Open questions register
  - id: judges
    resource: docs/JUDGES.md
    title: Judge-facing walkthrough (what is real vs deferred)
  - id: playbook
    resource: docs/agents/coordination-best-practices-3.md
    title: Coordination best practices v3
---

# DOMinic: Post-Hackathon Roadmap (NEXT)

The hackathon proof of concept shipped the whole core loop: describe an
app, it is written, compiled in the browser, installed to the taskbar,
kept across reloads, updated in place, and repaired when it crashes.
This document sequences everything deliberately deferred from that POC
into phases with dependencies, exit criteria, and owners.

It replaces the unordered inventory from hackathon day. Every item from
that list is still here (see the index at the end); eight new items were
added where the shipped code showed a gap the list did not name.

## North star

**From a trusted-user demo to a self-hostable product that can safely
run untrusted agent-authored code.**

DOMinic is AGPL-licensed and meant to be hosted. What is unsafe today is
LLM output running inside the host page with full DOM and `localStorage`
access, behind a server that falls back to its own API keys. Everything
else on this list is a feature; the order below exists to close that gap
first without breaking the loop that already works.

## Sequencing principles

1. **Tests before rewrites.** The repository has no automated tests. Two
   of the largest items (async VFS, sandboxed runner) rewrite the seams
   everything else hangs on. The regression net comes first.
2. **Change a seam before more callers depend on it.** The VFS and the
   runner each have about four callers today. Every feature built on the
   current shape is rework after the seam changes.
3. **The trust boundary ships as one unit.** CSP, the sandbox, and
   dependency vetting only mean something together. Vetting without
   isolation is theatre; isolation without CSP still lets a package
   exfiltrate through `fetch`.

## Phase 0 - Stabilize the floor

All six steps are independent; fan them out. Roughly one week of
part-time work across the team.

| Step | Work | Why here | Owner |
| --- | --- | --- | --- |
| 0.1 | Playwright end-to-end test of the core loop using the existing `window.__dominic` hooks: `installFixture` -> reload -> `updateApp` -> `injectBrokenApp` -> Ask Agent to Fix. Gate it in CI. | The net under Phases 1-2. The hooks are a harness waiting for a runner. | Michael |
| 0.2 | Remove the server env-var API-key fallback in `server/api/chat.post.ts`; return 401 without a per-request key. | ADR 0005 conformance. Five lines; the only server-side hole. | Charles |
| 0.3 | Baseline Content Security Policy: `script-src 'self' esm.sh cdn.tailwindcss.com`; `connect-src` = self + provider hosts + esm.sh. | Config-only. The Tailwind Play CDN needs `'unsafe-inline'`; accepted for now (decision D1). | Zack |
| 0.4 | ESLint flat config with a slice-boundary rule, plus lint-staged running `vue-tsc` on staged files in pre-commit. | ADR 0002 as decided. Turns "boundaries by convention" into a lint. | Zack |
| 0.5 | Truth pass: correct the README's mobile and "vetted CDN" claims; write ADR 0012 superseding ADR 0001 and 0003 to record the five-slice layout and mixed store style (decision D2). | Judges and contributors read the ADRs; drift costs trust. | Michael (README), Brandon (ADR 0012) |
| 0.6 | Dead code: delete the unused `useChatStore`; make `useAppsStore` the registry's reactive face or delete the mirror. | Two sources of truth for "installed apps" is a latent bug. | Justin |

**Exit:** CI runs lint, typecheck, build, and e2e, all green; no key is
ever read from the environment; the ADRs match the code.

## Phase 1 - Harden the two seams

Sequential within the phase; one owner so two people are never inside
the same seam. Roughly two to three weeks.

| Step | Work | Why here | Owner |
| --- | --- | --- | --- |
| 1.1 | Async `VirtualFileSystem` interface plus a driver registry, as ADR 0007 originally decided: `/system/*` on localStorage, `/apps/*` on IndexedDB, with a one-time migration of existing localStorage data. | Breaking interface change; cheapest while the callers are `app.vue`, `registry.ts`, `settings.ts`, and the runner. Unblocks snapshots, window persistence, bigger apps. | Charles |
| 1.2 | Sandboxed runner: compile in the host, mount in a `sandbox="allow-scripts"` iframe via `srcdoc`, with a `postMessage` bridge contract for props, `askFix`, and later IPC. Record it as ADR 0013. | The single biggest safety gap. Doing it before IPC and notifications means those are built on the bridge once, not twice. | Charles |
| 1.3 | Dependency vetting gate in front of esm.sh: npm registry and advisory data, age, downloads, known CVEs; verdicts cached in the VFS; refusals surfaced with reasons. Completes ADR 0008 as ADR 0014. | Only meaningful once 1.2 exists. | Charles |
| 1.4 | Tighten CSP to the sandbox model: the host page drops esm.sh; only the iframe origin may load it. Revisit the Play CDN here. | Closes the loop opened in 0.3. | Zack |

**Exit:** an app that reaches for `parent.document` or the host's
`localStorage` fails; a known-bad package is refused with its reasons
shown; the Phase 0 e2e suite is still green.

## Phase 2 - The agent product loop

Builds on the hardened base. Roughly two to three weeks.

| Step | Work | Why here | Owner |
| --- | --- | --- | --- |
| 2.1 | Diff approval before `update_app` mounts: a unified diff in the chat thread with approve/reject; the source-context injection shipped in the sprint is the input. | Safe to add UI now that the runner contract is stable. | Justin |
| 2.2 | Bounded auto-heal: on a caught error, re-invoke the agent with the trace up to two times, with a visible "agent fixed it" trail. Builds on the Recover beat. | Turns the demo's best moment into default behaviour. | Justin |
| 2.3 | Tool results back to the model: today each turn is one-shot; let the model see whether install or update succeeded (`maxSteps` is already 3). | Required for 2.2 to be reliable. | Charles |
| 2.4 | Notification center and app-to-app IPC on the Phase 1 `postMessage` bridge: one contract, two consumers. | Built once, on the sandbox bridge. | Justin (consumers), Charles (bridge) |
| 2.5 | Window-state persistence across reloads (QUESTIONS Q4.1), now that the VFS is IndexedDB-backed. | Was deferred for layout-glitch risk under demo conditions; no longer applies. | Zack |

**Exit:** every update is reviewable before it mounts; a crash self-heals
within two tries; a timer app can notify a todo app.

## Phase 3 - Reach

A parallel UX track plus far-horizon items. Step 3.1 has no coupling to
the seams and may start during Phase 1.

| Step | Work | Owner |
| --- | --- | --- |
| 3.1 | Mobile responsive shell: bottom-sheet taskbar and stacked windows below 768px, as ADR 0004 designed. | Zack |
| 3.2 | Window snapping and tiling; multi-desktop workspaces. | Zack |
| 3.3 | `/api/proxy` shipped together with its SSRF blocklist (RFC 1918, cloud metadata endpoints) - never one without the other - plus a `useSmartFetch` direct-then-proxy fallback. Only when an app needs a non-CORS API. Record as ADR 0015. | Charles |
| 3.4 | Snapshot export and import of the whole OS state; File System Access API mount of a local directory. | Justin |
| 3.5 | Multi-tab sync via `BroadcastChannel` (ADR 0003's deferred item). | Justin |
| 3.6 | Agent-generated unit tests verified in-browser before install. After 2.3, which it depends on. | Charles |
| 3.7 | P2P app sharing via WebRTC or QR codes. Far horizon; kept, not scheduled. | - |

## Cross-cutting

- **Every step is one issue.** Open it with `## Files` and
  `## Done when` before writing code; claim it with a branch name.
- **Every changed decision is a new ADR**, never an edit to an old one:
  0012 (slices and stores), 0013 (sandbox bridge), 0014 (vetting gate),
  0015 (proxy).
- **The e2e suite from 0.1 is the definition of "still works."** A PR
  that turns it red does not merge, whatever else it does.

## Roles and working agreement

These roles apply whenever two or more people are active on the
repository at once. Solo work follows the same issue -> PR -> merge loop
without the review rotation. Lanes follow the merged-PR record from the
sprint, so each person owns what they already know.

### Lanes

| Person | Lane | Owns (paths) | Roadmap steps |
| --- | --- | --- | --- |
| Zack (`xcjs`) | Platform and shell | `app/features/os/**`, `nuxt.config.ts`, `tsconfig.json`, `.github/**`, `package.json`, `.husky/**` | 0.3, 0.4, 1.4, 2.5, 3.1, 3.2 |
| Charles (`Sullux`) | Runtime, persistence, and the chat route | `app/features/apps/runner/**`, `app/features/apps/registry/**`, `app/features/shared/vfs.ts`, `server/api/**` | 0.2, 1.1, 1.2, 1.3, 2.3, 3.3, 3.6 |
| Justin (`ImNewToC0de`) | Integration and the agent product loop | `app/app.vue`, `app/features/chat/**`, `app/features/apps/stores/**`, `app/features/settings/**` | 0.6, 2.1, 2.2, 2.4, 3.4, 3.5 |
| Michael (`m-vawter`) | Quality, docs, and process | `tests/**`, `README.md`, `docs/agents/**`, `docs/JUDGES.md`, board hygiene | 0.1, 0.5 (README), the e2e gate, release notes |
| Brandon (`r0073d-l053r`) | Coordination, security review, and this roadmap | `.claude/skills/coordinate/**`, `NEXT.md`, `docs/adrs/**` (new ADRs), the knowledge-base vault | 0.5 (ADR 0012), second reviewer on 1.2-1.4, retrospectives |

A path not listed belongs to whoever opens the issue that first touches
it; add it to this table in the same PR.

### Not stepping on each other

- **One owner per path.** A PR that touches another lane's files needs
  that lane's owner as a reviewer. If two issues would touch the same
  file at the same time, the second claimant records a split or a
  common owner on the issue before starting.
- **One seam, one person.** Phase 1 steps are sequential and all in
  Charles's lane. Nobody else edits `vfs.ts` or the runner while 1.1-1.3
  are open; they work Phase 0 or 3.1 in the meantime.
- **One issue in progress per person**, at most one blocked; queued work
  stays `status:claimed`. Silence longer than six hours on an active
  claim earns a ping; release only after three more hours unanswered.
- **Agents identify themselves.** Every protocol comment carries the
  `agent:` and `human:` fields; a person running two sessions suffixes
  the agent id so the record shows who did what.

### Issues, PRs, and merging - the loop everyone runs

1. **Issue first.** `coord.sh new` with the step number in the title,
   `## Files` naming the exact globs, and `## Done when` copied from the
   phase exit criteria it serves. Claim with the branch name.
2. **Single-purpose PRs**, ideally under 300 changed lines, one step per
   PR, `Closes #N` in the body. The PR diff must stay inside the union of
   its linked issues' `## Files`; if it grew, update the issue first.
3. **Review within two days** (part-time cadence). Default reviewer is
   the owner of every lane the diff touches; the author adds a second
   reviewer for Phase 1 and any ADR. Approve only after checking out the
   branch or reading the e2e result, not the description.
4. **Merge is distributed**, as the v3 playbook decided: any non-author
   approver may squash-merge once CI (lint, typecheck, build, e2e) is
   green. Authors never self-merge; branch protection enforces one
   non-author approval. Zack is the tiebreaker on disagreements.
5. **Done means merged.** `coord.sh done` only with the merged PR URL and
   every `## Done when` box checked. Then one `SYNC` line on the hub:
   what landed, what it unblocks.
6. **Weekly rhythm.** Each person posts one `SYNC` per week at minimum,
   even if it says "nothing this week"; the board is read before any
   new claim. Michael pings stale claims; Brandon runs a short retro at
   each phase exit and amends this document.

### Reviewer rotation

| Author | Default reviewer | Second reviewer (Phase 1, ADRs) |
| --- | --- | --- |
| Zack | Charles | Brandon |
| Charles | Zack | Brandon |
| Justin | Charles | Zack |
| Michael | Brandon | Zack |
| Brandon | Michael | Zack |

## Decisions taken

- **D1 - Tailwind Play CDN:** keep it through Phase 0 (the CSP carries
  `'unsafe-inline'`); replace with a safelist or iframe-local JIT at 1.4.
- **D2 - ADRs 0001 and 0003:** amend the records to match the code (five
  slices, mixed store styles) in ADR 0012; do not refactor the code.
- **D3 - North star:** self-hostable product, not a personal tool.
- **D4 - Cadence:** part-time; Phases 0 -> 1 -> 2 run in order, with
  3.1 as a parallel track from the start.

## Index of the original inventory

| Original item | Now |
| --- | --- |
| Sandboxed iframe execution | 1.2 |
| Automated npm dependency vetting gate | 1.3 |
| Content Security Policy | 0.3, tightened at 1.4 |
| Server proxy SSRF hardening | 3.3 (ships with the proxy) |
| Mobile-first responsive shell | 3.1 |
| Window snapping and tiling | 3.2 |
| Multi-desktop workspaces | 3.2 |
| System notification center | 2.4 |
| Pluggable multi-driver VFS | 1.1 |
| File System Access API integration | 3.4 |
| Snapshot export and import | 3.4 |
| Interactive code diff approval | 2.1 |
| Error auto-healing loop | 2.2 |
| App-to-app IPC | 2.4 |
| P2P app sharing | 3.7 |
| Type-checked pre-commit | 0.4 |
| Agent-generated component tests | 3.6 |

New since the inventory: 0.1 e2e tests, 0.2 env-key fallback removal,
0.5 truth pass and ADR 0012, 0.6 dead stores, 2.3 tool results back to
the model, 2.5 window-state persistence, 3.5 multi-tab sync, and the
`useSmartFetch` half of 3.3.
