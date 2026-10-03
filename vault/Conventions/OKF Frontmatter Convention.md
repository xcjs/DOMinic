---
type: convention
title: Use Google's Open Knowledge Format (OKF)
tags: [okf, convention, agents]
source: docs/agents/use-okf.md
ingested: 2026-10-02
repo_head: 0fc772d
---
# Use Google's Open Knowledge Format (OKF)

All agents working in this repository SHOULD author, maintain, and consume
project knowledge using Google's Open Knowledge Format (OKF) v0.2.

## Why OKF

- **Plain markdown + YAML frontmatter.** No SDK, no query language, no
  lock-in. If you can `cat` a file, you can read it.
- **Version-controllable.** Knowledge lives in git alongside the code,
  so it can be reviewed, diffed, and blamed like everything else.
- **Trust built in.** Provenance (`sources`), verification (`generated`,
  `verified`), and freshness (`status`, `stale_after`) are first-class
  frontmatter fields, so agent-maintained knowledge stays auditable.
- **Vendor-neutral.** Not tied to any agent framework, model provider,
  or serving system.

## What agents should do

1. Represent durable knowledge (schemas, metrics, playbooks, references,
   decisions context) as OKF concepts: one markdown document per concept,
   with YAML frontmatter carrying at minimum a `type` field.
2. Prefer structured markdown in the body (headings, lists, tables,
   fenced code blocks) over freeform prose.
3. Record provenance and trust fields when knowledge is generated or
   confirmed, using the actor convention (`agent/version`, `human:<id>`,
   `process:<id>`).
4. Cross-link concepts with standard markdown links and keep an
   `index.md` in each directory for progressive disclosure.

## Reference specification

The complete, self-contained OKF v0.2 specification is embedded below
verbatim (preformatted to preserve the source exactly). The canonical
home is
[GoogleCloudPlatform/open-knowledge-format](https://github.com/GoogleCloudPlatform/open-knowledge-format).

> [!note] Embedded specification
> The repo file embeds the full OKF v0.2 spec verbatim inside a fenced block. In this vault it lives as its own note: [[OKF v0.2 Specification]].
