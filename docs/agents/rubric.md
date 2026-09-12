---
type: playbook
title: How We Win — Judging Rubric and Strategy
description: The hackathon judging rubric decoded into design rules, a cadence, and hard submission gates for DOMinic.
tags: [hackathon, rubric, strategy, judging]
generated: { by: claude-code/claude-fable-5.1, at: 2026-09-12T17:30:00Z }
verified: { by: human:michael, at: 2026-09-12T17:35:00Z }
stale_after: 2026-09-12T20:00:00Z
sources:
  - id: event-page
    resource: https://columbus.aitinkerers.org/p/agents-everywhere-bots-channels-more-global-hackathon
    title: "Agents, Everywhere: Bots, Channels, & More — Global Hackathon (event page)"
  - id: judging-criteria
    resource: https://columbus.aitinkerers.org/hackathons/h_Lv03K-ob6sU
    title: Judging criteria and submission portal (participant login required)
---

# How We Win — Judging Rubric and Strategy

One goal: win the "Agents, Everywhere: Bots, Channels, and More" global
hackathon. Every decision — architecture, scope, framework, UX, what we
cut — serves the score and nothing else.

- **Submission deadline: 4:00 PM ET (hard).** The portal window is
  15:30–16:00 ET; it closes at 16:00.
- **Judging is global.** Every project from every city goes into one
  review. We compete with the world, not the room — polish and clarity
  travel; in-room charisma does not.
- **Four criteria, each scored 1–5. Maximum 20.** We win by engineering a
  genuine 5 on the criteria that are hardest to fake.

## The prime directive — the chatbox test

> If the core value could be delivered inside a standalone chat window,
> we have already lost.

The rubric defines a top score as value that could not be reproduced in a
standalone chatbox, and a low score as an environment that is merely a
wrapper. Before building anything, answer in one sentence:

> What does living inside this environment let the agent do that a chat
> window fundamentally cannot?

If the answer is not crisp, fix the idea — not the code.

Our environment is the **browser tab as a runtime**, not a display.
DOMinic is a desktop OS shell in the browser where the agent is the
primary app author: it writes Vue components that compile in the browser,
install into a window manager and taskbar, load vetted npm dependencies,
and persist in a virtual filesystem. A chat window can *show* code; this
environment *runs* it and keeps it. That is our chatbox-test answer, and
every demo beat should prove it.

## The four criteria, verbatim, and how we hit a 5

### 1. Core Requirements & Functionality

*Does the project deliver a working agent inside a place where people
already work, talk, or live? Does the core workflow function end to end?*

| Score | Meaning |
| --- | --- |
| 1 | The project does not run or does not demonstrate a functional agent. |
| 2 | Parts of the project run, but the core workflow or environment integration is incomplete. |
| 3 | A basic end-to-end agent works in the intended environment, with limitations or bugs. |
| 4 | The project works reliably and demonstrates a complete agent experience with only minor issues. |
| 5 | The project is robust, reliable, and fully functional within its intended environment. |

**Win it:** reliable beats impressive. This is a quarter of the score and
cannot be talked past. The one loop that must be bulletproof: ask → the
agent authors an app → it compiles → it installs to the taskbar → it runs
→ it survives a reload. Freeze features early and polish that loop, happy
path and failure path both.

### 2. Innovation & Theme Alignment

*Does the project explore a compelling new place or interaction for
agents? Does the environment materially improve what the agent can do?*

| Score | Meaning |
| --- | --- |
| 1 | The project is essentially a generic chatbot or automation; the selected environment is irrelevant. |
| 2 | The agent appears in an eligible environment, but the environment mostly serves as a wrapper. |
| 3 | The project clearly addresses the theme, and its environment adds meaningful value. |
| 4 | The environment shapes the core workflow and enables an original agent experience. |
| 5 | The project reveals a surprising new agent pattern whose central value could not be reproduced in a standalone chatbox. |

**Win it:** this is the criterion most teams fail and the one we win on.
The star is software materializing, not messages scrolling. A chat
transcript with an OS skin is the rubric's definition of a 2. Show the app
appear, run, persist, and reopen from the taskbar after a reload.

### 3. Technical Execution & Integration

*Consider the code, architecture, reliability, tool use, data handling,
and depth of integration with the selected environment.*

| Score | Meaning |
| --- | --- |
| 1 | Little or no technical execution is evident; the submission is primarily conceptual or mocked. |
| 2 | The implementation is basic, unstable, or relies on superficial integrations. |
| 3 | The project demonstrates solid technical execution and working integrations, with some rough edges. |
| 4 | The project is well engineered, reliable, and integrates its tools, data, and environment effectively. |
| 5 | The project demonstrates exceptional engineering, including robust orchestration, thoughtful failure handling, and a deeply integrated architecture. |

**Win it:** the rubric names *failure handling* and *depth of integration*
explicitly. Depth is native here — runtime component compilation, the
virtual filesystem, vetted esm.sh loading, the provider proxy. Failure
handling has a ready-made demo beat: a compile error the agent reads and
repairs, or a rejected dependency it explains. Show it; do not hide it.

