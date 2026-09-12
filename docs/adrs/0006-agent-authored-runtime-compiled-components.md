---
type: Architecture Decision Record
title: Agent-authored runtime-compiled components
description: The agent's Vue SFC applications compile at runtime with vue3-sfc-loader and register on a DominicApp contract.
status: accepted
tags: [architecture, agent]
generated: { by: human:zack, at: 2026-09-12T00:00:00Z }
verified: { by: human:zack, at: 2026-09-12T00:00:00Z }
---

# Agent-authored runtime-compiled components

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0006 | accepted | 2026-09-12 | Zack |

## Technical Story

The agent authors Vue single-file component applications from chat
requests. Users expect to install, preview, and run those apps
immediately — with no per-component build step, no bundler run, and
no redeploy of the OS itself.

## Context and Problem Statement

A traditional Vue app compiles at build time; DOMinic's apps are born
at runtime. They must compile in the browser, integrate with the
window manager as ordinary apps, persist their source, and be
removable. Compile-in-an-iframe would isolate them but would wall
them off from OS state and styling.

## Decision Drivers

- No build infrastructure per component.
- A live install-and-preview loop from chat.
- Reuse of the Vue ecosystem (components load dependencies, ADR 0008).
- Apps and widgets register through the same contract as first-party
  apps.

## Considered Options

- Runtime-compiled SFC (vue3-sfc-loader), in-process
- Sandboxed iframe compile
- Prebuilt bundles delivered per app

## Decision Outcome

Chosen option: **runtime-compiled SFC via `vue3-sfc-loader`, in
process**, because it compiles agent-authored SFCs directly in the
browser with no per-app infrastructure and keeps compiled apps first-
class OS citizens.

### Hackathon POC (Golden Path)

For the hackathon POC, runtime compilation delivers an instant
compile-and-render loop directly in the browser:

- **DynamicAppRunner**: A wrapper component compiles raw Vue SFC strings
  using `vue3-sfc-loader` and mounts the result dynamically via
  `<component :is="compiledComponent" />`.
- **Pre-injected Ecosystem**: The `loadModule` callback of `vue3-sfc-loader`
  immediately resolves `vue`, `@vueuse/core`, and standard icon sets
  (`lucide-vue-next`) from in-memory host bundles with zero network latency.
- **Tailwind Utility Styling**: Host Tailwind CSS styles are directly
  accessible inside the component templates, enabling rich UIs with zero
  custom CSS overhead.
- **Error Boundary**: A Vue `onErrorCaptured` boundary wraps every running
  component. If an agent-authored app throws a render or syntax error,
  the window displays a clean error card with an "Ask Agent to Fix" button
  that feeds the error trace back into the chat.
- **DominicApp Contract**: Governed by ADR 0010.

### Future / Out of Scope for POC

- Sandboxed `<iframe>` compile isolation with `postMessage` bridge.
- Web Worker compilation and off-thread parsing.
- Hot-module state preservation across component updates (POC re-mounts
  the updated component).

### Open Questions

- **OPEN QUESTION: Global CSS Pollution**: Could an agent write unscoped
  `<style>` tags that break OS shell styling? (Recommendation for POC:
  System prompt instructs the agent to use Tailwind utility classes or
  `<style scoped>`).

### Confirmation

An agent-authored SFC installs from chat, appears in the app
registry, launches as a window, and survives reload via its VFS
source.

### As built (2026-09-12)

**Matches the golden path:**

- `DynamicAppRunner` compiles its `sourceCode` prop through `compileVueSfc`,
  a `vue3-sfc-loader` `loadModule` wrapper, and mounts the result via
  `<component :is>` (`app/features/apps/runner/loader.ts:42`,
  `app/features/apps/runner/DynamicAppRunner.vue:48`).
- `moduleCache` pre-resolves `vue`, `@vueuse/core` and `lucide-vue-next` from
  host bundles (`app/features/apps/runner/loader.ts:16`).
- Runtime errors hit `onErrorCaptured` (`DynamicAppRunner.vue:100`, returns
  `false`); compile errors hit the `catch` in `loadComponent` (line 91). Both
  show the card whose "Ask Agent to Fix" emits `askFix`; `app.vue` forwards
  it to `chat.sendMessage` (`app/app.vue:104`).
- Updates re-mount: `installApp`/`updateApp` bump `sourceVersion[params.id]`,
  part of the runner's `:key` (`app/app.vue:94`, `app/app.vue:131`).

**Differs from this record:**

- `canvas-confetti` is also in `moduleCache`, and unknown imports are fetched
  unvetted from `https://esm.sh/<url>?bundle` (`loader.ts:20`, `loader.ts:27`).
- Agent-only Tailwind classes resolve through the Play CDN script added in
  `nuxt.config.ts:32`, not the host build's bundle alone.
- The runner passes `app-id` and `window-id` to the compiled app
  (`DynamicAppRunner.vue:50`); the prompt contract never mentions them.
- The error card adds a "Retry" recompile button (`DynamicAppRunner.vue:41`);
  `askFix` emits `sourceCode` but `app/app.vue:105` sends only id and error.
- `addStyle` appends a `<style data-app-id>` to `document.head`; nothing removes
  it on update, unmount or uninstall (`app/features/apps/runner/loader.ts:34`).
- Fixture path the ADR omits: `installFixture` writes `apps/<id>/index.vue`
  into VFS and calls `registerApp` (`app/features/apps/fixtures/index.ts:31`);
  `app/app.vue:43` exposes it as `window.__dominic.installFixture`.

**Open question outcome:**

- Resolved by prompt only: the contract mandates Tailwind utilities and allows
  `<style scoped>` for keyframes (`app/features/chat/prompts/systemPrompt.ts:33`
  and `systemPrompt.ts:25`); unscoped styles still inject globally and are
  never removed (`loader.ts:34`).

Reconciled against main on 2026-09-12; the decision text above is unchanged.

## Pros and Cons of the Options

### Runtime-compiled SFC (vue3-sfc-loader), in-process

- ✅ Good, because zero per-app build step keeps the live loop fast.
- ✅ Good, because compiled apps share OS state and styling directly.
- ❌ Bad, because a crashing app shares the page with the OS (iframe
  isolation remains the escape hatch).

### Sandboxed iframe compile

- ✅ Good, because crashes and bad CSS are contained.
- ❌ Bad, because postMessage bridging for state, storage, and
  styling is heavy and erodes the app contract.

### Prebuilt bundles delivered per app

- ✅ Good, because runtime cost is minimal.
- ❌ Bad, because it requires per-app build infrastructure the
  product explicitly avoids.

## Links

- Related to [ADR 0000](0000-record-architecture-decisions.md)
- Related to [ADR 0004](0004-dominic-os-shell-and-taskbar.md)
- Related to [ADR 0007](0007-virtual-filesystem-with-pluggable-storage-drivers.md)
- Related to [ADR 0008](0008-runtime-npm-dependency-loading-via-esm-sh-with-vetting.md)
