---
type: playbook
title: Open Questions & Gaps
description: Post-sprint retrospective — what shipped, what stayed deferred, and the honest caveats a judge or a future contributor will notice in the code.
tags: [dominic, gaps, retrospective, hackathon]
generated: { by: claude-code/claude-opus-4.8, at: 2026-09-12T23:40:00Z }
repo_head: "be8645f"
ingested: 2026-09-12
refreshed: 2026-09-12T23:40:00Z
---

# Open Questions & Gaps

This started as a live pre-freeze risk list; at `be8645f` the sprint is over and it reads as a retrospective. The team's own forward register is [[Open Questions Register (QUESTIONS)]]; the deferred roadmap is [[Post-Hackathon Roadmap (NEXT)]]. Back to [[DOMinic Home]].

## Resolved during the sprint

> [!success] Everything that was "at risk" at the 3:10 freeze shipped
> - **Core loop** — wired end to end (#35); Charles's 15:08 rehearsal passed Hook/Ask/Materialize/Persist/Close.
> - **Stream protocol** — the `ai@7` vs v4-parser mismatch was fixed by pinning `ai@4` and reverting the route (#29); the client parses `0:`/`9:` data-stream prefixes again.
> - **Model IDs** — retired `gpt-4o`/`claude-3-5-sonnet-20241022`/`gemini-1.5-pro` replaced by `gpt-5`/`claude-sonnet-5`/`gemini-2.5-pro` in both the route (#29) and Settings presets (#39).
> - **Tailwind** — content globs now scan `app|features/**` and a Play CDN covers agent-invented classes (#42); `.txt` fixtures included (#40 follow-up).
> - **Chat history** — Anthropic-safe (no leading assistant turn, no empty content) (#42).
> - **Window controls / launcher overlay** — min/max/close fixed (#45), launcher moved into the taskbar (#56).
> - **Recover beat** — verified end to end with a fix-injection path and test hooks (#64).
> - **update_app** — now gets the target app's current source injected (#66), so edits are grounded in real code.
> - **Style leaks** — runtime `<style data-app-id>` tags cleaned on update/uninstall (#62).
> - **Custom provider** — OpenAI-compatible base-URL + model support shipped (#70).
> - **ADRs vs code** — every ADR got a verified "As built" reconciliation (#55); ADR 0011 pinned Node 24 (#71-era).
> - **The one human gate left at the buzzer** was recording and uploading the video; the [[Submission Form Draft]] still has `TODO_YOUTUBE_OR_LOOM_URL` and `TODO_POST_URL`.

> [!success] 2026-10-02 — scope lifted, roadmap sequenced
> **ADR 0012** (PR #78) ends the hackathon scoping and accepts the slice/store baseline; `QUESTIONS.md` now carries an outcomes table (Q2.1 superseded, Q4.1 reopened as roadmap 2.5, Q5.1 n/a). **`NEXT.md`** (PR #77) sequences every item below into phases with owners. Caveats 1–8 are now scheduled roadmap steps (0.2, 1.2, 1.3, 3.3, 1.1, 3.1, 0.4/0.5); caveat 9's ADR half is closed by ADR 0012, its README half is step 0.5.

## Honest caveats a judge or contributor will notice

These are true of the shipped code and worth stating plainly rather than hiding:

1. **Server-side key fallback.** `chat.post.ts` falls back to `process.env.<PROVIDER>_API_KEY` when no per-request key is sent — this contradicts ADR 0005's "keys never at rest on the server." Safe only because the demo host sets none; a public deploy should remove the fallback or gate it. ([[ADR 0005 - Agent chat via Vercel AI SDK with server-side provider proxy|ADR 0005]])
2. **No sandboxing.** Agent-authored SFCs compile and run in the host page with full DOM access (no iframe, no CSP). Fine for a trusted single-user demo; a real product needs the iframe + postMessage isolation in [[Post-Hackathon Roadmap (NEXT)]]. ([[ADR 0006 - Agent-authored runtime-compiled components|ADR 0006]])
3. **No dependency vetting.** Unknown imports load straight from `esm.sh/<pkg>?bundle`; ADR 0008's vetting gate is deferred. The system prompt asks the model to stay within four host modules, which is guidance, not enforcement. ([[ADR 0008 - Runtime NPM dependency loading via esm.sh with vetting|ADR 0008]])
4. **No CORS proxy.** ADR 0009's `/api/proxy` was never built; agent apps can only reach CORS-friendly endpoints. The demo app makes no external calls, so this never bit. ([[ADR 0009 - CORS-first networking with Chrome-masking proxy fallback|ADR 0009]])
5. **localStorage-only VFS.** One driver, ~5 MB quota; ADR 0007's multi-driver (IndexedDB/OPFS) design is deferred. Dozens of demo apps fit; a heavy app would not.
6. **Desktop-only.** The README still promises mobile degradation; the shell has none. Cosmetic honesty fix, or build the bottom-sheet layout later. ([[ADR 0004 - DOMinic OS shell and taskbar|ADR 0004]])
7. **`typeCheck: false` in `nuxt.config`.** Build-time type-checking is off (it hit an environment-specific `TS5023`/`TS5042` on Windows during the sprint); `nuxt typecheck` runs separately and is gated in CI (#67), so types are still enforced — just not inside `nuxt build`. ([[ADR 0002 - Strict TypeScript and lint toolchain|ADR 0002]])
8. **No ESLint.** ADR 0002 specifies a type-checked ESLint flat config; only markdownlint is installed. Slice-boundary rules are convention, not lint.
9. **Doc drift is bounded, not zero.** The ADRs' Decision-Outcome prose still names the pre-sprint design in places; the **As built** subsection under each is the source of truth, and [[Judges Walkthrough]] maps decisions to files. The README's "vetted ESM CDN" and mobile lines are the two spots still ahead of the code.

## Cross-references

- What was deliberately punted, in the team's words: [[Post-Hackathon Roadmap (NEXT)]].
- The team's own open-question register with POC recommendations: [[Open Questions Register (QUESTIONS)]].
- How the code diverges from each decision, per ADR: the **As built (2026-09-12)** subsection in every ADR note.
