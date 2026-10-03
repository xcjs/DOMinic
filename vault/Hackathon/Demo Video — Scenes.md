---
type: reference
title: Demo Video — Scenes
description: Scene-by-scene record of the final 6:32 demo video — what the viewer sees and hears in every scene, the exact on-screen text, the punch-ins, the retention principle each beat serves, and what is real footage versus graphic overlay.
tags: [hackathon, demo, video, scenes]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T20:55:00Z }
sources:
  - id: composition
    resource: ../../../project-files/dominic-video/index.html
    title: HyperFrames composition — dominic-video/index.html (HyperFrames 0.8.36, root data-duration 392, 1920x1080 @ 30 fps)
  - id: charles-demo
    resource: ../../../project-files/dominic-video/assets/footage/charles-demo-2026-09-12-1617.mp4
    title: Charles's screen capture — Drive DOMinic/Charles/Screencast from 2026-09-12 16-17-22.webm (2256x1504, 168.36 s, no audio)
  - id: interview-1
    resource: Drive DOMinic/DJI_20260912_155301_60_null_video.mp4
    title: Interview 1 — Charles (1920x1080 via rotation flag, 30 fps, stereo, 118.13 s)
  - id: interview-2
    resource: Drive DOMinic/DJI_20260912_155508_62_null_video.mp4
    title: Interview 2 — Zack, team lead (1920x1080 via rotation flag, 120 fps, stereo, 91.0 s)
  - id: demo-path
    resource: Demo Path.md
    title: Demo Path — What the Judges Must See
---

# Demo video — scenes

This is the record of what is actually in the finished video, scene by
scene: what a viewer sees and hears, the exact words on screen, where
the camera punches in, which retention principle each beat is there to
serve, and — for every frame — what is real footage and what is a
graphic laid over it. The cue-level timing (every caption in and out,
every SFX hit) lives in [[Demo Video — Shot List]]; the argument for
*why* these beats and not others is in [[Demo Path]] and
[[Judging Rubric & Win Strategy]]. The mechanisms the captions name are
the golden paths of
[[ADR 0006 - Agent-authored runtime-compiled components|ADR 0006]],
[[ADR 0007 - Virtual filesystem with pluggable storage drivers|ADR 0007]]
and [[ADR 0010 - Agent app interface and tool protocol|ADR 0010]].

**Runtime:** 6:32 (392 s), 1920x1080 at 30 fps.
**Composition:** `project-files/dominic-video/index.html` — HyperFrames
0.8.36, root `data-duration` 392.
**Render** (from the repository root):

```sh
cd project-files/dominic-video && npm run check && npx --yes hyperframes@0.8.36 render --output out/dominic-demo-v4.mp4
```

## Scene map

| Scene | In | Out | Length | Name | Real / graphic |
| --- | --- | --- | --- | --- | --- |
| A | 0:00.00 (0) | 0:02.40 (2.4) | 2.4 s | Cold open — flash-forward | real footage + kinetic text |
| B | 0:02.40 (2.4) | 0:06.40 (6.4) | 4.0 s | Stakes card | graphic |
| C | 0:06.40 (6.4) | 2:54.76 (174.76) | 168.36 s | The demo — Charles's capture, full length | real agent, real runtime, unedited; captions only |
| D | 2:54.76 (174.76) | 2:56.76 (176.76) | 2.0 s | Chapter card | graphic |
| E | 2:56.76 (176.76) | 4:54.89 (294.89) | 118.13 s | Interview 1 — Charles, full, unedited | real footage; captions only |
| F | 4:54.89 (294.89) | 6:25.89 (385.89) | 91.0 s | Interview 2 — Zack, team lead, full, unedited | real footage; captions only |
| G | 6:25.89 (385.89) | 6:32.00 (392) | 6.11 s | Close + handoff | graphic |

Times below are composition seconds unless marked *clip*. In scene C,
composition time = 6.4 + clip time throughout.

