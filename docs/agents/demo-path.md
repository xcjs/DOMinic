---
type: playbook
title: Demo Path — What the Judges Must See
description: The two-minute demo as an ordered set of beats, each mapped to a judging criterion and to the Hackathon POC golden path the team has already committed to build.
tags: [hackathon, demo, video, submission]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T17:55:00Z }
verified: { by: human:michael, at: 2026-09-12T17:55:00Z }
stale_after: 2026-09-12T20:00:00Z
sources:
  - id: rubric
    resource: rubric.md
    title: How We Win — Judging Rubric and Strategy
  - id: adr-0006
    resource: ../adrs/0006-agent-authored-runtime-compiled-components.md
    title: ADR 0006 — Agent-authored runtime-compiled components
  - id: adr-0007
    resource: ../adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md
    title: ADR 0007 — Virtual filesystem with pluggable storage drivers
  - id: adr-0010
    resource: ../adrs/0010-agent-app-interface-and-tool-protocol.md
    title: ADR 0010 — Agent app interface and tool protocol
  - id: questions
    resource: ../../QUESTIONS.md
    title: DOMinic Open Questions and Decisions
---

# Demo path — what the judges must see

Judges score the four criteria from three artifacts: the two-minute
video, the written description, and the public repository. The video
does the heavy lifting — it is where reliability, theme alignment,
technical depth, and usefulness are *seen* rather than claimed. This
document is the ordered set of beats the video must contain and what
each beat has to prove.

It is a filming plan, not an architecture document. The technical
decisions live in the ADRs and their **Hackathon POC (Golden Path)**
sections; this document only decides what goes on camera, in what order,
and why. The scoring logic behind every choice is in
[rubric.md](rubric.md).

## The core loop — the whole demo in one sentence

> Ask → `install_app` → the window opens → the user uses it → the tab
> reloads → the app is still there → ask for a change → `update_app`
> changes it in place.

That sentence is the golden path of ADRs 0006, 0007, and 0010, filmed.
It is also the chatbox-test answer from the rubric: a chat window can
*show* code; this environment *runs* it, keeps it, and changes it.

## The beats

| Time | Beat | On camera | Proves | Golden-path element it films |
| --- | --- | --- | --- | --- |
| 0:00–0:10 | **Hook** | A person, a small job they want done right now, and a browser tab they already have open. One sentence of narration: who, and what. | Criterion 4 — a clear user and problem | — |
| 0:10–0:18 | **Ask** | One plain-English sentence typed into the Agent Chat window. Then the chat window is moved aside; the desktop fills the frame. | Criterion 2 — chat is the input, not the value | ADR 0005 streaming chat; Q1.1 floating chat window |
| 0:18–0:45 | **Materialize** | Tool pills ("Generating App…", "Installing to Desktop…"), the window opens on its own, confetti, the installation badge — and the user *uses* the app; state visibly changes. | Criterion 2 at a 5 — value impossible in a chatbox; criterion 1 — the core workflow | ADR 0010 `install_app` lifecycle; ADR 0005 pills and confetti; ADR 0006 DynamicAppRunner |
| 0:45–0:58 | **Persist** | Reload the tab. The launcher and taskbar list the app again; open it from there. Windows reset; installed apps do not. | Criterion 2 — an environment, not a wrapper; criterion 1 — reliability | ADR 0007 boot hydration from `/apps/`; Q4.1 |
| 0:58–1:15 | **Update** | "Make the break five minutes and give it a synthwave look." The running app changes in place; the chat shows the change summary. | Criterion 4 at a 5 — "clear and controllable," "uses context intelligently"; criterion 2 — the environment shapes the workflow | ADR 0010 `update_app`; Q2.2 installed-app context injection |
| 1:15–1:32 | **Recover** | An app throws. The window shows the error card; the user clicks "Ask Agent to Fix"; the agent repairs it; it runs. | Criterion 3 at a 5 — "thoughtful failure handling" | ADR 0006 error boundary; Q3.2 |
| 1:32–1:42 | **Control** | Uninstall an app, or open `/apps/<id>/index.vue` to show the source is real and readable. | Criterion 4 — control; criterion 3 — nothing is hidden | ADR 0007 canonical paths; Settings "Reset OS" (Q4.2) |
| 1:42–1:50 | **Any model** | The Settings app shows the provider and key. One line: bring your own key; it never leaves your browser. | Criterion 3 — depth; sponsor visibility (OpenAI) | ADR 0004 and 0005 Settings app, per-request keys |
| 1:50–2:00 | **Close** | Title card, one-line value statement, sponsor tags. | Submission gates | — |

## Cut order — non-negotiable versus stretch

The loop is non-negotiable: **Hook, Ask, Materialize, Persist, Close.**
Without Persist the shell reads as a skin around a chat window, which
is the rubric's definition of a 2 on criterion 2.

The stretch beats, in order of points per minute of build time:

1. **Update** — `update_app` is already a golden-path tool, so this beat
   is nearly free, and it lifts criterion 4 from a 3 to a 5.
2. **Recover** — the error boundary and "Ask Agent to Fix" are already
   planned (ADR 0006, Q3.2); the rubric names failure handling in its
   definition of a 5 on criterion 3.
3. **Control** — uninstall or view source; cheap, and it proves the code
   is real.
