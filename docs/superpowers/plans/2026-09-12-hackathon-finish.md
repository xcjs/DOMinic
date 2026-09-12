# Hackathon Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. Coordinate through
> `/coordinate` per `docs/agents/coordination-best-practices-2.md`.

**Goal:** Ship a working DOMinic core loop on `main`, film it, and
submit all five hackathon gates before the portal closes at 16:00 ET on
2026-09-12.

**Architecture:** Everything the demo needs already exists as slices on
`main` — chat and tools (#20), runtime runner and error boundary (#25),
VFS, registry and Settings (#27). What remains is the shell (PR #24),
the wiring (#30), one rehearsal (#32), and the submission package
(#8, #9, #10).

**Tech Stack:** Nuxt 4, Pinia, Vercel AI SDK v4, vue3-sfc-loader,
localStorage VFS; HyperFrames for the video; GitHub Issues and `gh` for
coordination.

**Spec:** `docs/agents/demo-path.md` (beats and cut order),
`docs/agents/rubric.md` (scoring and submission gates).

**Status at 14:56 ET:** shell (#24), deps (#29) and README (#28) merged
while this was written — Task 1 is done. `app/app.vue` is still the boot
placeholder; #30 is the critical path. 64 minutes remain.

## Global Constraints

- Sprint minimum from `coordination-best-practices-2.md`: one active
  claim, Files globs on every CLAIM, declare-then-proceed on seams,
  ping at 20 min and release at 30, comments on state change only.
- Tiny PRs into `main`; the owner merges. Never push a follow-up
  commit to an open PR — open a new one.
- Anything the camera never sees earns zero points today. Cut order:
  Hook, Ask, Materialize, Persist, Close are non-negotiable; Update,
  Recover, Control, Any model are stretch (`demo-path.md`).
- Markdown wraps at 80 columns; `npm run lint:md` gates every commit.
- Portal window 15:30–16:00 ET; the video is submitted as a public
  link.

## Timeline, working back from 16:00

| By | Milestone | Task |
| --- | --- | --- |
| 14:55 ✅ | PR #24 (shell) and PR #29 (deps, model IDs) merged | 1 |
| 15:20 | Core loop runs end to end on `main` | 2 |
| 15:30 | Prompt rehearsed three times and frozen; footage recorded | 3, 5 |
| 15:45 | Video rendered; public link live | 5 |
| 15:55 | All five gates submitted in the portal | 6 |

---

### Task 1: Merge the shell and the dependency fix

**Owner:** Zack (author); one more reviewer — Brandon or Michael.
**Issues:** #13, #22. **PRs:** #24, #29.

**Files:** `app/features/os/**`, `package.json`, `package-lock.json`,
`server/api/chat.post.ts`.

**Interfaces:**

- Consumes: nothing.
- Produces: taskbar, window manager, drag/focus/min/max/close (ADR 0004
  golden path); runtime deps for the chat slice and current default
  model IDs (ADR 0005, Q2.1).

- [x] **Step 1:** Second approval on #24 — check it against the ADR
  0004 golden-path list, not a deep review.
- [x] **Step 2:** Second approval on #29.
- [x] **Step 3:** Zack merges both; `main` CI green.

### Task 2: Wire the core loop (#30)

**Owner:** @ImNewToC0de, paired with Charles (author of #20, #25, #27).

**Files:** `app/app.vue`, `app/features/os/components/**`,
`app/features/chat/**`, `app/features/apps/**`.

**Interfaces:**

- Consumes: `install_app` and `update_app` tool results (ADR 0010),
  `DynamicAppRunner` (ADR 0006), VFS and registry (ADR 0007), shell
  windows and taskbar (ADR 0004).
- Produces: the demo golden path — ask → install_app → VFS write →
  registry → window opens → survives reload → update_app changes it in
  place.

- [ ] **Step 1:** Mount the shell in `app.vue`; Agent Chat as a
  floating window (Q1.1); Settings pre-installed.
- [ ] **Step 2:** `install_app` writes `/apps/<id>/index.vue` and
  `manifest.json`, registers the app, opens its window, and shows the
  installation badge and confetti (ADR 0010 lifecycle).
- [ ] **Step 3:** Boot hydration re-registers installed apps from
  `/apps/` into the launcher and taskbar (ADR 0007).
- [ ] **Step 4:** `update_app` replaces the source and re-renders the
  open window (Q2.2 context injection).
- [ ] **Step 5:** The error boundary's "Ask Agent to Fix" posts the
  trace back into the chat (ADR 0006).
- [ ] **Step 6:** Small PR per step where possible; merge to `main`;
  boot `main` and run the loop once — that is the integration
  checkpoint.

### Task 3: Rehearse and freeze the demo prompt (#32)

**Owner:** integration (rehearsal); ws:docs (record).

**Files:** `docs/agents/demo-path.md`.

- [ ] **Step 1:** Choose the core-loop app — pomodoro / focus timer
  unless it misbehaves; kanban is the alternate (Q5.1, `demo-path.md`).
- [ ] **Step 2:** Run the exact prompt three times on `main`; it must
  install, open, survive a reload, and take one `update_app` change.
- [ ] **Step 3:** Post the frozen prompt and app name on #32; ws:docs
  commits them into `demo-path.md` ("Chosen app", "Exact prompt") and
  never edits them again.

### Task 4: Stretch — only if Task 2 is done by 15:20

**Owner:** whoever is free. **Issues:** #33, #34, PR #31.

- [ ] **Step 1:** #33 — ship the pre-generated pomodoro fixture as the
  Persist-beat fallback (it was agent-authored; the narration says so).
- [ ] **Step 2:** #34 — Uninstall and View Source in the launcher
  (Control beat, criterion 4).
- [ ] **Step 3:** Close PR #31 (duplicates merged #27) or fold its
  deltas into #30.

### Task 5: Record, wrap, render, publish (#9)

**Owner:** ws:docs (Michael and Claude); a dev records.

**Files:** `~/DFIM/DOMinic-video/dominic-demo/` (outside the repo).

- [ ] **Step 1:** Record a 1920×1080 browser capture of the frozen
  loop, up to 100 s: ask → install → use → reload → update, then
  recover → control → settings if they exist. Two takes. AirDrop
  `demo.mp4` to Michael.
- [ ] **Step 2:** Save it as `assets/demo.mp4`; set the caption
  `data-start` and `data-duration` values in `index.html` to the
  footage.
- [ ] **Step 3:** Gate and render:

  ```bash
  npm run check
  npx hyperframes render --video-frame-format png -o out/dominic-demo.mp4
  ```

- [ ] **Step 4:** Upload to YouTube as Public from the agreed account;
  confirm it plays logged out; paste the link into the submission
  draft.

### Task 6: Submit all five gates (#8, #10)

**Owner:** ws:docs.

**Files:** `README.md`; the submission draft held by Michael
(`~/DFIM/DOMinic-research/submission/2026-09-12-submission-drafts.md`).

- [x] **Step 1:** Merge PR #28 (README quickstart) — merged 14:54.
- [ ] **Step 2:** At freeze, open one tiny PR adding the sentence that
  states exactly what runs in the video and what is deferred to
  `NEXT.md`.
- [ ] **Step 3:** Fill the draft's blanks: demo-app name, the "what
  runs" line, the video link, confirmed sponsor handles.
- [ ] **Step 4:** Publish the social post with sponsor tags.
- [ ] **Step 5:** Submit title, description, repo, video link, and the
  post in the portal before 15:55. Post DONE on #8, #9, #10.

### Task 7: After 16:00 — operations

**Owner:** ws:docs; Brandon for the skill.

- [ ] **Step 1:** Restore the full protocol — the "Full" column in
  `coordination-best-practices-2.md`.
- [ ] **Step 2:** Merge #19 replies into `coordination-best-practices-3.md`;
  close #19 and #6.
- [ ] **Step 3:** Brandon: script defaults proposed on #6 (two-stage
  lease, one claim, two rounds, ping before release); fix the
  SKILL.md and protocol.md cap contradiction and the comment matcher.
- [ ] **Step 4:** Select `NEXT.md` items for ADRs 0011 and up.
