---
type: reference
title: Repo Map
description: File-by-file inventory of github.com/xcjs/DOMinic at be8645f — the shipped tree, tech stack, contributors, branches, and PR shape.
tags: [dominic, repo, inventory]
repo: https://github.com/xcjs/DOMinic
repo_head: "be8645f"
ingested: 2026-09-12
refreshed: 2026-09-12T23:40:00Z
---

# Repo Map

Snapshot of `origin/main` at `be8645f` (post-sprint). Back to [[DOMinic Home]].

## At a glance

| | |
| --- | --- |
| Application code | Nuxt 4 + Vue 3 app, live on `main` (whole demo loop works) |
| Commits on `main` | 76 (see [[Commit Timeline]]); merged PRs #1–#76 |
| Languages | TypeScript, Vue SFC, Markdown; server route in Nitro |
| Runtime | Node 24 LTS (`.nvmrc` `24.21.0`, `engines >=24.21 <25`) — ADR 0011 |
| Licence | AGPL-3.0-or-later (`LICENSE`) |
| CI | GitHub Actions: markdownlint + `nuxt typecheck` + `nuxt build` on PRs |
| Branch protection | `main` protected; squash-merge; one non-author approval required |

## Directory tree (code)

```
DOMinic/
├── .nvmrc  .gitattributes  .editorconfig  .gitignore  .markdownlint.jsonc  LICENSE
├── .github/workflows/ci.yml        markdownlint + typecheck + build
├── .husky/pre-commit               npm run lint:md
├── .claude/skills/coordinate/      SKILL.md, references/protocol.md (v2), scripts/coord.sh + coord.ps1
├── nuxt.config.ts  tsconfig.json  package.json  package-lock.json
├── app/
│   ├── app.vue                     composition root: hydrate, render windows, mount taskbar, __dominic hooks
│   └── features/
│       ├── os/        stores/os.ts · components/{WindowFrame,Taskbar}.vue
│       ├── chat/      components/ChatWindow.vue · composables/useAgentChat.ts · prompts/systemPrompt.ts
│       │              · tools/schemas.ts · types/chat.ts · stores/chat.ts (unused)
│       ├── apps/      runner/{DynamicAppRunner.vue,loader.ts} · registry/registry.ts
│       │              · fixtures/{index.ts,pomodoro-timer/index.vue.txt,manifest.json} · stores/apps.ts
│       ├── settings/  components/SettingsApp.vue · stores/settings.ts
│       └── shared/    vfs.ts · types/vue3-sfc-loader.d.ts
└── server/api/chat.post.ts         Vercel AI SDK streamText + install_app/update_app tools
```

## Directory tree (docs)

```
docs/
├── JUDGES.md                       five-minute judge tour → [[Judges Walkthrough]]
├── submission-form.md              portal answers → [[Submission Form Draft]]
├── images/desktop.png              README hero (added #76)
├── assets/01–04*.jpg               JUDGES.md screenshots
├── adrs/                           0000–0011 + README + template  → vault ADRs/
├── agents/
│   ├── use-okf.md                  → [[OKF Frontmatter Convention]] + [[OKF v0.2 Specification]]
│   ├── rubric.md  demo-path.md     → [[Judging Rubric & Win Strategy]] · [[Demo Path]]
│   ├── coordination.md             → [[Agent Coordination over GitHub Issues]]
│   └── coordination-best-practices{,-2,-3}.md   → Coordination/ v1, v2, v3
├── research/                       Q01 question + 3 answers → [[Coordination Research (Q01)]]
└── superpowers/
    ├── specs/  adr-scaffold-design · adr-series-design · custom-openai-compatible-provider-design
    └── plans/  adr-scaffold · adr-series · hackathon-finish · custom-openai-compatible-provider
```

## Tech stack (from `package.json`)

| Concern | Choice |
| --- | --- |
| Framework | Nuxt 4 (Vue 3), server route `/api/chat` |
| State | Pinia (`os` setup store; others option style) |
| Styling | Tailwind via `@nuxtjs/tailwindcss` (build) + Play CDN (runtime classes) |
| Window drag | raw pointer events in `WindowFrame.vue` (not `@vueuse/core useDraggable`) |
| Icons / delight | `lucide-vue-next`, `canvas-confetti` |
| Agent | Vercel AI SDK `ai@^4` + `@ai-sdk/openai\|anthropic\|google @^1`; DeepSeek + custom via OpenAI adapter |
| Runtime compile | `vue3-sfc-loader`; `esm.sh/<pkg>?bundle` for unknown imports |
| Storage | `localStorage` behind `shared/vfs.ts` |
| Types / lint | `strict` tsconfig, `vue-tsc`; markdownlint-cli2; husky |
| Runtime | Node 24 LTS |

## People (merged-PR record)

| Name / handle | Role | Evidence |
| --- | --- | --- |
| Zackary Lowery (`xcjs`) | Lead / architect / merge gate | ADRs 0000–0009, scaffold #21, shell #24, deps #29, CI #67, custom provider #70, coord PS port #36 |
| Charles Sullivan (`Sullux`, agent `pi`) | Chat, runtime, persistence | golden paths + ADR 0010 #2, `/api/chat` #20, runner #25, VFS/registry/Settings #27, fixture #40, Recover #64 |
| Justin (`ImNewToC0de`, agent Codex) | Integration | core-loop wiring #35, window-control fix #45, typecheck split #48, taskbar #56, style cleanup #62, update-context #66 |
| Michael Vawter (`m-vawter`) | Docs / process | rubric #1, demo-path #3/#4, playbooks #18/#26/#68, README #28, finish plan #37, JUDGES #53, smoke fixes #63 |
| Brandon (`r0073d-l053r`, this vault) | Coordination / fixes / video | `/coordinate` #7, model presets #39, Tailwind+history #42, ADR as-built #55, hub fix #57, demo video |

Agents in the frontmatter record: `agent/pi` (Charles), `Codex/gpt-5` (Justin), `opencode/glm` (Zack), `claude-code/claude-fable-5.1` (Brandon/Michael). See [[Coordination Protocol]].

## Branches at ingest

`main` plus unmerged/feature branches left behind after squash-merge: `demo/mock-showcase` (the deterministic `?demo=1` fallback demo — see [[Demo Video — Scenes]]), `docs/wrap-up`, and a scatter of already-merged `codex/*`, `docs/*`, `feat/*`, `fix/*`, `ci/*`, `chore/*` branches GitHub keeps until pruned. The live history is [[Commit Timeline]].

## File → vault note

ADRs 0000–0011 → `ADRs/`. `README.md` → [[README (repo)]]. `NEXT.md` → [[Post-Hackathon Roadmap (NEXT)]]. `QUESTIONS.md` → [[Open Questions Register (QUESTIONS)]]. `docs/JUDGES.md` → [[Judges Walkthrough]]. `docs/submission-form.md` → [[Submission Form Draft]]. `docs/agents/*` → [[Judging Rubric & Win Strategy]], [[Demo Path]], [[OKF Frontmatter Convention]], and the Coordination folder. `docs/research/` → [[Coordination Research (Q01)]]. `docs/superpowers/*` → `Specs & Plans/`. Config files → `Repo Config/` (summarized in [[Markdown Lint & CI]]).
