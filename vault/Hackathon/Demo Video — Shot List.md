---
type: playbook
title: Demo Video — Shot List
description: Scene-by-scene shot list for the finished 6:32 DOMinic demo video — timecodes, source footage, punch-ins, on-screen text, audio cues, and what is real footage versus graphic.
tags: [hackathon, demo, video, shot-list]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T20:55:00Z }
sources:
  - id: composition
    resource: ../../../project-files/dominic-video/index.html
    title: HyperFrames composition — dominic-video/index.html (HyperFrames 0.8.36, root data-duration 392, 1920x1080 @ 30 fps)
  - id: charles-demo
    resource: "Drive: DOMinic/Charles/Screencast from 2026-09-12 16-17-22.webm"
    title: Charles's working-demo capture, 16:17 (2256x1504 3:2, VP8, VFR, no audio, 168.36 s)
  - id: interview-1
    resource: "Drive: DOMinic/DJI_20260912_155301_60_null_video.mp4"
    title: Interview 1 — Charles (displays 1920x1080, 30 fps, stereo, 118.13 s)
  - id: interview-2
    resource: "Drive: DOMinic/DJI_20260912_155508_62_null_video.mp4"
    title: Interview 2 — Zack, team lead (displays 1920x1080, 120 fps, stereo, 91.0 s)
  - id: demo-path
    resource: Demo Path.md
    title: Demo Path — What the Judges Must See
---

# Demo video — shot list

The finished DOMinic hackathon video is a **6:32 (392 s), 1920x1080, 30 fps
HyperFrames composition** (`project-files/dominic-video/index.html`,
HyperFrames 0.8.36, root `data-duration` 392). It is built from three
shared clips and nothing else: Charles's 16:17 working-demo capture (the
real agent installing two real apps in one browser tab, 168.36 s), and the
two DJI interview clips — Charles (118.13 s) and Zack, team lead (91.0 s).
Around them sit typography cards, two Venice AI brand images, and a
synthesized audio bed with synthesized SFX. This note is the cue-level
record: what is on screen at every second, where each frame came from, and
which parts are real footage versus graphics. Its prose companion — what
the viewer sees and hears in each scene, and the retention principle each
beat serves — is [[Demo Video — Scenes]]. The filming plan both descend
from is [[Demo Path]]; the scoring logic is [[Judging Rubric & Win Strategy]].

## Footage rules the cut follows

- **All footage is 16:9.** The composition is 1920x1080 throughout.
- **The three shared clips are shown in full and unedited** — no cuts, no
  speed change, and no crop of the two native-16:9 interview clips. Each
  clip's start-to-end runs as one continuous piece (scenes C, E, F).
- **Charles's 3:2 MacBook capture is framed 16:9 anchored to the bottom**
  (`object-fit: cover`, `object-position: 50% 100%`). That trims only the
  macOS menu bar and browser chrome at the top and keeps the DOMinic
  taskbar. (Computed from the stated 2256x1504 source: 2256x1269 is
  visible, the top 235 px fall outside the frame.) The clip is otherwise
  untouched — no cut, crop, or speed change; the local copy is a
  constant-frame-rate H.264 transcode at the same resolution and length,
  made only so frame extraction is reliable.
