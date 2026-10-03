---
type: index
title: DOMinic Home
description: Entry point for everything ingested from the DOMinic hackathon repo — final state after the 2026-09-12 sprint.
tags: [dominic, hackathon, moc]
repo: https://github.com/xcjs/DOMinic
repo_head: "0fc772d"
ingested: 2026-09-12
refreshed: 2026-10-03T00:10:00Z
---

# DOMinic Home

> **DOMinic** — a web-based desktop operating system running in a browser tab, where an AI agent is the primary app author: you describe an app in plain English, and it is written, compiled, installed to the taskbar, and kept across reloads like first-party software.

Built by a five-engineer team (plus their coding agents) for the **AI Tinkerers Columbus "Agents, Everywhere: Bots, Channels & More" global hackathon**, 2026-09-12. The build sprint ran ~1:00–4:00 PM ET; the portal closed at 4:00. This vault mirrors the public repo `xcjs/DOMinic`.

> [!info] 2026-10-02 — post-hackathon mode
> **Merged:** #77 rewrote `NEXT.md` as the sequenced roadmap with a lane per collaborator; #78 added **ADR 0012 — End of the hackathon scope** (golden paths historical, five-slice/mixed-store baseline accepted, coordination on v3's full protocol). **This vault now lives in the repo** (`vault/`, ADR 0013) so every agent and machine shares it; the work loop (`npm run loop`) writes `Milestones/` and `Sessions/` and refreshes the blocks below. Run `npm run loop -- resume` first in any new session.

> [!success] Final sprint state at `be8645f` — the core loop ships
> The demo golden path works end to end on `main`: **ask → `install_app` → SFC written to the VFS + registered → window opens with the compiled app → survives reload → `update_app` changes it in place → "Ask Agent to Fix" repairs a crash.** Charles's 15:08 rehearsal passed all five non-negotiable beats. 76 PRs merged. What remained a human step at the buzzer was recording/uploading the 2-minute video (see [[Submission Form Draft]] for the TODO fields). The [[Demo Video — Shot List|finished video]] was cut separately in HyperFrames.

## What shipped (one line each)

- **The shell** — desktop with a bottom [[Architecture Overview|taskbar]] that lists installed apps (running dot, View Source, Uninstall), draggable/min/max/close windows, a live clock, a Settings launcher.
- **The agent** — Agent Chat streams from `/api/chat` (Vercel AI SDK, `ai@4`); the model calls `install_app` / `update_app`; tools execute client-side through callbacks the shell injects.
- **The runtime** — `DynamicAppRunner` compiles agent-authored Vue SFCs in the browser with `vue3-sfc-loader`; unknown imports resolve from `esm.sh`; an error boundary offers **Ask Agent to Fix**.
- **Persistence** — a localStorage VFS holds each app's source + a `registry.json`; the launcher/taskbar re-hydrate on reload.
- **Providers** — OpenAI, Anthropic, Google, DeepSeek, and a **custom OpenAI-compatible** endpoint (base URL + model); keys are entered in Settings, sent per request, never at rest on the server.
- **Licence** — AGPL-3.0-or-later.

## Work loop

Agents run `node .claude/skills/work-loop/scripts/loop.mjs` (`npm run loop`) to take roadmap steps through `/coordinate`; the blocks below are rewritten by the script. See [[Roadmap Progress]] and the skill at `.claude/skills/work-loop/SKILL.md`.

### Roadmap progress

<!-- loop:progress -->
| Phase | Title | Done | Eligible now |
| --- | --- | --- | --- |
| 0 | Stabilize the floor | 0/6 | 0.1, 0.2, 0.3, 0.4, 0.5, 0.6 |
| 1 | Harden the two seams | 0/4 | gated |
| 2 | The agent product loop | 0/5 | gated |
| 3 | Reach | 0/7 | gated |

_Updated 2026-10-03T00:06:26Z by `claude-code/claude-fable-5.1/vault`._
<!-- /loop:progress -->

### Latest milestones

<!-- loop:milestones -->
- (none yet)
<!-- /loop:milestones -->

### Active sessions

<!-- loop:sessions -->
- (none yet)
<!-- /loop:sessions -->