**All footage is 16:9** — the composition is 1920x1080 throughout — and
**the three shared clips are shown in full and unedited**: Charles's
capture (168.36 s) plays once, start to finish, at its original speed as
scene C, and the two native-16:9 interview clips (118.13 s and 91.0 s)
play start to finish, uncut and at their own audio, as scenes E and F.
The only framing change anywhere is the 3:2 capture shown as 16:9 from
the bottom (scene C); the flash-forward in scene A is a repeated 2.4 s
excerpt, not a cut.

### The retention brief the scenes are built against

Hook in the first frame (the finished dashboard); stakes on screen by
0:06; two open loops (two sentences → two apps, then *how it was built*);
a pattern interrupt every 4–8 s inside the demo (punch-ins, callouts,
SFX); the 27 s generation wait covered by three attention resets; the
payoff at ~1:55 (dashboard maximized); a chapter card; interviews carried
by pull-quote cards; and an abrupt close on Zack's last line straight
into a handoff card — no outro.

### Audio conventions

The bed is `assets/audio/bed-synth-pulse-long.wav`, a 120 BPM synth
pulse synthesized with ffmpeg `aevalsrc` — no licensed music. Levels:
0.55 at the open, 0.30 under the demo, 0.06 under the interviews, 0.7 at
the close. The SFX (impact, riser, whoosh, tick, chime) are all
synthesized with ffmpeg. Charles's screen capture has no audio track, so
every sound under scene C is added. Each interview plays its own stereo
track at full level.

## Scene A — Cold open, flash-forward (0.0–2.4)

The video opens on its own ending. Frame one is Charles's capture at
clip 109.5–111.9 — the Frontier AI Financial Report already maximized
and filling the screen — with an impact on the first frame and the synth
bed entering at 0.55. Over the 2.4 seconds the camera pushes slowly to
1.5x toward the chart column while two lines of kinetic type land, one
after the other. Nothing is explained; the viewer is shown the finished
thing and denied the how. When the same frame comes back at 1:55 in
scene C, the loop closes.

- **On-screen text:** `One sentence in.` · `A real app out.`
- **Camera:** slow push to 1.5x toward the chart column (640,420) over
  2.4 s.
- **Audio:** impact at 0.0; bed in at 0.55.
- **Retention:** *hook* — the finished dashboard is in the first frame;
  it is also the first *open loop* (a flash-forward the viewer has not
  earned yet).
- **Real vs. graphic:** real footage (charles-demo 109.5–111.9) with a
  kinetic-text overlay.

## Scene B — Stakes card (2.4–6.4)

Hard cut to black. The DOMinic windows banner sits under the type at 28%
opacity, dim enough to read as texture rather than a logo card. Three
lines of typography set the terms in four seconds: what this is not,
what the viewer is about to watch, and what comes after it. A riser
runs under the last line from 3.9 to 6.4 and hands off into the demo.
No footage; nothing moves except the type.

- **On-screen text:**
  `No chatbox. No copy-paste.` ·
  `Two plain sentences. Two real apps. Installed on camera, unedited.` ·
  `Then: how five people built it in one day.`
- **Camera:** none.
- **Audio:** riser 3.9–6.4; bed continues at 0.55.
- **Retention:** *stakes* by 0:06, and two *open loops* stated
  outright — the two apps, and the "how" that scenes D–F pay off.
- **Real vs. graphic:** graphic — typography on black over
  `assets/brand/dominic-banner-windows.png` at 28%.

## Scene C — The demo, Charles's capture, full length (6.4–174.76)

From 6.4 to 174.76 the video is Charles's 2:48 capture, played once,
start to finish, at its original speed; composition time is 6.4 plus
clip time throughout. The 3:2 source is framed to 16:9 from the bottom
(object-fit cover, object-position 50% 100%), which trims the macOS menu
bar and the browser chrome at the top and keeps the DOMinic taskbar. The
source has no audio, so everything heard — the bed at 0.30 with swells
at 33.2 and 115.2, and every whoosh, tick, impact, chime and riser cued
below — is synthesized. The agent, the runtime and the two apps are
real; the only things added to the picture are captions, lower thirds
and punch-ins. Between the sub-beats the footage keeps running at the
plain framing; the beats below are the moments where the camera or a
caption acts.

