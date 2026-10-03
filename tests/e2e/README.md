---
type: playbook
title: End-to-end tests
description: How to run the Playwright test of the core loop, and how its stubbed agent works.
tags: [tests, e2e, playwright, ci]
generated: { by: claude-code/claude-opus-5.5, at: 2026-10-03T00:34:00Z }
---

# End-to-end tests

A Playwright test of the core loop from [NEXT.md](../../NEXT.md) step
0.1: install a fixture app, reload, update it, break it, and ask the
agent to fix it. NEXT.md makes this suite the definition of "still
works", and CI runs it on pull requests and on pushes to `main`.

## Run it

```bash
npm ci
npx playwright install chromium   # once per Playwright version
npm run test:e2e
```

`test:e2e` type-checks `tests/e2e` and then runs Playwright, which builds
the app (`nuxt build`) and serves the production output on
`http://127.0.0.1:3179`. Set `E2E_PORT` to use another port. Outside CI,
a server that is already listening on that port is reused instead of
rebuilt, so stop any server you started by hand after changing app code.

Other ways to run it:

```bash
npm run test:e2e -- --headed   # watch it in a browser window
npm run test:e2e -- --ui       # Playwright UI mode
npx playwright show-report tests/e2e/playwright-report
```

Failure artifacts (traces, screenshots, error context) go to
`tests/e2e/test-results/` and the HTML report to
`tests/e2e/playwright-report/`. Both are gitignored. In CI they are
uploaded as the `playwright-report` artifact when the job fails.

## What it covers

| Step | How | Asserts |
| --- | --- | --- |
| Install | `window.__dominic.installFixture('pomodoro-timer')` | the timer renders |
| Persist | reload, then the taskbar's **Open Pomodoro Timer** | the app comes back from the virtual filesystem |
| Update | `window.__dominic.updateApp(...)` | the new source renders in the same window |
| Break | `window.__dominic.injectBrokenApp('compile')` | the error card and **Ask Agent to Fix** appear |
| Recover | click **Ask Agent to Fix** | the request carries the app's id and source; the `update_app` reply mounts a working app in place |

A second test runs Break and Recover with `injectBrokenApp('runtime')`,
which goes through the runner's `onErrorCaptured` boundary instead of
the compile path.

## The stubbed agent

No model provider or API key is involved, locally or in CI.
`support/agent-stub.ts` answers `POST /api/chat` inside the browser with
`page.route`, in the AI SDK v4 data-stream format that the server's
`toDataStreamResponse()` sends:

```text
f:{"messageId":"msg-e2e"}
0:"Found the bug; sending a fixed version."
9:{"toolCallId":"call-e2e","toolName":"update_app","args":{...}}
e:{"finishReason":"tool-calls","usage":{...},"isContinued":false}
d:{"finishReason":"tool-calls","usage":{...}}
```

Every line ends in a newline, because the client parser in
`useAgentChat.ts` ignores a last line that has none. The lines are
built with `formatDataStreamPart` from the `ai` package, so they follow
the SDK version the server uses. If the chat route changes its stream
format, change the stub in the same pull request.

Two guards keep the suite self-contained:

- Every request that leaves the app's origin is aborted. Today that is
  only the Tailwind Play CDN script; the shell's own styles are built in.
- The test server starts with blank provider keys, so a request that
  ever got past the stub fails with 401 instead of calling a real model.

## Adding a test

- Start with `openDesktop(page)` and drive the desktop through
  `dominicHooks(page)` and visible controls.
- Find windows with `appWindow(page, title)`.
- Use web-first assertions (`await expect(locator)...`), not sleeps.
- Each test gets a fresh browser context, so the virtual filesystem
  (`localStorage`) starts empty.
