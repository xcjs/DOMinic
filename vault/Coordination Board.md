---
type: dashboard
title: Coordination Board
description: Live snapshot of the DOMinic GitHub Issues board as maintained by the /coordinate skill.
tags: [dominic, coordination, board]
repo_head: "be8645f"
refreshed: 2026-09-12 23:45 ET
---
# Coordination Board

Snapshot at **2026-09-12 23:45 ET**, `origin/main` = `be8645f`. Hub issue: #5. Regenerated every watch tick; edit on GitHub, not here. Back to [[DOMinic Home]].

> [!note] Sprint closed
> The build sprint ended at the 4:00 PM ET portal close. This is the final
> board snapshot; open issues below are post-sprint polish, not live work.
> The protocol behind it is [[Coordination Protocol]].

## Board (`coord.sh board`)

```
ISSUE  STATUS       WS              P   OWNER                  TITLE                                        FILES
#54    -            -               -   -                      📊 Status Dashboard (live)                 
#10    in-progress  docs            p0  @m-vawter              Submission package: written description, soc docs/agents/demo-path.md  
#9     claimed      docs            p0  @r0073d-l053r          Demo video: record the core loop, wrap in Hy (outside repo: ~/DFIM/DOMinic-video/dominic-demo
#19    in-progress  docs            p1  @m-vawter              Coordination playbook v1: adopt the sprint m docs/agents/coordination-best-practices.md
```

## By workstream

### ws:docs
- [#9](https://github.com/xcjs/DOMinic/issues/9) **p0** claimed — Demo video: record the core loop, wrap in HyperFrames, render, publish a public YouTube link — @r0073d-l053r
- [#10](https://github.com/xcjs/DOMinic/issues/10) **p0** in-progress — Submission package: written description, social post, and portal submission by 3:50 — @m-vawter
- [#19](https://github.com/xcjs/DOMinic/issues/19) **p1** in-progress — Coordination playbook v1: adopt the sprint minimum and report what is working and what is not — @m-vawter

### ws:-
- [#54](https://github.com/xcjs/DOMinic/issues/54) **-** - — 📊 Status Dashboard (live) — unclaimed

## Stale claims (`coord.sh stale`)

```
#19    @m-vawter              434m silent    Coordination playbook v1: adopt the sprint minimum and report what is working and what is not
#10    @m-vawter              436m silent    Submission package: written description, social post, and portal submission by 3:50
#9     @r0073d-l053r          436m silent    Demo video: record the core loop, wrap in HyperFrames, render, publish a public YouTube link
```

## Needs human

- #10 Submission package: written description, social post, and portal submission by 3:50

## Last hub SYNCs

- 20:24Z codex/gpt-5.6 | human: @m-vawter — PR #66 reviewed for @ImNewToC0de: conflict resolved against main, create-vs-update source fallback guarded, pushed febc653, approved; Markdown lint/typecheck/build all green and ready to merge.
- 20:26Z codex/gpt-5.6 | human: @m-vawter — PR #66 final head 196b7fd reviewed and approved for @ImNewToC0de; mergeable CLEAN with Markdown lint/typecheck/build green. Justin incorporated the create-intent guard and centralized Ask-to-Fix source context.
- 20:29Z claude-code/claude-fable-5.1 | human: @m-vawter — FREEZE (ws:docs 16:29): the form is submitted; origin/main is now the repo judges will open (JUDGES.md first row, ADRs as-built, lint+typecheck+build CI green). No further merges to main except a fix verified by booting main - every merge from here is unreviewed-by-judges risk. Video link (#9) is with @r0073d-l053r.
- 20:31Z codex/gpt-5 | human: @m-vawter — final: coordination v3 merged via PR #68; v2 superseded; scope/completion/hub invariants documented; helper enforcement queued as #69; reports posted on #65
- 20:46Z claude-code/claude-fable-5.1 | human: @m-vawter — ws:docs wrap-up (https://github.com/xcjs/DOMinic/pull/71): docs/research/ now holds the Q01 question + all three answers behind the coordination playbooks (they were 'outside the repo' until now), and the finish plan is checked off with a 16:40 closing status. After this merges ws:docs has nothing further to push; #10 closes when the video link and post are in (#9 is Brandon's). Thanks all - five agents, one afternoon.
- 20:56Z claude-code/claude-fable-5.1 | human: @m-vawter — ws:docs: https://github.com/xcjs/DOMinic/pull/73 corrects docs/submission-form.md Team contributions - the merged draft credited @m-vawter with Charles's runtime/VFS/Settings work and omitted @Sullux, @r0073d-l053r and @ImNewToC0de. One entry per person, each tied to its merged PR. @xcjs if that text went into the portal, re-paste from the PR. (Replaces my 16:56 line that went out with a blank link.)
- 21:29Z opencode/glm-5.3-flash | human: @xcjs — PR #75 (coord v3 invariants, #69) + PR #74 (AGPL license) open - both need 2 approvals. #75 gates were live-tested against the real board: empty-Files claim refusal (#54), unchecked-Done-when + unmerged-PR done refusals, PR-path-vs-Files validation (it even caught its own PR until a dot-trim bug was fixed). DEP-DONE spam removed from done in both scripts.
- 21:44Z opencode/glm-5.3-flash | human: @xcjs — Heads-up: main branch protection actually requires 1 approval (not 2) - verified via the API. PR #73 merged (0d66819). Two of mine are waiting on a single outside approval each: PR #74 (AGPL-3.0 license: LICENSE + package.json + README section) and PR #75 (coord v3 invariants #69: file-scope claim/review gates, done gate, COORD_HUB parity, DEP-DONE removal; live-tested). Any teammate: an approving review on either unblocks merge. @Sullux @r0073d-l053r @m-vawter @ImNewToC0de

## Open PRs

- (none)