- **Retention (whole scene):** the two *open loops* from scene B are
  opened, held and closed on camera; *pattern interrupts* every 4–8 s;
  the *delayed payoff* at ~1:55; a final *handoff* into scene D.
- **Real vs. graphic:** real agent, real runtime, unedited; overlays are
  captions and lower thirds only.

### C.1 · Desktop, chat open (6.8–12.0 · clip 0.4–5.6)

A whoosh at 6.4 carries the cut from the stakes card into the capture.
The viewer sees the DOMinic desktop with the Agent Chat window open on
its welcome state; nothing has been installed and the taskbar lists no
apps. A lower third puts the rules of what follows on record — live
capture, one browser tab, nothing installed yet, 2:48 and unedited — so
the before-state is established before anything happens. The camera does
nothing here; the frame is the plain 16:9 crop.

- **On-screen text:** lower third `LIVE CAPTURE · one browser tab ·
  nothing installed yet · 2:48, unedited`
- **Camera:** none.
- **Audio:** whoosh at 6.4.
- **Retention:** *stakes* — the baseline both payoffs are measured
  against; the "unedited" claim is made before it has to be trusted.
- **Real vs. graphic:** real footage; the lower third is an overlay.

### C.2 · Ask — typing the first sentence (11.4–21.4 · clip 5–15)

Charles starts typing at clip 5 and sends the first prompt at clip 15.
The camera pushes slowly to 1.55x on the chat input so the sentence, not
the desktop, is what the viewer reads. Five synthesized keyboard ticks
between 12.4 and 16.4 give the silent source a sense of touch. The
caption holds from 13.0 to 20.5, over the typing and through the send.

- **On-screen text:** `Plain English is the whole interface.`
  (13.0–20.5)
- **Camera:** slow 1.55x push on the chat input (1190,606).
- **Audio:** five keyboard ticks, 12.4–16.4.
- **Retention:** *open loop* — a sentence goes in and the viewer waits to
  see what comes out; the push and the ticks are the first *pattern
  interrupt* inside the demo.
- **Real vs. graphic:** real footage; caption overlay; the ticks are
  added (the source is silent).

### C.3 · Materialize — streaming (21.4–33.4 · clip 15–27)

The agent answers in the chat window, streaming its plan as text, and
an *Installing Application* pill appears in the thread. The camera
holds a 1.45x punch-in on the chat text for nine seconds so the
streaming and the pill can be read. A whoosh at 22 marks the reframe.
The caption runs 24.5–31.5, naming what the viewer is *not* being asked
to do while the agent works — this is the `install_app` tool call of
[[ADR 0010 - Agent app interface and tool protocol|ADR 0010]] as it
looks from the chat side.

- **On-screen text:** `Nothing to copy. Nothing to paste. Nothing to
  run.` (24.5–31.5)
- **Camera:** 1.45x on the chat text (1205,300), held 9 s.
- **Audio:** whoosh at 22.
- **Retention:** holds the *open loop* through the wait; the pill is the
  tell that something is about to happen.
- **Real vs. graphic:** real footage; caption overlay.

### C.4 · Materialize — the calculator installs (33.4–39.0 · clip 27–32.6)

At clip 27 the Calculator window opens on its own and the taskbar lists
it — the first payoff, 33 seconds in. An impact and a chime hit at 33.4
with the bed swelling under them, and the camera snaps to 1.6x on the
new window and holds for 4.5 seconds. Two overlays stack: a caption at
35.0–40.5 and, from 37.0 to 41.5, a lower third that spells out the
pipeline in one line. That line is the golden path of
[[ADR 0010 - Agent app interface and tool protocol|ADR 0010]] (the tool),
[[ADR 0007 - Virtual filesystem with pluggable storage drivers|ADR 0007]]
(source written to the VFS) and
[[ADR 0006 - Agent-authored runtime-compiled components|ADR 0006]]
(compiled in the tab), shown at the moment it visibly happened.

