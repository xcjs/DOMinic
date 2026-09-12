---
type: README
title: DOMinic
description: A web-based desktop operating system where an AI agent authors the apps.
tags: [os, agent, vue, nuxt]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# DOMinic

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

There is no application code yet — the repository currently carries
the decision record for every foundational choice.

## Documentation

| Path | Contents |
| --- | --- |
| [docs/adrs/](docs/adrs/README.md) | Architecture decision records (MADR 4.0) |
| [docs/agents/use-okf.md](docs/agents/use-okf.md) | OKF v0.2 frontmatter convention for docs |
| [docs/agents/rubric.md](docs/agents/rubric.md) | Hackathon judging rubric and win strategy |
| [docs/superpowers/specs/](docs/superpowers/specs/) | Design specs from brainstorming sessions |
| [docs/superpowers/plans/](docs/superpowers/plans/) | Implementation plans derived from specs |

### Decision highlights

The accepted ADR series fixes the platform's foundations:

- [0001](docs/adrs/0001-feature-slices-with-domain-driven-organization.md)
  Feature slices with domain-driven organization
- [0002](docs/adrs/0002-strict-typescript-and-lint-toolchain.md)
  Strict TypeScript and lint toolchain
- [0003](docs/adrs/0003-pinia-per-domain-stores.md)
  Pinia per-domain stores
- [0004](docs/adrs/0004-dominic-os-shell-and-taskbar.md)
  DOMinic OS shell and taskbar
- [0005](docs/adrs/0005-agent-chat-via-vercel-ai-sdk-with-server-side-provider-proxy.md)
  Agent chat via Vercel AI SDK with server-side provider proxy
- [0006](docs/adrs/0006-agent-authored-runtime-compiled-components.md)
  Agent-authored runtime-compiled components
- [0007](docs/adrs/0007-virtual-filesystem-with-pluggable-storage-drivers.md)
  Virtual filesystem with pluggable storage drivers
- [0008](docs/adrs/0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md)
  Runtime NPM dependency loading via esm.sh with vetting
- [0009](docs/adrs/0009-cors-first-networking-with-chrome-masking-proxy-fallback.md)
  CORS-first networking with Chrome-masking proxy fallback

## Development

This is a docs-only repository so far. Markdown is linted with
markdownlint-cli2 (80-column prose) and an OKF frontmatter block.

```bash
npm install
npm run lint:md
```

A pre-commit hook runs the lint automatically; write with the
conventions in [docs/agents/use-okf.md](docs/agents/use-okf.md) and
[docs/adrs/template.md](docs/adrs/template.md).