4. **Any model** — sponsor visibility plus depth; lowest priority.

One rule decides every scope question today: **anything the camera never
sees earns zero points.** If it is not a beat, it can wait until 4:01 —
which is what [NEXT.md](../../NEXT.md) is for.

## On camera, off camera — by ADR

| ADR | On camera? | Why |
| --- | --- | --- |
| 0004 shell and taskbar | Yes — the stage | The launcher and taskbar are how a judge sees "installed" |
| 0005 agent chat | Yes — as the input | The tool pills and confetti are the visible handoff; then move the window aside |
| 0006 runtime-compiled apps | Yes — the star | Criterion 2's 5 lives here; the error boundary is the Recover beat |
| 0007 virtual filesystem | Yes — via the reload and the source view | Proves environment, not wrapper |
| 0010 tool protocol | Yes — as the pills | `install_app` and `update_app` are the Materialize and Update beats |
| 0008 esm.sh dependencies | Only through the pre-provisioned libraries | No live package fetch on the core loop |
| 0009 networking | Only if a live-data showcase app is included | Never on the core-loop take |
| 0001–0003 slices, toolchain, stores | No | Invisible to judges; they buy reliability, not points |

## Choosing the demo app

[QUESTIONS.md](../../QUESTIONS.md) Q5.1 lists three showcase apps. The
rubric ranks them for the *core-loop take* — the one generation that
must work on camera:

1. **Pomodoro / focus timer** — the core-loop app. No fetch, visible
   state, confetti on completion, a job anyone recognizes. Its
   `update_app` follow-up ("five-minute break, synthwave look") is the
   Update beat.
2. **Kanban board** — the alternative if the timer misbehaves; its own
   saved cards make the Persist beat even stronger.
3. **Crypto or weather dashboard** — a fine *second* showcase if it is
   already working, but never the core-loop take: a live API is the one
   thing on set we do not control.

Rehearse one prompt for the core-loop app and keep it verbatim below
once it works. Never edit it after the first successful rehearsal.

Chosen app: *Pomodoro / focus timer, unless the team decides otherwise.*
Exact prompt: *to be filled in verbatim.*

## Filming rules — criterion 1 on camera

- Rehearse the exact prompt three times before recording. Record two
  full takes.
- Recorded, not live: a bad take is retaken, never narrated around.
- After the Ask, move the chat window to a corner or minimize it. The
  desktop is the frame; the chat is never the frame.
- No mocked steps. If a beat cannot run, cut it — do not fake it. The
  rubric scores what runs.
- Curated showcase apps are welcome as pre-installed proof of
  persistence and as b-roll, but the Materialize beat is a real
  generation on camera, and nothing hand-written is ever presented as
  agent-authored.
- Keep a previously generated, known-good app source ready as a
  fallback for the Persist beat. It was agent-authored — just not in
  this take — and the narration should say so.
- Say the chatbox test out loud once: "a chat window could show this
  code; here it runs, it stays, and it changes when I ask."
- Show the launcher or taskbar every time an app installs. That is how
  a judge *sees* "installed."

## Rubric lens on the open questions

The team's register asks for input. From the scoring side only:

- **ADR 0010 — install approval.** Auto-install is right for the
  Materialize beat: it is the delight moment, and hesitation costs
  criterion 1 flow. Criterion 4's "controllable" is then earned in the
  Update and Control beats, where the user steers and can remove — so
  keep auto-install *and* keep at least one of those two beats.
- **Q1.1 — floating chat window.** Good for the video: it can be moved
  aside after the Ask so the camera stays on the desktop.
- **Q4.1 — persist installed apps only.** Enough for the Persist beat.
  The narration should say "your apps come back" rather than "your
  desktop comes back," so the reset windows never read as a bug.
- **Q5.1 — showcase apps.** Ranked above for the core-loop take.

## Written description — skeleton for submission gate 2

The portal asks for "what you built, who it is for, and why the context
matters." Draft to that shape, in that order:

1. **What we built.** DOMinic is a desktop OS in a browser tab where the
   agent is the primary app author: describe an app and it is written,
   installed, and kept like first-party software; ask for a change and
   it updates in place.
2. **Who it is for.** *One named user and the job from the demo app.*
3. **Why the context matters.** The chatbox-test answer: a chat window
   shows code; a browser tab runs it. The OS shell gives the agent's
   output somewhere to live, persist, and be reopened, and the user
   keeps control — update, uninstall, read the source.
4. **What is real in the repository.** Link the ADRs and their golden
   paths; state plainly what runs in the video.

## Social post — skeleton for submission gate 5

One public post that tags the event sponsors. Suggested shape:

> We built DOMinic at the Agents, Everywhere hackathon: a browser OS
> where the agent writes the apps — describe one, and it installs and
> stays. [video] [repo] Thanks to [sponsor tags].

Sponsors named on the event page — confirm the exact handle for the
platform used before posting: OpenAI, CopilotKit, OpenRouter, Exa,
Auth0, Mozilla, Ambiguous AI, Trigger.dev, Rev1 Ventures, TeamClaws,
GDG Columbus, and AI Tinkerers Columbus.

## Clock

Freeze ~3:10, record and render ~3:10–3:30, upload and submit by ~3:50;
the portal closes at 4:00. The full cadence and the five submission gates
are in [rubric.md](rubric.md).