### 4. Usefulness & Agentic Experience

*Does the project create clear value for its intended users? Is the agent
intuitive, effective, and appropriate for the environment in which it
operates?*

| Score | Meaning |
| --- | --- |
| 1 | The use case is unclear, and the agent provides little meaningful value or interaction. |
| 2 | The project addresses a recognizable use case, but the agent's contribution is limited or largely resembles basic prompt and response. |
| 3 | The project is useful, the interaction is understandable, and the agent performs meaningful actions with reasonable user control. |
| 4 | The project solves a clear problem, and the agent feels native to its environment while creating a strong interaction between people and AI. |
| 5 | The project unlocks substantial value through an agent experience designed specifically for its environment, using context intelligently while remaining clear and controllable. |

**Win it:** the rubric names *native to its environment*, *uses context
intelligently*, and *clear and controllable*. Pick one real user and one
job the agent builds an app for. Control: preview before install,
uninstall, open the source in the filesystem. Context: the agent knows
what is installed and what is open. Agency with control outscores full
autonomy.

## The winning formula

1. **Browser as runtime.** The agent's output becomes installed software,
   which a chatbox cannot do. *(Criterion 2 ceiling.)*
2. **One bulletproof end-to-end loop.** Ask, author, compile, install,
   run, reload. *(Criterion 1.)*
3. **Deep native integration with visible failure handling.** *(Criterion
   3.)*
4. **One clear user, a native and controllable experience.** *(Criterion
   4.)*
5. **Prove all four in a 120-second demo** and clear every submission
   gate.

A genuine 4–5 on criterion 2 plus reliability on criterion 1 beats a
technically fancier project that reads as a wrapper.

## Score risks specific to DOMinic

- **Chat as the star.** The agent surface is chat-driven; if the demo is
  a transcript, judges score the OS as a skin. Keep the camera on apps
  appearing, running, and persisting.
- **"A place people already work."** Criterion 1 says exactly that. A new
  web OS can read as a standalone app. Frame it as the browser tab the
  user already lives in, and make the reload-and-reopen beat prove it is
  an environment, not a one-off demo.

## Secondary objective — prize stacking

The 20-point rubric decides the podium. Sponsor tools decide the side and
hardware prizes and quietly help every criterion. Integrate what fits
*naturally*; never bolt one on if it destabilizes the core loop.

| Sponsor tool | Fit for DOMinic | Prize / benefit |
| --- | --- | --- |
| **OpenRouter** | Natural — one provider behind the Vercel AI SDK proxy; backs the "virtually any LLM" claim and gives model fallback for criterion 3 | Sponsor |
| **OpenAI** | Natural — another provider in the same proxy; the marquee sponsor | Credits in all three tiers |
| **Exa** | Natural — the agent researches APIs and docs while authoring an app | Exa credits in all three tiers |
| **CopilotKit** (AG-UI) | Weak — React-first; a poor match for a Vue/Nuxt shell. Skip unless trivially cheap | Dedicated Best CopilotKit Use prize |
| **Auth0**, **Trigger.dev**, **Ambiguous AI** | No natural fit today; do not force them | Best Ambiguous AI Use is a DGX Spark, but not for us |

## Submission requirements — hard gates

No points without every one of these:

- [ ] **Title** — "a clear name for the project"
- [ ] **Written description** — "what you built, who it is for, and why
  the context matters"
- [ ] **Public GitHub repository** — "working code that can be reviewed
  and learned from"
- [ ] **Two-minute video** — "a concise demo of the project in action",
  recorded against the working build
- [ ] **Social post** — "a public post about the project that tags the
  event sponsors"

The organizers' own steer: "Build something that can be shown. A sharp,
working demo beats a broad concept."

## Time cadence, working back from 4:00 PM ET

| Milestone | Target |
| --- | --- |
| Environment locked — browser as runtime | done |
| Spec and architecture agreed (team lead) | done — ADRs 0000–0009 |
| **Feature freeze** — whatever works, works | **~3:10 PM** |
| **Two-minute video** recorded and rendered against the build | **~3:30 PM** |
| Video uploaded if a link is required; all five gates submitted | **~3:50 PM** |
| Buffer | 3:50–4:00 |

Never let the video slip into the final ten minutes; in a global review
it is often the deciding artifact. The portal closes at 4:00 — submit by
3:50.

## Prohibited today — these score 1 or 2

- A standalone chatbot or chat UI, however polished.
- The OS shell used as a skin around a chat window. The demo shows apps
  materializing, not messages scrolling.
- Mocked or faked core functionality in the demo. Judges score what runs.
- Scope that risks the core loop not working reliably by the 3:10 freeze.
- New frameworks or tools adopted after the freeze.
- Any feature that cannot answer the chatbox test.

## The one filter, restated

Before building anything, ask:

1. **Chatbox test** — could this value exist in a chat window? If yes,
   do not build it.
2. **Rubric test** — which of the four criteria does this raise toward a
   5?
3. **Clock test** — does this survive the 3:10 feature freeze reliably?

Build only what passes all three.