## Start here

1. [[Architecture Overview]] — the system as built: five slices, the client-side tool protocol, the VFS, the runtime engine, and where the ADRs' golden path and the code diverge.
2. [[Repo Map]] — every file, the tech stack, contributors, branches, and the shape of the 76 PRs.
3. [[Judges Walkthrough]] — the five-minute repo tour (`docs/JUDGES.md`): the loop by file path, an ADR→code map, run instructions, and known limitations.
4. [[Submission Form Draft]] — the portal answers (project description, tools, per-author contribution record) with the video/social TODOs.
5. [[Open Questions & Gaps]] — the post-sprint retrospective: what shipped, what stayed deferred, and the honest caveats a judge will notice.
6. [[Post-Hackathon Roadmap (NEXT)]] — **the sequenced roadmap** (approved 2026-10-02, PR #77): north star, four phases with exit criteria, and a lane + reviewer rotation per collaborator.
7. [[Judging Rubric & Win Strategy]] → [[Demo Path]] — how points are scored and the eight video beats.
8. [[Demo Video — Shot List]] · [[Demo Video — Scenes]] — the finished video: cue-level shot list and scene-by-scene real-footage-vs-graphic.
9. [[Coordination Protocol]] — how the agents divided the work over GitHub Issues (the `/coordinate` skill and the v1→v3 playbooks).

## Architecture Decision Records

MADR 4.0 + OKF v0.2 frontmatter. Since PR #2 each ADR's Decision Outcome carries **Hackathon POC (Golden Path)** / **Future** / **Open Questions** blocks, and since PR #55 an **As built (2026-09-12)** subsection reconciling the record with the code. **ADR 0012 (PR #78) ends the golden-path scoping:** those blocks are historical, each record's full Decision Outcome is the target again, and the roadmap sequences the rest. Conventions: [[ADR Conventions]]; template: [[ADR Template]]. Where an ADR and the code disagree, the code wins — the "as built" line below and each note's As-built section say how.

| # | Decision | As built on `main` |
| --- | --- | --- |
| [[ADR 0000 - Record architecture decisions\|0000]] | Use MADR 4.0 ADRs in `docs/adrs/` | 12 ADRs, 0000–0011 |
| [[ADR 0001 - Feature slices with domain-driven organization\|0001]] | Vertical feature slices + shared kernel | Five slices: `os`, `chat`, `apps`, `settings`, `shared` (not the ADR's `os/agent/apps`); boundaries by convention |
| [[ADR 0002 - Strict TypeScript and lint toolchain\|0002]] | TS strict + type-checked ESLint + vue-tsc | `strict` tsconfig; `nuxt typecheck` + build gated in CI (#67); **no ESLint**; pre-commit runs markdownlint only |
| [[ADR 0003 - Pinia per-domain stores\|0003]] | One Pinia setup-store per slice | Four stores (`os` setup; `chat`/`apps`/`settings` option); registry state is a module ref, not Pinia; `useChatStore` unused |
| [[ADR 0004 - DOMinic OS shell and taskbar\|0004]] | Desktop-metaphor shell, mobile-first | Desktop-only; drag via raw pointer events (not `useDraggable`); taskbar lists installed apps + clock; Settings launcher |
| [[ADR 0005 - Agent chat via Vercel AI SDK with server-side provider proxy\|0005]] | `/api/chat`, BYO key per request | `streamText` + tools; OpenAI/Anthropic/Google/DeepSeek/**custom**; env-var fallback for keys; models `gpt-5`/`claude-sonnet-5`/`gemini-2.5-pro` |
| [[ADR 0006 - Agent-authored runtime-compiled components\|0006]] | In-browser SFC compile via `vue3-sfc-loader` | `DynamicAppRunner` + `loader.ts`; error boundary with Ask Agent to Fix; styles tagged `data-app-id` and cleaned on update/uninstall |
| [[ADR 0007 - Virtual filesystem with pluggable storage drivers\|0007]] | VFS interface over pluggable drivers | localStorage only; paths `apps/<id>/index.vue` + `registry.json` (no per-app `manifest.json`); boot hydration; Reset OS |
| [[ADR 0008 - Runtime NPM dependency loading via esm.sh with vetting\|0008]] | esm.sh behind a vetting gate | **No gate**; unknown imports → `esm.sh/<pkg>?bundle`; four host modules pre-resolved; prompt guardrails |
| [[ADR 0009 - CORS-first networking with Chrome-masking proxy fallback\|0009]] | Direct fetch + proxy fallback | Direct `fetch` only; **no proxy route** shipped (demo apps make no external calls) |
| [[ADR 0010 - Agent app interface and tool protocol\|0010]] | Structured tools + `DominicApp` contract | `install_app`/`update_app` (Zod); tools run **client-side via callbacks**; `update_app` gets the current source injected (#66); no `{windowId, appId}` props into the compiled app |
| [[ADR 0011 - Node 24 LTS runtime standard\|0011]] | Node 24 LTS pinned | `.nvmrc` `24.21.0`, `engines >=24.21.0 <25`, CI reads `node-version-file` |
| [[ADR 0012 - End of the hackathon scope\|0012]] | **New (PR #78).** Hackathon scoping ended | Golden paths historical; five-slice layout + mixed stores accepted (amends 0001/0003); full coordination protocol; `NEXT.md` governs deferred work |

## Team workstreams and who delivered

Five workstreams (README) mapped to the merged-PR record ([[Submission Form Draft#Team contributions|full list]]):

| SDE | Workstream | Lead of record |
| --- | --- | --- |
| 1 | OS Shell & Window Manager | Zack (`xcjs`) — scaffold #21, shell #24 |
| 2 | Agent Chat & Tool Calling | Charles (`Sullux`) — `/api/chat` #20, Recover beat #64 |
| 3 | Runtime App Engine | Charles — runner #25; Justin style cleanup #62 |
| 4 | Persistence & App Registry | Charles — VFS/registry/Settings #27 |
| 5 | Integration, Polish & Demos | Justin (`ImNewToC0de`) — wiring #35, taskbar #56, update-context #66 |
| — | Docs, process, coordination | Michael (`m-vawter`) — rubric/demo-path/playbooks/README/JUDGES; Brandon (`r0073d-l053r`) — `/coordinate`, model presets #39, Tailwind+history #42, ADR as-built #55, demo video |

## Conventions

- [[OKF Frontmatter Convention]] — every doc carries Google OKF v0.2 YAML frontmatter; [[OKF v0.2 Specification]] is the full spec.
- [[Markdown Lint & CI]] — markdownlint at 80 columns (husky + Actions), plus typecheck/build in CI; Node 24; `main` branch-protected, requires one non-author approval.

## Provenance

- [[Spec - ADR Scaffold Design]] → [[Plan - ADR Scaffold]] — produced ADR 0000, template, README.
- [[Spec - ADR Series Design]] → [[Plan - ADR Series]] — produced the *original* ADRs 0001–0009.
- [[Spec - Custom OpenAI Provider]] → [[Plan - Custom OpenAI Provider]] — the last feature spec, shipped as PR #70.
- [[Plan - Hackathon Finish]] — Michael's timeline to the 16:00 close (#37).
- [[Coordination Research (Q01)]] — the research question behind the coordination playbooks.
- [[Commit Timeline]] — all 76 commits; [[Repo Watch Log]] — dated record of what this vault's watch loop observed during the sprint.
- Raw config (package.json, nuxt.config, tsconfig, lint config, CI, husky, `.nvmrc`, `.gitattributes`, git log) in `Repo Config/`.

## Local paths

| What | Where |
| --- | --- |
| This vault | `vault/` inside the repo - shared by every agent and machine; open the folder in Obsidian |
| Remote | `https://github.com/xcjs/DOMinic.git` — `gh` authenticated with push access |
| Refresh this vault | `npm run loop -- vault-sync` after a pull (regenerates ADR/doc/plan/coordination notes, Commit Timeline, Repo Config); synthesis notes are edited by hand; `Milestones/` and `Sessions/` are written by the loop |
| Demo video | `project-files/dominic-video/` (HyperFrames, outside the repo) — see [[Demo Video — Shot List]] |