- **On-screen text:** `It didn't paste code. It shipped an app.`
  (35.0–40.5) · lower third `install_app → source written to the VFS →
  compiled in the tab → window opens → taskbar lists it` (37.0–41.5)
- **Camera:** 1.6x snap on the calculator (518,395), held 4.5 s.
- **Audio:** impact + chime at 33.4; bed swell at 33.2.
- **Retention:** *delayed payoff* — loop 1 closes (sentence → app); the
  loudest SFX cue in the demo.
- **Real vs. graphic:** real footage; caption and lower third overlays.

### C.5 · Use — pressing the keys (44.0–50.4 · clip 37.6–44)

Charles presses digits and the calculator display shows 41 (clip 39; it
shows 42 later, at clip 54). The camera goes to 1.7x on the display with
a single tick at 45.4, so the viewer sees state change inside an app that
did not exist a minute ago. The caption holds 45.5–51.5. After the
punch-in, while he handles the window, a lower third at 56–61 names the
window manager's controls.

- **On-screen text:** `A real Vue component, compiled in your tab. Not
  an iframe to somebody's server.` (45.5–51.5) · lower third
  `WINDOW MANAGER drag · minimize · close` (56–61)
- **Camera:** 1.7x on the display (768,300).
- **Audio:** tick at 45.4.
- **Retention:** *stakes / proof* — the app works and is not a
  screenshot; a *pattern interrupt* at one of the tightest zooms in the
  demo.
- **Real vs. graphic:** real footage; overlays only. The component is a
  runtime-compiled SFC per
  [[ADR 0006 - Agent-authored runtime-compiled components|ADR 0006]].

### C.6 · Second ask (66.4–84.4 · clip 60–78)

Charles types the second sentence from clip 60 to 78. The camera pushes
to 1.5x on the chat input over eight seconds and holds for eight more; a
whoosh at 67 marks the move. The caption at 70–78 raises the stakes:
the calculator was the warm-up. No other overlay.

- **On-screen text:** `Now the real test: not a widget — a whole
  analytics report.` (70–78)
- **Camera:** 1.5x push on the chat input (1190,606), 8 s in, 8 s hold.
- **Audio:** whoosh at 67.
- **Retention:** *open loop* 2, with the *stakes* raised.
- **Real vs. graphic:** real footage; caption overlay.

### C.7 · Generation — 27 seconds, unedited (84.4–111.4 · clip 78–105)

From clip 78 to 105 the agent generates the dashboard, and the video
shows all of it — about 27 seconds of a chat window working, the
riskiest stretch for attention in the whole cut. It is covered by three
resets. First, a whoosh at 86 and a 1.35x punch-in on the streaming chat
text held to 95.2, with a caption at 88–94. Second, a lower third at
97–104 saying what is being generated. Third, a caption at 104.5–110.5
while a riser builds from 108.9 to 111.4 into the window's appearance.

- **On-screen text:** `Twenty-seven seconds of generation. Unedited.`
  (88–94) · lower third `GENERATING a multi-view dashboard: providers ·
  valuations · revenue · export` (97–104) · `Still one tab. Still one
  sentence.` (104.5–110.5)
- **Camera:** 1.35x on the chat text, held 8 s (86–95.2).
- **Audio:** whoosh at 86; riser 108.9–111.4.
- **Retention:** three attention resets (*pattern interrupts*) carry the
  wait; the *delayed payoff* is deliberately held rather than cut.
- **Real vs. graphic:** real footage in real time; caption and lower
  third overlays.

### C.8 · Report window appears (111.4–115.4 · clip 105–109)