- **No screen recordings other than Charles's working-demo capture.** The
  earlier terminal recordings and the Playwright run are not used (see
  [[#Deliberately not used]]).
- **No drawn UI mockups.** Every pixel of DOMinic on screen is the real
  runtime, captured live. Overlays are captions, lower thirds, and camera
  moves only.
- **Pull quotes are "as transcribed"** — they come from a faster-whisper
  `base.en` transcript of the two interview clips, not from a human
  transcript.
- The flash-forward in scene A reuses 2.4 s of the demo capture (clip
  109.5–111.9). That is a repeated excerpt, not a cut: the full clip still
  plays uninterrupted in scene C.

## Retention architecture

The structure follows a YouTube-retention brief: hook in the first frame,
stakes by 0:06, open loops, pattern interrupts through the demo, a covered
dead-air stretch, a delayed payoff at ~1:55, a chapter card, interviews
with pull-quote cards, and an abrupt close into a handoff card with no
outro. How each principle maps onto the cut:

| Principle | Where it lives in the cut | How |
| --- | --- | --- |
| **Packaging promise validated in frame 1** | Scene A, 0:00.0 | Frame 1 is the finished dashboard, already maximized (clip 109.5), with "One sentence in. / A real app out." The viewer sees the payoff exists before anything is asked of them. Whether the published title and thumbnail match this frame: not verified. |
| **Zero-fluff cold open** | Scene A, 0:00.0–0:02.4 | No logo, no host, no intro. 2.4 s of the result, an impact hit at 0, a 1.5x push toward the chart column, and straight into stakes. |
| **Stakes by 0:06** | Scene B, 0:02.4–0:06.4 | The contract in three lines: "No chatbox. No copy-paste." / "Two plain sentences. Two real apps. Installed on camera, unedited." / "Then: how five people built it in one day." A riser 3.9–6.4 hands off to the live capture at 6.4. |
| **Open loops** | Opened in B; closed at 0:33.4, 1:55.4, and 6:25.89 | Loop 1 ("two sentences → two apps") pays out twice: the calculator window at 0:33.4 and the dashboard at 1:55.4. Loop 2 ("then: how five people built it in one day") is re-armed by the NEXT lower third at 2:50.5–2:54.5, opened by the chapter card at 2:54.76, and closed by the two interviews. |
| **Pattern interrupts every 4–8 s during the demo** | Scene C sub-beats C.1–C.12 | The footage never cuts, so all rhythm comes from overlays: punch-ins from 1.15x to 1.8x, captions and lower thirds, and SFX (whoosh, tick, impact, chime, riser) at the cues in the table. From the cue list, the longest stretches with no new cue are roughly 0:45.5–0:56, 0:56–1:06.4, 1:10–1:24.4, and 2:13–2:25.4 — there the clip's own action (the calculator in use; the report being scrolled) runs with only the bed underneath. |
| **Dead-air management: the 27 s generation** | C.7, 1:24.4–1:51.4 | Three attention resets over an uncut wait: (1) a 1.35x punch on the streaming chat text 86–95.2 with a whoosh at 86 and the caption "Twenty-seven seconds of generation. Unedited." 88–94; (2) the lower third GENERATING a multi-view dashboard: providers · valuations · revenue · export 97–104; (3) the caption "Still one tab. Still one sentence." 104.5–110.5 under a riser 108.9–111.4 that lands on the impact at 111.4 as the window appears. |
| **Delayed payoff at ~1:55** | C.9, 1:55.4 (115.4) | The report window first appears small at 1:51.4 (pre-payoff, impact only, no caption). The maximize at 1:55.4 is the payoff: chime + soft impact, bed swell to 0.6, a slow 1.15x push over 6 s, and "Frontier AI Financial Report. From one sentence." |
| **Chapter card, not a second cold open** | Scene D, 2:54.76–2:56.76 | Two seconds on black: "How five people built this in one day." / "Two interviews. Unedited." An impact at 174.76 and the bed back up to 0.55. The loop was already re-armed by the NEXT lower third, so the card only names the chapter. |
| **Interviews with pull-quote cards** | Scenes E and F | Both clips run full length at their own audio (1.0) with the bed at 0.06. Lower thirds, name cards, and quote cards at the clip-relative offsets in the table keep text on screen; the two marked *quote* per interview are verbatim as transcribed. |
| **Handoff card instead of an outro** | Scene G, 6:25.89–6:32.0 | Zack's last line ("This is a ridiculous time to live in.", clip +82.2–89.5) runs to the end of his clip; an impact at 385.89 cuts straight to brand art settling from 1.12x, the repo URL, and "Next → go break it yourself. Clone it, ask it for anything." 6.1 s, no recap, no thanks-for-watching. The sponsor row sits on the same card. |

## Shot list

How to read the table:

- **In / Out** are composition times as m:ss.s with raw seconds in
  parentheses. Sub-beat rows (C.1–C.12) are the overlay windows inside
  scene C; the underlying clip runs continuously through them and through
  the gaps between them.
- **Source timecodes** for `charles-demo` are clip seconds; composition
  time = 6.4 + clip time. Interview overlay offsets are clip-relative
  (`+s` from clip start).
- **Camera** coordinates are `(x, y)` punch-in targets in the 1920x1080
  frame; the multiplier is the zoom scale.
- **On-screen text** timings in parentheses are composition seconds.
  Captions marked *quote* are verbatim as transcribed; unmarked interview
  callouts are captions, not necessarily verbatim.
- `charles-demo` = `assets/footage/charles-demo-2026-09-12-1617.mp4`
  (CFR H.264 copy of the shared `.webm`, same length and resolution).

| # | In | Out | Scene | Source footage (file + source timecode) | Camera (punch-in target and scale) | On-screen text | Audio | Real vs. graphic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A** | 0:00.0 (0) | 0:02.4 (2.4) | Cold open — flash-forward | charles-demo @ 109.5–111.9 (dashboard already maximized) | slow push 1.5x toward the chart column (640, 420) over 2.4 s | "One sentence in." / "A real app out." (kinetic text) | impact at 0; bed 0.55 | real footage + kinetic text |
| **B** | 0:02.4 (2.4) | 0:06.4 (6.4) | Stakes card | typography on black over `dominic-banner-windows.png` at 28% | none | "No chatbox. No copy-paste." / "Two plain sentences. Two real apps. Installed on camera, unedited." / "Then: how five people built it in one day." | riser 3.9–6.4 | graphic |
| **C** | 0:06.4 (6.4) | 2:54.76 (174.76) | The demo — Charles's capture, full length | charles-demo 0–168.36 (comp = 6.4 + clip time) | see sub-beats C.1–C.12 | none at scene level — see sub-beats | bed 0.30 with swells at 33.2 and 115.2 | real agent, real runtime; overlays are captions only |
| C.1 | 0:06.8 (6.8) | 0:12.0 (12.0) | Desktop, chat open — Agent Chat welcome; nothing installed | charles-demo 0.4–5.6 | none | lower third: LIVE CAPTURE · one browser tab · nothing installed yet · 2:48, unedited | whoosh 6.4 | real footage; caption overlay |
| C.2 | 0:11.4 (11.4) | 0:21.4 (21.4) | Ask — first sentence typed into Agent Chat | charles-demo 5–15 | slow 1.55x push on the chat input (1190, 606) | "Plain English is the whole interface." (13.0–20.5) | 5 keyboard ticks 12.4–16.4 | real footage; caption overlay |
| C.3 | 0:21.4 (21.4) | 0:33.4 (33.4) | Materialize (streaming) — agent streams its plan; Installing Application pill | charles-demo 15–27 | 1.45x on chat text (1205, 300) held 9 s | "Nothing to copy. Nothing to paste. Nothing to run." (24.5–31.5) | whoosh 22 | real footage; caption overlay |
| C.4 | 0:33.4 (33.4) | 0:39.0 (39.0) | Materialize (install) — Calculator window opens; taskbar lists it | charles-demo 27–32.6 | 1.6x snap on the calculator (518, 395), held 4.5 s | "It didn't paste code. It shipped an app." (35.0–40.5) + lower third: `install_app` → source written to the VFS → compiled in the tab → window opens → taskbar lists it (37.0–41.5) | impact + chime 33.4; bed swell | real footage; caption overlay |
| C.5 | 0:44.0 (44.0) | 0:50.4 (50.4) | Use — digits pressed; display shows 41 | charles-demo 37.6–44 | 1.7x on the display (768, 300) | "A real Vue component, compiled in your tab. Not an iframe to somebody's server." (45.5–51.5); lower third: WINDOW MANAGER drag · minimize · close (56–61) | tick 45.4 | real footage; caption overlay |
| C.6 | 1:06.4 (66.4) | 1:24.4 (84.4) | Second ask — second sentence typed | charles-demo 60–78 | 1.5x push on chat input (1190, 606), 8 s in, 8 s hold | "Now the real test: not a widget — a whole analytics report." (70–78) | whoosh 67 | real footage; caption overlay |
| C.7 | 1:24.4 (84.4) | 1:51.4 (111.4) | Generation (27 s) — agent generates the dashboard | charles-demo 78–105 | 1.35x on chat text held 8 s (86–95.2) | "Twenty-seven seconds of generation. Unedited." (88–94); lower third: GENERATING a multi-view dashboard: providers · valuations · revenue · export (97–104); "Still one tab. Still one sentence." (104.5–110.5) | whoosh 86; riser 108.9–111.4 | real footage; caption overlay |
| C.8 | 1:51.4 (111.4) | 1:55.4 (115.4) | Report window appears — Frontier AI Financial Report window opens small | charles-demo 105–109 | 1.6x snap on the window (537, 280) | none | impact 111.4 | real footage |
| C.9 | 1:55.4 (115.4) | 2:11.0 (131) | Payoff — maximized dashboard fills the screen: charts, provider cards, export | charles-demo 109–124.6 | slow 1.15x push (700, 450) over 6 s | "Frontier AI Financial Report. From one sentence." (117–123); lower third: AGENT-AUTHORED charts · filters · provider cards · export (124–130) | chime + soft impact 115.4; bed swell 0.6 | real footage; caption overlay |
| C.10 | 2:11.0 (131) | 2:20.0 (140) | Provider cards — scrolling the report | charles-demo 124.6–133.6 | 1.5x on the right column (1500, 450) | "The chatbox test: a chat window shows code. DOMinic runs it." (133–140) | whoosh 131 | real footage; caption overlay |
| C.11 | 2:25.4 (145.4) | 2:29.4 (149.4) | Minimized — report minimized; desktop + chat visible | charles-demo 139–143 | 1.8x on the taskbar (230, 1059) | "Minimized. It's on the taskbar, like any app." (146–150) | whoosh 146.2 | real footage; caption overlay |
| C.12 | 2:30.4 (150.4) | 2:54.76 (174.76) | Reopened — report restored from the taskbar and explored to the end of the clip | charles-demo 144–168.36 | 1.35x slow push (600, 420) 160–170 | "Reopened from the taskbar." (151.5–157); "Two sentences. Two apps. One browser tab." (164–172); lower third: NEXT how five people — and a swarm of agents — built this in one day (170.5–174.5) | whoosh 150.4; riser 172.3 | real footage; caption overlay |
| **D** | 2:54.76 (174.76) | 2:56.76 (176.76) | Chapter card | typography on black | none | "How five people built this in one day." / "Two interviews. Unedited." | impact 174.76; bed 0.55 | graphic |
| **E** | 2:56.76 (176.76) | 4:54.89 (294.89) | Interview 1 — Charles (full, unedited, 118.13 s) | `DJI_20260912_155301_60` 0–118.13, native 16:9, own audio | none | +0.4–8 lower third: HOW IT WAS BUILT · Hackathon floor · Columbus · 3:53 PM · +34–41 name card: Charles · Team DOMinic · +39.6–47 *quote, as transcribed*: "I don't want to show you what we're working on. I want to talk about how." · +53.2–61: A skill for GitHub issues and the GitHub CLI, so the agents coordinate their own development. · +72.6–80: OpenAI · Gemini · Anthropic agents — coordinating with each other. · +80.4–88: Issues #58, #59, #60 · dozens of PRs, reviewed and merged. · +95.9–102: An agent ran a Playwright test pass and filed new issues from the screenshots. · +102–110.5 *quote, as transcribed*: "A team of agents, very loosely supervised, produced a complex project." | clip audio 1.0; bed 0.06; whoosh 176.76 | real footage; overlays are captions |
| **F** | 4:54.89 (294.89) | 6:25.89 (385.89) | Interview 2 — Zack, team lead (full, unedited, 91.0 s) | `DJI_20260912_155508_62` 0–91.0, native 16:9, own audio | none | +0.6–8 name card: Zack · Team lead · DOMinic · +8.5–14 lower third: WHAT IT IS · the idea, the architecture, the agents · +12.8–27.5: A web-based OS in a browser, so agents communicate not in text, but in application implementations. · +30.5–39.5: Largest challenge: everyone in parallel — with agents that implement faster than we can. · +48.2–60: The agents coordinate through GitHub issues — one master control issue. · +61.4–70: They create issues, reserve them, open PRs, review them, and merge. · +70.3–79.8 *quote, as transcribed*: "An entire automated development team." · +82.2–89.5 *quote, as transcribed*: "This is a ridiculous time to live in." | clip audio 1.0; bed 0.06; whoosh 294.89 | real footage; overlays are captions |
| **G** | 6:25.89 (385.89) | 6:32.0 (392) | Close + handoff | `dominic-banner-d.png` (brand art) over the grid background | art settles from 1.12x | "The desktop where the agent writes the apps." / github.com/xcjs/DOMinic / "Next → go break it yourself. Clone it, ask it for anything." / sponsor row: AGENTS, EVERYWHERE · AI TINKERERS COLUMBUS · GDG COLUMBUS · OPENAI · COPILOTKIT · OPENROUTER · EXA · AUTH0 · MOZILLA · TRIGGER.DEV · REV1 VENTURES · TEAMCLAWS · AMBIGUOUS AI | impact 385.89; whoosh 388.9; bed 0.7 | graphic |

Notes on the numbers:

- Some caption windows outlast their sub-beat (C.4's caption runs to 40.5;
  C.5's WINDOW MANAGER lower third runs 56–61, after the punch-in has
  released). These are as authored, not errors: the caption clock and the
  camera clock are independent.
- C.1 and C.2 overlap by 0.6 s (12.0 vs. 11.4): the lower third is still
  fading as the push on the chat input begins.
- Between sub-beats (0:39.0–0:44.0, 0:50.4–1:06.4, 2:20.0–2:25.4 and
  2:29.4–2:30.4) the clip keeps playing with no camera move; a caption
  from the previous sub-beat may still be on screen, per the first bullet.
  Per the beats-in-clip list, the calculator
  is in use through clip 37–60 (display shows 41 at 39 and 42 at 54, i.e.
  comp 45.4 and 60.4).

### Beat map — Charles's capture (clip → composition)

Every event the composition keys on, in clip seconds and composition
seconds (comp = clip + 6.4). This is the cross-check for the sub-beat rows
above.

| Event in the clip | Clip s | Comp s | Comp m:ss.s |
| --- | --- | --- | --- |
| Typing starts | 5 | 11.4 | 0:11.4 |
| First prompt sent | 15 | 21.4 | 0:21.4 |
| Calculator installs and opens | 27 | 33.4 | 0:33.4 |
| Calculator used (shows 41 at 39, 42 at 54) | 37–60 | 43.4–66.4 | 0:43.4–1:06.4 |
| Second prompt typed | 60–78 | 66.4–84.4 | 1:06.4–1:24.4 |
| Generation (about 27 s) | 78–105 | 84.4–111.4 | 1:24.4–1:51.4 |
| Report window appears | 105 | 111.4 | 1:51.4 |
| Report maximized | 109 | 115.4 | 1:55.4 |
| Minimized to taskbar | 139–143 | 145.4–149.4 | 2:25.4–2:29.4 |
| Reopened | 144 | 150.4 | 2:30.4 |
| End of clip | 168.36 | 174.76 | 2:54.76 |

### What the captions claim, and where the claim is grounded

- C.4's lower third — `install_app` → source written to the VFS →
  compiled in the tab → window opens → taskbar lists it — is the golden
  path of [[ADR 0010 - Agent app interface and tool protocol]] (the
  `install_app` tool), [[ADR 0007 - Virtual filesystem with pluggable storage drivers]]
  (`/apps/<id>/index.vue` written to the VFS), and
  [[ADR 0006 - Agent-authored runtime-compiled components]] (in-browser
  SFC compile), in that order.
- C.5's "A real Vue component, compiled in your tab. Not an iframe to
  somebody's server." is the ADR 0006 claim stated for a viewer.
- C.10's "The chatbox test: a chat window shows code. DOMinic runs it." is
  the criterion-2 argument from [[Judging Rubric & Win Strategy]] and the
  line [[Demo Path]] asked to be said out loud once.
- C.11 and C.12 (minimize to the taskbar, restore from it) are the
  on-camera "installed" proof [[Demo Path]] requires: the taskbar is how a
  judge sees an app exists.
- The interviews' references to GitHub-issue coordination, issues #58,
  #59, #60, and PR review by agents point at the repo tour in
  [[Judges Walkthrough]].
- Beats [[Demo Path]] planned that are *not* called out in this shot list
  (Persist via a tab reload, Update via `update_app`, Recover, Any model):
  whether they occur anywhere inside the uncut capture is not verified
  from the shot list; the sub-beats above are the only moments the
  composition keys on.

## Assets

### Used

| File | Role | Provenance and notes |
| --- | --- | --- |
| `assets/footage/charles-demo-2026-09-12-1617.mp4` | Footage — scene A (flash-forward, clip 109.5–111.9) and scene C (full clip) | Constant-frame-rate H.264 copy of Drive `DOMinic/Charles/Screencast from 2026-09-12 16-17-22.webm` (2256x1504 3:2, VP8, variable frame rate, no audio, 168.36 s), same resolution and length; made only for reliable frame extraction. No cut, crop, or speed change. Framed 16:9 from the bottom (`object-fit: cover`, `object-position: 50% 100%`). |
| Drive `DOMinic/DJI_20260912_155301_60_null_video.mp4` | Footage — scene E, Interview 1 (Charles, with mic; an off-camera interviewer opens the clip) | Stored 1080x1920 with a 90-degree rotation flag = displays 1920x1080 16:9; 30 fps; stereo audio; 118.13 s. Shown in full at its own audio. Local path inside the composition: not verified. |
| Drive `DOMinic/DJI_20260912_155508_62_null_video.mp4` | Footage — scene F, Interview 2 (Zack, team lead) | Stored 1080x1920 with a 90-degree rotation flag = displays 1920x1080 16:9; 120 fps; stereo audio; 91.0 s. Shown in full at its own audio. Local path inside the composition: not verified. |
| `assets/brand/dominic-banner-d.png` | Brand art — scene G close background | Drive `VeniceAI_ajsBfDh.png`, 1584x672. Settles from 1.12x over the grid background. |
| `assets/brand/dominic-banner-windows.png` | Brand art — scene B stakes-card background at 28% opacity | Drive `VeniceAI_bja5c3V.png`, 1584x672. |
| `assets/audio/bed-synth-pulse-long.wav` | Synthesized audio — music bed | 120 BPM synth pulse synthesized with ffmpeg `aevalsrc`; no licensed music. Levels: 0.55 at the open, 0.30 under the demo (swells at 33.2 and 115.2, to 0.6 at the payoff), 0.06 under the interviews, 0.7 at the close. |
| impact, riser, whoosh, tick, chime | Synthesized audio — SFX | All synthesized with ffmpeg; cues per scene are in the shot list. Individual file paths: not verified. |
| Interview clips' own stereo tracks | Audio — dialogue | Each at full level (1.0) under its own scene. |

### Deliberately not used

| Shared file or artifact | Why it is not in the cut |
| --- | --- |
| Drive `2026-09-12-15-46 ‹name› 1 early playthrough.mov` | Terminal screen recording. The producer asked for interview footage and our own captures only. (The word elided from this filename and the next is a team member's surname.) |
| Drive `2026-09-12-15-47 ‹name› 2 process.mov` | Same — terminal screen recording. |
| Drive `Charles/Screencast from 2026-09-12 15-33-35.webm` | Playwright test-run recording; superseded by Charles's 16:17 working demo. |
| Repo `docs/assets` JPG screenshots | Removed after v1; the final cut uses no stills of the UI. |
| Our own Playwright captures of the scripted demo / mock-showcase build | Replaced by Charles's real-agent capture. |
| Branch `demo/mock-showcase` (commit `0ea677b`, worktree `project-files/DOMinic-demo`) | Exists, but nothing from it appears in the final video. |
| 8 more VeniceAI logo variants on the Drive | Only `VeniceAI_ajsBfDh.png` and `VeniceAI_bja5c3V.png` are used. |

## How to re-render

From the repository root:

```sh
cd project-files/dominic-video && npm run check && npx --yes hyperframes@0.8.36 render --output out/dominic-demo-v4.mp4
```

`npm run check` runs first and must pass; the render then writes
`out/dominic-demo-v4.mp4` from `index.html` at the composition's declared
1920x1080 @ 30 fps and 392 s. Pin the HyperFrames version as shown
(`0.8.36`) — that is the version the composition was authored against.

## Related

- [[Demo Video — Scenes]] — the prose companion: what the viewer sees and
  hears in each scene, and the retention principle it serves
- [[Demo Path]] — the beat plan this cut descends from
- [[Judging Rubric & Win Strategy]] — why the chatbox test is the spine
- [[Judges Walkthrough]] — the repo tour the interviews point at
- [[ADR 0006 - Agent-authored runtime-compiled components]] ·
  [[ADR 0007 - Virtual filesystem with pluggable storage drivers]] ·
  [[ADR 0010 - Agent app interface and tool protocol]] — the three
  decisions the C.4 lower third names, in order
