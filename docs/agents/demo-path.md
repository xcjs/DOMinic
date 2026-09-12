---
type: playbook
title: Demo Path — What the Judges Must See
description: The two-minute demo as an ordered set of beats, each mapped to a judging criterion and to an ADR confirmation the team has already committed to prove.
tags: [hackathon, demo, video, submission]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T17:50:00Z }
verified: { by: human:michael, at: 2026-09-12T17:50:00Z }
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
---

# Demo path — what the judges must see

Judges score the four criteria from three artifacts: the two-minute
video, the written description, and the public repository. The video
does the heavy lifting — it is where reliability, theme alignment,
technical depth, and usefulness are *seen* rather than claimed. This
document is the ordered set of beats the video must contain and what
each beat has to prove.

It is a filming plan, not an architecture document. The technical
decisions live in the ADRs; this document borrows their confirmation
criteria — the things the team has already committed to prove — as the
things to put on camera. The scoring logic behind every choice here is
in [rubric.md](rubric.md).

## The core loop — the whole demo in one sentence

> Ask → the agent authors an app → it compiles → it installs to the
> taskbar → it runs → the tab reloads → it is still there.

That sentence is ADR 0006's confirmation criterion plus ADR 0007's,
filmed. It is also the chatbox-test answer from the rubric: a chat
window can *show* code; this environment *runs* it and keeps it.

## The beats

| Time | Beat | On camera | Proves | Films this team commitment |
| --- | --- | --- | --- | --- |
| 0:00–0:10 | **Hook** | A person, a small job they want done right now, and the browser tab they already have open. One sentence of narration: who, and what. | Criterion 4 — a clear user and problem | — |
| 0:10–0:20 | **Ask** | One plain-English sentence typed into chat. Chat is a sidebar; the shell fills the frame. | Criterion 2 — chat is the input, not the value | ADR 0005: a round-trip streams |
| 0:20–0:50 | **Materialize** | The app appears in the registry, lands on the taskbar, opens as a window, and the user *uses* it — state visibly changes. | Criterion 2 at a 5 — value impossible in a chatbox; criterion 1 — the core workflow | ADR 0006: an agent-authored SFC installs from chat, appears in the app registry, launches as a window |
| 0:50–1:05 | **Persist** | Reload the tab. The taskbar still lists the app; reopen it; the state is intact. | Criterion 2 — an environment, not a wrapper; criterion 1 — reliability | ADR 0006 and 0007: survives reload via its VFS source |
| 1:05–1:25 | **Recover** | Ask for a change that fails. A visible error; the agent reads it and repairs; success. | Criterion 3 at a 5 — "thoughtful failure handling" | ADR 0006's own caveat, shown handled |
| 1:25–1:40 | **Control** | Preview before install, or uninstall; open the app's source from the filesystem. | Criterion 4 at a 5 — "clear and controllable" | ADR 0006: install/uninstall lifecycle; ADR 0007: source in the VFS |
| 1:40–1:50 | **Any model** | Settings shows the provider. One line: bring your own key; it never leaves your browser. | Criterion 3 — depth; sponsor visibility | ADR 0005: keys browser-side, used per request |
| 1:50–2:00 | **Close** | Title card, one-line value statement, sponsor tags. | Submission gates | — |

## Cut order — non-negotiable versus stretch

The loop is non-negotiable: **Hook, Ask, Materialize, Persist, Close.**
Without Persist the shell reads as a skin around a chat window, which
is the rubric's definition of a 2 on criterion 2.

The stretch beats, in order of points per minute of build time:

1. **Control** — lifts criterion 4 from a 3 to a 5 and is cheap to show.
2. **Recover** — the rubric names failure handling explicitly in the
   criterion 3 definition of a 5.
3. **Any model** — sponsor visibility plus depth; lowest priority.

One rule decides every scope question today: **anything the camera never
sees earns zero points.** If it is not a beat, it can wait until 4:01.

## On camera, off camera — by ADR

| ADR | On camera? | Why |
| --- | --- | --- |
| 0004 shell and taskbar | Yes — the stage | The taskbar is how a judge sees "installed" |
| 0005 agent chat | Yes — as a sidebar | The input, never the frame |
| 0006 runtime-compiled apps | Yes — the star | Criterion 2's 5 lives here |
| 0007 virtual filesystem | Yes — via the reload | Proves environment, not wrapper |
| 0008 esm.sh dependencies | Only if the demo app needs a package | A refused package with its reasons is a fine Recover beat, but not required |
| 0009 CORS proxy | No | Off the loop; keep it out of the video and the description |
| 0001–0003 slices, toolchain, stores | No | Invisible to judges; they buy reliability, not points |

## Choosing the demo app

Pick one app and one prompt, then rehearse only that. The rubric, not
taste, sets the criteria:

- **No external API.** Keeps the loop self-contained and the take
  reliable, and keeps ADR 0009 off the critical path.
- **Visible state that persists across a reload.** The Persist beat
  needs something to show.
- **Legible in ten seconds** to a stranger watching on mute.
- **A job a real person wants done right now** — criterion 4 wants a
  clear user, not a toy.

Good candidates: a habit tracker, a kanban board, an expense log, a
timer with saved presets. Avoid anything that fetches, anything with no
state (a calculator), and anything that needs an npm package.

Chosen app: *to be filled in once decided.* Exact prompt: *to be filled
in verbatim, and never edited after the first successful rehearsal.*

## Filming rules — criterion 1 on camera

- Rehearse the exact prompt three times before recording. Record two
  full takes.
- Recorded, not live: a bad take is retaken, never narrated around.
- Camera on the shell; the chat sidebar takes at most a third of the
  frame.
- No mocked steps. If a beat cannot run, cut it — do not fake it. The
  rubric scores what runs.
- Keep a previously generated, known-good app source ready as a
  fallback for the Persist beat. It was agent-authored — just not in
  this take — and the narration should say so.
- Say the chatbox test out loud once: "a chat window could show this
  code; here it runs, and it stays."
- Show the taskbar every time an app installs. The taskbar is how a
  judge *sees* "installed."

## Written description — skeleton for submission gate 2

The portal asks for "what you built, who it is for, and why the context
matters." Draft to that shape, in that order:

1. **What we built.** DOMinic is a desktop OS in a browser tab where the
   agent is the primary app author: you describe an app, and it is
   written, compiled, installed, and kept — like first-party software.
2. **Who it is for.** *One named user and the job from the demo app.*
3. **Why the context matters.** The chatbox-test answer: a chat window
   shows code; a browser tab runs it. The OS shell gives the agent's
   output somewhere to live, persist, and be reopened, and the user
   keeps control — preview, install, uninstall, read the source.
4. **What is real in the repository.** Link the ADRs; state plainly
   what runs in the video.

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