The riser lands on an impact at 111.4 as the Frontier AI Financial
Report window opens, small, on the desktop at clip 105. The camera snaps
to 1.6x on the new window. There is no text on screen for these four
seconds — the only demo beat with none — so nothing competes with the
window itself. Four seconds later Charles maximizes it.

- **On-screen text:** none.
- **Camera:** 1.6x snap on the window (537,280).
- **Audio:** impact at 111.4.
- **Retention:** *pattern interrupt* (no text after three captions); the
  payoff is split in two on purpose — arrive, then reveal.
- **Real vs. graphic:** real footage; no overlay.

### C.9 · Payoff — the dashboard maximized (115.4–131 · clip 109–124.6)

At clip 109 the report fills the screen: charts, provider cards and an
export control, agent-authored end to end. A chime and a soft impact at
115.4 and the bed's second swell (to 0.6) mark it, and the camera pushes
slowly to 1.15x over six seconds instead of snapping. A caption holds
117–123, followed by a lower third at 124–130. This is the frame the
video opened on — the flash-forward in scene A is paid off here, at
1:55.

- **On-screen text:** `Frontier AI Financial Report. From one sentence.`
  (117–123) · lower third `AGENT-AUTHORED charts · filters · provider
  cards · export` (124–130)
- **Camera:** slow 1.15x push (700,450) over 6 s.
- **Audio:** chime + soft impact at 115.4; bed swell to 0.6 at 115.2.
- **Retention:** the *delayed payoff* — planned at ~1:55; closes loop 2
  and the scene A flash-forward.
- **Real vs. graphic:** real footage; caption and lower third overlays.

### C.10 · Provider cards (131–140 · clip 124.6–133.6)

Charles scrolls the report. A whoosh at 131 and a 1.5x punch-in on the
right column follow the provider cards as they move. The caption at
133–140 is the chatbox test from [[Judging Rubric & Win Strategy]] and
[[Demo Path]], said once, over the evidence. Nothing else is added.

- **On-screen text:** `The chatbox test: a chat window shows code.
  DOMinic runs it.` (133–140)
- **Camera:** 1.5x on the right column (1500,450).
- **Audio:** whoosh at 131.
- **Retention:** *stakes* restated as the thesis; *pattern interrupt*.
- **Real vs. graphic:** real footage; caption overlay.

### C.11 · Minimized (145.4–149.4 · clip 139–143)

Charles minimizes the report between clip 139 and 143; the desktop and
the chat window are visible again and the report sits on the taskbar. A
whoosh at 146.2 and a 1.8x punch-in on the taskbar — the tightest zoom in
the video — point at the one place a judge can *see* "installed", which
is the filming rule [[Demo Path]] insists on. The caption holds 146–150.

- **On-screen text:** `Minimized. It's on the taskbar, like any app.`
  (146–150)
- **Camera:** 1.8x on the taskbar (230,1059).
- **Audio:** whoosh at 146.2.
- **Retention:** proof of *environment, not wrapper*; a *pattern
  interrupt* before the last beat.
- **Real vs. graphic:** real footage; caption overlay.

### C.12 · Reopened (150.4–174.76 · clip 144–168.36)

At clip 144 the report is restored from the taskbar and Charles explores
it to the end of the capture. A whoosh at 150.4 marks the restore and a
caption holds 151.5–157. From 160 to 170 the camera makes a last slow
1.35x push while a second caption (164–172) closes the promise made on
the stakes card. Under it, a lower third at 170.5–174.5 opens the next
loop, and a riser from 172.3 carries into the chapter card at 174.76,
where the clip ends.

- **On-screen text:** `Reopened from the taskbar.` (151.5–157) ·
  `Two sentences. Two apps. One browser tab.` (164–172) · lower third
  `NEXT how five people — and a swarm of agents — built this in one day`
  (170.5–174.5)
- **Camera:** 1.35x slow push (600,420), 160–170.
- **Audio:** whoosh at 150.4; riser from 172.3.
- **Retention:** closes loop 2 and the stakes-card promise; re-opens the
  "how it was built" loop; *handoff* into scene D.
