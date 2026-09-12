---
type: submission
title: Hackathon Submission Form Draft
description: Ready-to-paste answers for the AI Tinkerers Columbus "Agents, Everywhere" submission form.
tags: [hackathon, submission, form]
generated: { by: opencode/glm-5.3-flash, at: 2026-09-12T19:20:00Z }
verified: { by: human:zack, at: 2026-09-12T19:20:00Z }
stale_after: 2026-09-12T20:00:00Z
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

- **Zackary Lowery (Lead)** — Nuxt 4 + Pinia scaffold, OS shell with
  window manager, taskbar, and drag/focus/minimize/maximize
  (@vueuse/core), server-side `/api/chat` route with multi-provider
  support (OpenAI, Anthropic, Google, DeepSeek) on the Vercel AI SDK,
  launcher uninstall and source actions, and eleven architecture decision
  records.
- **Michael Vawter** — runtime app engine: in-browser vue3-sfc-loader
  runner, esm.sh dependency resolver, error boundary, VFS over
  localStorage with registry hydration, Settings app, and demo prompt
  freeze with a fallback pomodoro fixture.
- **Charles Sullivan** — chat and agent loop: `/api/chat` route,
  system prompt, tool schemas, ChatWindow UI, useAgentChat
  composable; plus Tailwind content scanning and Anthropic-safe chat
  history fixes, and model presets aligned with the chat route
  defaults.
- **Brandon Jewell** — docs: hackathon judging rubric and demo-path
  playbooks, coordination skill for multi-agent work, and README
  alignment.
- **Justin Dang** — core app loop wiring (app shell, chat window, and
  OS store integration) and the window controls drag-handler fix.

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
