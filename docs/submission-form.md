---
type: submission
title: Hackathon Submission Form Draft
description: Ready-to-paste answers for the AI Tinkerers Columbus "Agents, Everywhere" submission form.
tags: [hackathon, submission, form]
generated: { by: opencode/glm-5.3-flash, at: 2026-09-12T19:20:00Z }
verified: { by: human:zack, at: 2026-09-12T19:20:00Z }
stale_after: 2026-09-13T00:00:00Z
---

# Hackathon submission form draft

Answers for the "DOMinic — Submit Your Project" form. Copy the text
under each heading into the matching field. Items marked with a
placeholder still need a human (video, post URL). Content is sourced
from the README, the ADRs, [the demo path](demo-path.md), and the git
history.

## Project name

DOMinic

## Project description

DOMinic is a web-based desktop operating system that runs in a single
browser tab, where an AI agent is the primary app author. You open
Agent Chat, describe an app in plain English — "build a synthwave
Pomodoro timer" — and the agent writes the Vue component, installs it
as a first-class desktop app with a taskbar and launcher entry, and
opens it in its own window. Your apps persist across reloads via a
virtual filesystem; ask for a change and the agent updates the app in
place; if an app throws, you click "Ask Agent to Fix" and the agent
repairs it.

The problem it solves: chatbots can show you code, but nowhere for it
to live and run. The desktop-OS context makes DOMinic meaningfully
more useful than a standalone chatbot — the shell gives the agent's
output a place to materialize as windows, persist between sessions,
and be updated in place, while the user keeps control (update in
place, uninstall, or view the source).

Technical execution: Nuxt 4 + Vue 3 with strict TypeScript, Tailwind
CSS, and Pinia per-domain stores. Agent chat runs on the Vercel AI
SDK with streaming chat and Zod-typed tool calling, proxied server
side (OpenAI, Anthropic, Google, DeepSeek; bring-your-own-key that
never rests on the server). Agent-authored apps are Vue single-file
components compiled at runtime in the browser with vue3-sfc-loader,
with npm dependencies loaded at runtime via esm.sh, and their sources
persist to a localStorage-backed virtual filesystem. Window drag,
focus, minimize, and maximize are built on @vueuse/core. Architecture
is documented in eleven ADRs in the repo.

## Products & tools used

Check these:

- [x] AI Tinkerers
- [x] OpenAI (chat provider via Vercel AI SDK)

Other products (paste into the "Other Products" field):

Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Pinia, Vercel AI SDK (with
@ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google), vue3-sfc-loader,
esm.sh, @vueuse/core, lucide-vue-next, zod, markdownlint-cli2, Husky.

No CopilotKit / OpenRouter / Exa / Trigger.dev / Auth0 / Mozilla.ai /
Ambiguous AI / Rev1 / TeamClaws / GDG usage in the repo — leave them
unchecked.

## Project video

Placeholder — needs the human to upload:

TODO_YOUTUBE_OR_LOOM_URL

(Keep it to 2 minutes; beats are defined in
[the demo path](demo-path.md).)

## Team contributions

Sourced from the merged pull requests on `main` (author of record):

- **Zackary Lowery (@xcjs, lead)** — architecture decision records
  0000–0009 and the repo conventions (OKF frontmatter, markdownlint,
  CI); Nuxt 4 scaffold (#21); OS shell — window manager, taskbar,
  drag/focus/minimize/maximize (#24); chat runtime deps and current
  model IDs (#29); launcher Uninstall and View Source (#44); typecheck
  and build CI (#67); custom OpenAI-compatible provider (#70); review
  and merge gate all afternoon.
- **Charles Sullivan (@Sullux)** — hackathon golden paths across the
  ADRs plus ADR 0010, `NEXT.md`, `QUESTIONS.md` (#2); `/api/chat`
  streaming, bring-your-own-key, `install_app` / `update_app` tools
  (#20); runtime engine — in-browser vue3-sfc-loader runner, esm.sh
  resolver, error boundary (#25); persistence — VFS over localStorage,
  registry hydration, Settings app, Reset OS (#27); frozen demo prompt
  and fallback pomodoro fixture (#40); Recover beat verified end to end
  (#64); the 15:08 rehearsal that proved the core loop.
- **Brandon (@r0073d-l053r)** — the `/coordinate` protocol, labels,
  hub, and script that the five agents worked through (#7); current
  model presets (#39); Tailwind content scan and Anthropic-safe chat
  history (#42); "As built" reconciliation of ADRs 0001–0010 (#55);
  hub fix (#57); seeded the integration and rehearsal issues; demo
  video production.
- **Justin (@ImNewToC0de)** — wired the core app loop, chat →
  `install_app` → VFS → windows (#35); window-control click fix (#45);
  strict typecheck separated from the production bundle (#48); Settings
  polish (#61); dynamic app style cleanup (#62); current app source in
  the `update_app` context (#66); reviews.
- **Michael Vawter (@m-vawter)** — docs and process lane: judging
  rubric and win strategy (#1), demo path (#3, #4), coordination
  playbooks v1–v3 with the Q01 research behind them (#18, #26, #68,
  #71), README quickstart (#28), finish plan (#37), judge-facing
  walkthrough with screenshots (#53); shell and chat smoke fixes
  (#63); protocol facilitation and PR reviews.

## Additional links

Repository: <https://github.com/xcjs/DOMinic>

## Prior work

All work was authored during the hackathon; there is no prior code.
The team did bring a pre-hackathon plan: judging rubric, demo-path
beats, and eleven ADRs were written as a planning pass on day one and
are committed to the repo's history.

## Social media posts

Placeholder — needs the human to post, then paste URLs here:

TODO_POST_URL

Suggested post (tags per the form):

We built DOMinic at @AITinkerers Columbus "Agents, Everywhere": a
browser-tab OS where the agent is the app author — describe an app
and it's written, installed, and kept. @OpenAI @CopilotKit @openrouter
@exaailabs @auth0 @ambiguousio @triggerdotdev @mozillaAI #AgentsEverywhere

(For LinkedIn use company names per the form instructions.)