- **Real vs. graphic:** real footage; caption and lower third overlays.

## Scene D — Chapter card (174.76–176.76)

Impact at 174.76 and a hard cut to black; the bed comes up to 0.55. Two
lines of type, two seconds: the chapter title and the ground rule for
the next three and a half minutes. It answers the lower third that just
left the screen and tells the viewer the interviews are unedited before
they start.

- **On-screen text:** `How five people built this in one day.` ·
  `Two interviews. Unedited.`
- **Camera:** none.
- **Audio:** impact at 174.76; bed at 0.55.
- **Retention:** *pattern interrupt* between demo and people; starts the
  *delayed payoff* of the "how" loop opened on the stakes card (scene B);
  *handoff*.
- **Real vs. graphic:** graphic — typography on black.

## Scene E — Interview 1, Charles, full and unedited (176.76–294.89)

Cut to Charles on the hackathon floor, framed by the DJI clip's native
16:9, with his own mic audio at full level and the bed dropped to 0.06
under it. A whoosh at 176.76 covers the cut; the clip then plays
unedited for its full 118.13 seconds, and an off-camera interviewer
opens it. The camera does nothing. What the composition adds is a lower
third that timestamps the setting, a name card at +34, and six caption
cards timed to the passages where Charles describes the GitHub-issues
skill, the OpenAI, Gemini and Anthropic agents coordinating with each
other, the issues and PRs, and the Playwright pass that filed new issues
from screenshots. Two of the cards are quote cards — his own words, as
transcribed (see [[#Interview overlays]]).

- **On-screen text (clip time):**
  `HOW IT WAS BUILT · Hackathon floor · Columbus · 3:53 PM` (+0.4–8,
  lower third) · `Charles · Team DOMinic` (+34–41, name card) · quote
  `I don't want to show you what we're working on. I want to talk about
  how.` (+39.6–47) · `A skill for GitHub issues and the GitHub CLI, so
  the agents coordinate their own development.` (+53.2–61) ·
  `OpenAI · Gemini · Anthropic agents — coordinating with each other.`
  (+72.6–80) · `Issues #58, #59, #60 · dozens of PRs, reviewed and
  merged.` (+80.4–88) · `An agent ran a Playwright test pass and filed
  new issues from the screenshots.` (+95.9–102) · quote `A team of
  agents, very loosely supervised, produced a complex project.`
  (+102–110.5)
- **Camera:** none.
- **Audio:** clip audio at 1.0; bed at 0.06; whoosh at 176.76.
- **Retention:** *delayed payoff* of the "how" loop; the cards are
  *pattern interrupts* roughly every ten seconds that keep a static
  talking head watchable.
- **Real vs. graphic:** real footage, unedited; overlays are captions.

## Scene F — Interview 2, Zack, team lead, full and unedited (294.89–385.89)

Cut to Zack, team lead, in the same setup: native 16:9, own audio at
full level, bed at 0.06, a whoosh at 294.89 on the cut, the full 91.0
seconds unedited, no camera moves. A name card opens at +0.6 and a
lower third at +8.5 frames the chapter. Six caption cards follow the
argument: a web-based OS in a browser where agents communicate in
application implementations; the challenge of everyone building in
parallel with agents that implement faster than the team can;
coordination through GitHub issues and one master control issue; agents
that create, reserve, open, review and merge. The last two are quote
cards, and the video cuts out of his last line straight into the close,
with no outro.

- **On-screen text (clip time):** `Zack · Team lead · DOMinic` (+0.6–8,
  name card) · `WHAT IT IS · the idea, the architecture, the agents`
  (+8.5–14, lower third) · `A web-based OS in a browser, so agents
  communicate not in text, but in application implementations.`
  (+12.8–27.5) · `Largest challenge: everyone in parallel — with agents
  that implement faster than we can.` (+30.5–39.5) · `The agents
  coordinate through GitHub issues — one master control issue.`
  (+48.2–60) · `They create issues, reserve them, open PRs, review them,
  and merge.` (+61.4–70) · quote `An entire automated development team.`
  (+70.3–79.8) · quote `This is a ridiculous time to live in.`
  (+82.2–89.5)
- **Camera:** none.
- **Audio:** clip audio at 1.0; bed at 0.06; whoosh at 294.89.
- **Retention:** *delayed payoff* continues; the abrupt cut on his last
  line is the final *pattern interrupt* and the *handoff* into scene G.
- **Real vs. graphic:** real footage, unedited; overlays are captions.

## Scene G — Close + handoff (385.89–392)

Impact at 385.89 on the cut to the brand art — `dominic-banner-d.png`
over the grid background — which settles from 1.12x to rest while a
whoosh at 388.9 brings in the text and the bed lifts to 0.7. Four things
are on screen: the one-line tagline, the repository URL, a next step
that tells the viewer what to do, and the sponsor row. Six seconds, then
it ends. There is no outro, no recap and no thank-you card; the handoff
is the ending.

- **On-screen text:** `The desktop where the agent writes the apps.` ·
  `github.com/xcjs/DOMinic` · `Next → go break it yourself. Clone it,
  ask it for anything.` · sponsor row `AGENTS, EVERYWHERE · AI TINKERERS
  COLUMBUS · GDG COLUMBUS · OPENAI · COPILOTKIT · OPENROUTER · EXA ·
  AUTH0 · MOZILLA · TRIGGER.DEV · REV1 VENTURES · TEAMCLAWS · AMBIGUOUS
  AI`
- **Camera:** art settles from 1.12x.
- **Audio:** impact at 385.89; whoosh at 388.9; bed at 0.7.
- **Retention:** *handoff* — a next action instead of an outro.
- **Real vs. graphic:** graphic — `assets/brand/dominic-banner-d.png`
  (brand art) over the grid background.

## Interview overlays

Every card in scenes E and F is keyed to clip time; each clip starts at
its scene's in-point, so clip time = composition time − 176.76 for
Charles and − 294.89 for Zack. The card wording was written from a
faster-whisper `base.en` transcript of the two clips. The cards the
composition styles as **quote cards** carry Charles's and Zack's words
verbatim from that transcript; the remaining cards are caption cards
keyed to the same passages. Treat all of them as *as transcribed;
verify against audio* before quoting them anywhere else.

| Scene | Clip tc | Comp tc | Kind | Text |
| --- | --- | --- | --- | --- |
| E | +0.4–8 | 177.16–184.76 | lower third | HOW IT WAS BUILT · Hackathon floor · Columbus · 3:53 PM |
| E | +34–41 | 210.76–217.76 | name card | Charles · Team DOMinic |
| E | +39.6–47 | 216.36–223.76 | **quote card** | "I don't want to show you what we're working on. I want to talk about how." — as transcribed; verify against audio |
| E | +53.2–61 | 229.96–237.76 | caption | A skill for GitHub issues and the GitHub CLI, so the agents coordinate their own development. — as transcribed; verify against audio |
| E | +72.6–80 | 249.36–256.76 | caption | OpenAI · Gemini · Anthropic agents — coordinating with each other. — as transcribed; verify against audio |
| E | +80.4–88 | 257.16–264.76 | caption | Issues #58, #59, #60 · dozens of PRs, reviewed and merged. — as transcribed; verify against audio |
| E | +95.9–102 | 272.66–278.76 | caption | An agent ran a Playwright test pass and filed new issues from the screenshots. — as transcribed; verify against audio |
| E | +102–110.5 | 278.76–287.26 | **quote card** | "A team of agents, very loosely supervised, produced a complex project." — as transcribed; verify against audio |
| F | +0.6–8 | 295.49–302.89 | name card | Zack · Team lead · DOMinic |
| F | +8.5–14 | 303.39–308.89 | lower third | WHAT IT IS · the idea, the architecture, the agents |
| F | +12.8–27.5 | 307.69–322.39 | caption | A web-based OS in a browser, so agents communicate not in text, but in application implementations. — as transcribed; verify against audio |
| F | +30.5–39.5 | 325.39–334.39 | caption | Largest challenge: everyone in parallel — with agents that implement faster than we can. — as transcribed; verify against audio |
| F | +48.2–60 | 343.09–354.89 | caption | The agents coordinate through GitHub issues — one master control issue. — as transcribed; verify against audio |
| F | +61.4–70 | 356.29–364.89 | caption | They create issues, reserve them, open PRs, review them, and merge. — as transcribed; verify against audio |
| F | +70.3–79.8 | 365.19–374.69 | **quote card** | "An entire automated development team." — as transcribed; verify against audio |
| F | +82.2–89.5 | 377.09–384.39 | **quote card** | "This is a ridiculous time to live in." — as transcribed; verify against audio |

## Honesty notes

- **The demo is the real agent.** Scene C is Charles's own capture
  (Drive: `DOMinic/Charles/Screencast from 2026-09-12 16-17-22.webm`,
  2256x1504 3:2, VP8, variable frame rate, no audio, 168.36 s) of the
  real agent and the real runtime responding to two typed prompts — not
  the scripted `demo/mock-showcase` build — and it plays once, in full, at
  its original speed. The file used in the composition
  (`assets/footage/charles-demo-2026-09-12-1617.mp4`) is a
  constant-frame-rate H.264 copy at the same resolution and length, made
  so frame extraction is reliable — no cut, crop or speed change in the
  transcode. The only framing change is in the composition: the 3:2
  picture is shown as 16:9 from the bottom, which trims the macOS menu
  bar and browser chrome and keeps the DOMinic taskbar.
- **The scripted branch is not in the video.** The earlier
  `demo/mock-showcase` branch (commit `0ea677b`, worktree
  `project-files/DOMinic-demo`) exists, and our own Playwright captures
  of that scripted build were made, but none of it is in the final cut.
  Charles's real-agent capture replaced it.
- **The interviews are unedited.** Both DJI clips play in full — Charles
  118.13 s, Zack 91.0 s — with their own stereo audio at full level and
  no cuts, trims or reorders. Only captions were added.
- **"Twenty-seven seconds of generation. Unedited." is the real timing.**
  Generation runs from clip 78 to clip 105 (about 27 s) and the
  composition shows all of it (84.4–111.4). Likewise the lower third
  "2:48, unedited" is the clip's true length, 168.36 s.
- **Every sound under the demo is added.** The capture has no audio.
  The bed is a synthesized 120 BPM pulse (ffmpeg `aevalsrc`), the SFX are
  synthesized with ffmpeg, and there is no licensed music anywhere in the
  video. The interviews' sound is their own.
- **Quote cards are transcript text.** They come from a faster-whisper
  `base.en` transcript and are marked "as transcribed; verify against
  audio" above; they have not been checked word for word against the
  clips.
- **Footage on the Drive that is not used:** the two terminal screen
  recordings (15:46 early playthrough, 15:47 process — the
  producer asked for interview footage and our own captures only);
  Charles's 15:33 Playwright test-run screencast (superseded by his 16:17
  working demo); the repo `docs/assets` JPG screenshots (removed after
  v1); and our Playwright captures of the scripted `demo/mock-showcase`
  build. Two VeniceAI images are used (`dominic-banner-d.png` in scene G,
  `dominic-banner-windows.png` under scene B); the eight other VeniceAI
  logo variants on the Drive are not.
- **What the captions claim is what the ADRs describe.** The C.4 lower
  third (`install_app` → VFS → compiled in the tab → window → taskbar)
  names the mechanisms of
  [[ADR 0010 - Agent app interface and tool protocol|ADR 0010]],
  [[ADR 0007 - Virtual filesystem with pluggable storage drivers|ADR 0007]]
  and
  [[ADR 0006 - Agent-authored runtime-compiled components|ADR 0006]];
  see each note's As-built section for what shipped.
