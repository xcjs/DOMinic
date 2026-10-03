---
type: README
title: DOMinic
description: A web-based desktop operating system where an AI agent authors the apps.
tags: [os, agent, vue, nuxt]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
source: README.md
ingested: 2026-10-02
repo_head: 0fc772d
---

# DOMinic

![DOMinic desktop with the Agent Chat window open](docs/images/desktop.png)

A web-based desktop operating system running in a browser tab, where
an AI agent is the primary app author: the user talks, the agent
answers, and the apps it writes install, run, and persist like
first-party software.

## What DOMinic is

- A desktop-metaphor OS shell — window manager, taskbar, and app
  registry — that degrades cleanly to a bottom-nav sheet and stacked
  windows on phone viewports.
- A chat-driven agent surface that streams from virtually any LLM
  provider; users bring their own API keys, which stay in their
  browser and travel per-request, never at rest on a server.
- A platform for agent-authored apps: Vue single-file components
  compiled at runtime in the browser, persisting their source in a
  virtual filesystem and loading npm dependencies from a vetted ESM
  CDN.

The hackathon proof of concept shipped the whole core loop; the project
now follows the sequenced roadmap in [[Post-Hackathon Roadmap (NEXT)|NEXT.md]]. See
[Running DOMinic](#running-dominic) to start it, and the decision
records below for why it is built this way.

## Documentation

| Path | Contents |
| --- | --- |
| [[Judges Walkthrough|docs/JUDGES.md]] | **Judges start here:** five-minute tour of the demo, the code behind it, and what is deferred |
| [[ADR Conventions|docs/adrs/]] | Architecture decision records (MADR 4.0) |
| [[Post-Hackathon Roadmap (NEXT)|NEXT.md]] | Sequenced roadmap, collaborator lanes, and the issue -> PR -> merge loop |
| [[Open Questions Register (QUESTIONS)|QUESTIONS.md]] | Open questions register with post-hackathon outcomes |
| [[OKF Frontmatter Convention|docs/agents/use-okf.md]] | OKF v0.2 frontmatter convention for docs |
| [[Judging Rubric & Win Strategy|docs/agents/rubric.md]] | Hackathon judging rubric and win strategy |
| [[Demo Path|docs/agents/demo-path.md]] | The two-minute demo as rubric-mapped beats |
| [[Agent Coordination over GitHub Issues|docs/agents/coordination.md]] | Multi-agent task coordination over GitHub Issues (`/coordinate`) |
| [docs/agents/work-loop.md](docs/agents/work-loop.md) | The work loop: any agent takes the next roadmap step via `/coordinate` (`npm run loop`) |
| [vault/](vault/DOMinic%20Home.md) | The project's second brain (Obsidian): milestones, sessions, ingested docs |
| [[Coordination Best Practices v1|docs/agents/coordination-best-practices.md]] | Coordination playbook v1 (superseded; kept for the record) |
| [[Coordination Best Practices v2|docs/agents/coordination-best-practices-2.md]] | Coordination playbook v2 (superseded; kept for the record) |
| [[Coordination Best Practices v3|docs/agents/coordination-best-practices-3.md]] | Active coordination playbook — sprint evidence and enforceable invariants |
| [[Spec - ADR Series Design|docs/superpowers/specs/]] | Design specs from brainstorming sessions |
| [[Plan - ADR Series|docs/superpowers/plans/]] | Implementation plans derived from specs |
| [[Coordination Research (Q01)|docs/research/]] | The Q01 question and its three answers behind the coordination playbooks |

### Decision highlights

The accepted ADR series establishes the platform's foundations. Each
record carries a hackathon golden path (historical since ADR 0012) and
an as-built reconciliation:

- [[ADR 0001 - Feature slices with domain-driven organization|0001]]
  Feature slices with domain-driven organization
- [[ADR 0002 - Strict TypeScript and lint toolchain|0002]]
  Strict TypeScript and lint toolchain
- [[ADR 0003 - Pinia per-domain stores|0003]]
  Pinia per-domain stores
- [[ADR 0004 - DOMinic OS shell and taskbar|0004]]
  DOMinic OS shell and taskbar
- [[ADR 0005 - Agent chat via Vercel AI SDK with server-side provider proxy|0005]]
  Agent chat via Vercel AI SDK with server-side provider proxy
- [[ADR 0006 - Agent-authored runtime-compiled components|0006]]
  Agent-authored runtime-compiled components
- [[ADR 0007 - Virtual filesystem with pluggable storage drivers|0007]]
  Virtual filesystem with pluggable storage drivers
- [[ADR 0008 - Runtime NPM dependency loading via esm.sh with vetting|0008]]
  Runtime NPM dependency loading via esm.sh with vetting
- [[ADR 0009 - CORS-first networking with Chrome-masking proxy fallback|0009]]
  CORS-first networking with Chrome-masking proxy fallback
- [[ADR 0010 - Agent app interface and tool protocol|0010]]
  Agent app interface and tool protocol
- [[ADR 0011 - Node 24 LTS runtime standard|0011]]
  Node 24 LTS runtime standard
- [[ADR 0012 - End of the hackathon scope|0012]]
  End of the hackathon scope

## Roles

Development continues part-time with a lane per collaborator - the
paths they own, their roadmap steps, and a reviewer rotation - defined
in [[Post-Hackathon Roadmap (NEXT)#roles-and-working-agreement|NEXT.md]]. The hackathon's
five workstreams are recorded in the git history and in
[[Submission Form Draft|docs/submission-form.md]].

## Running DOMinic

```bash
npm install
npm run dev          # Nuxt dev server, default http://localhost:3000
```

Open **Settings** from the taskbar and paste an API key for your model
provider. The key stays in your browser and travels per request; the
server never stores it (ADR 0005). Then open the Agent Chat and
describe an app: it is written, compiled in the browser, installed
to the taskbar, and kept across reloads.

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint:md`.

## Development

Markdown is linted with markdownlint-cli2 (80-column prose) and
carries OKF frontmatter.
Node 24 LTS is the standard runtime — see
[[ADR 0011 - Node 24 LTS runtime standard|ADR 0011]]; `nvm use`
picks it up from the checked-in `.nvmrc`.

```bash
npm install
npm run lint:md
```

A pre-commit hook runs the lint automatically; write with the
conventions in [[OKF Frontmatter Convention|docs/agents/use-okf.md]] and
[[ADR Template|docs/adrs/template.md]].

## License

DOMinic is licensed under the
[[LICENSE (AGPL-3.0)|GNU Affero General Public License v3.0 or later]]
(AGPL-3.0-or-later). Since DOMinic is a network-run application,
section 13 of the AGPL requires that users interacting with it over a
network are offered the corresponding source.
