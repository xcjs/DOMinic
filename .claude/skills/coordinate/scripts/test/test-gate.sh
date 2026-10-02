#!/usr/bin/env bash
# test-gate.sh - RED fixture tests for the coord.sh issue-ingestion gate.
# Isolation: a fake `gh` (stub-gh.sh) is shimmed onto PATH; coord.sh runs
# UNMODIFIED and never touches the network or the real repo. Fixtures live
# under a fresh mktemp dir (nothing is written into the repo).
#
# 7 cases: A1, B (2 asserts), C (2 asserts), D1, D2, E, F (2 asserts).
# Every case stores its events in BOTH shapes, because the gate (GREEN) will
# replace today's gh-shape read path with a REST read path:
#   issue-<N>.json           gh issue view shape (comments: body, author.login,
#                            createdAt)               - today's source
#   comments-<N>.jsonlines   REST shape (body, author.login, created_at,
#                            author_association)      - the gate's source
#   issues-open.jsonlines    gh issue list shape rows + REST fields
# RED contract: against ungated coord.sh the gate assertion(s) FAIL because
# stranger content IS ingested (each prints its raw output as evidence).
# GREEN contract: after the gate lands, all cases PASS. D1 is the positive
# control (trusted content must STAY visible) and passes today by design.
# Run:  bash test-gate.sh   (exit 1 + FAILURES = RED baseline; exit 0 = green)
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
STUB="$HERE/stub-gh.sh"
COORD="$HERE/../coord.sh"
# jq bootstrap (fixtures + stub need jq): common Windows installs if absent.
if ! command -v jq >/dev/null 2>&1; then
  for d in "$HOME"/AppData/Roaming/npm/node_modules/node-jq/bin \
           /c/ProgramData/chocolatey/bin \
           "/c/Program Files/jq"; do
    if [ -x "$d/jq" ] || [ -x "$d/jq.exe" ]; then PATH="$PATH:$d"; export PATH; break; fi
  done
fi
command -v jq >/dev/null 2>&1 || { echo "test-gate.sh: jq not found on PATH" >&2; exit 2; }
WORK="$(mktemp -d "${TMPDIR:-/tmp}/gate-tests-XXXXXX")"
ME_LOGIN="test-agent"
FAILS=0

mkdir -p "$WORK/bin"
printf '#!/usr/bin/env bash\nexec bash "%s" "$@"\n' "$STUB" >"$WORK/bin/gh"
chmod +x "$WORK/bin/gh"

newdir() { # name -> prints fresh fixture dir (user.json preseeded)
  mkdir -p "$WORK/$1"
  printf '{"login":"%s"}\n' "$ME_LOGIN" >"$WORK/$1/user.json"
  printf '%s\n' "$WORK/$1"
}
# gh-shape comment (today's read path): body, author.login, createdAt
ghc() {
  jq -cn --arg b "$1" --arg a "$2" --arg t "$3" \
    '{body:$b, author:{login:$a}, createdAt:$t}'
}
# REST-shape comment object (the gate's future read path)
c() {
  jq -cn --arg b "$1" --arg a "$2" --arg t "$3" --arg assoc "$4" \
    '{body:$b, author:{login:$a}, created_at:$t, author_association:$assoc}'
}
# gh issue list row + REST fields for the gate's future reads
row() { # file number title author assoc  (labels/assignees/body fixed)
  jq -cn --argjson n "$2" --arg title "$3" --arg au "$4" --arg assoc "$5" \
    '{number:$n, title:$title, assignees:[],
      labels:[{name:"status:unclaimed"},{name:"ws:docs"}], body:"## Files\na.txt",
      author:{login:$au}, author_association:$assoc, comments:[]}' >"$1"
}
expect_contains() {
  local desc="$1" needle="$2" hay="$3"
  if grep -q -- "$needle" <<<"$hay"; then echo "PASS: $desc"
  else
    echo "FAIL: $desc (missing: $needle)"
    sed 's/^/    | /' <<<"$hay"
    FAILS=$((FAILS + 1))
  fi
}
expect_absent() {
  local desc="$1" needle="$2" hay="$3"
  if grep -q -- "$needle" <<<"$hay"; then
    echo "FAIL: $desc (must not contain: $needle)"
    sed 's/^/    | /' <<<"$hay"
    FAILS=$((FAILS + 1))
  else echo "PASS: $desc"; fi
}
run_coord() { # fixture-dir cmd...
  local d="$1"; shift
  PATH="$WORK/bin:$PATH" COORD_STUB_DIR="$d" COORD_AGENT=a1 COORD_STALE_MIN="${TEST_STALE_MIN:-45}" \
    bash "$COORD" "$@" 2>&1
}
log_coord() { # fixture-dir logfile cmd...
  local d="$1" log="$2"; shift 2
  PATH="$WORK/bin:$PATH" COORD_STUB_DIR="$d" COORD_AGENT=a1 COORD_STALE_MIN=45 COORD_STUB_LOG="$log" \
    bash "$COORD" "$@" 2>&1
}

# --------------------------------------------------------------------------
# A1: a stranger CLAIM must never reset the heartbeat timer.
# Issue 10 (open, assigned to victim) has exactly ONE protocol comment: a
# stranger1 CLAIM (author_association NONE). With STALE_MIN=0, `stale` must
# report the issue as never-heartbeated ("no heartbeat") once the gate drops
# the stranger CLAIM. Today the gh-shape read ingests it (t = 2020 CLAIM), so
# the row shows a huge "silent" age instead -> RED.
# --------------------------------------------------------------------------
d="$(newdir A1)"
cm="$(ghc '**CLAIM** | agent: evil | human: @evil | at: 2020-01-01T00:00:00Z' stranger1 2020-01-01T00:00:00Z)"
jq -cn --argjson cm "$cm" \
  '{number:10, title:"t", assignees:[{login:"victim"}],
    labels:[{name:"status:claimed"}], body:"## Files\na.txt",
    author:{login:"victim"}, author_association:"COLLABORATOR", comments:[$cm]}' >"$d/issue-10.json"
jq -cn --slurpfile i "$d/issue-10.json" \
  '$i[0] | {number, title, assignees, labels, body, comments}' >"$d/issues-open.jsonlines"
printf '%s\n' "$(c '**CLAIM** | agent: evil | human: @evil | at: 2020-01-01T00:00:00Z' stranger1 2020-01-01T00:00:00Z NONE)" >"$d/comments-10.jsonlines"
out="$(TEST_STALE_MIN=0 run_coord "$d" stale)"
expect_contains "A1 stranger CLAIM invisible to heartbeat (issue reads no heartbeat) [RED today]" "no heartbeat" "$out"

# --------------------------------------------------------------------------
# B: the claim race must resolve on the earliest TRUSTED CLAIM only.
# Race simulation: racers-1.txt makes the stub add otheragent + stranger1 as
# assignees when claim's `--add-assignee @me` lands (concurrent claimants).
# Both posted CLAIMs; stranger1's is earliest (T+0:02, NONE) and MUST be
# ignored; otheragent's (T+0:10, COLLABORATOR) must win. Today the earliest-
# CLAIM selection ingests stranger1 -> back-off names @stranger1 -> RED.
# GREEN: back-off credits @otheragent and @stranger1 appears nowhere.
# --------------------------------------------------------------------------
d="$(newdir B)"
ev_b_gh="$( {
  ghc '**CLAIM** | agent: evil | human: @evil | at: 2020-01-01T00:00:02Z' stranger1 2020-01-01T00:00:02Z
  ghc '**CLAIM** | agent: other | human: @o | at: 2020-01-01T00:00:10Z' otheragent 2020-01-01T00:00:10Z
} )"
printf '%s\n' "$ev_b_gh" >"$WORK/b-cmts.jsonlines"
jq -cn --slurpfile cm "$WORK/b-cmts.jsonlines" \
  '{number:1, title:"t", assignees:[],
    labels:[{name:"status:unclaimed"}], body:"## Files\nb.txt\n\n## Notes\nrace fixture",
    author:{login:"otheragent"}, author_association:"COLLABORATOR", comments:$cm}' >"$d/issue-1.json"
jq -cn --slurpfile i "$d/issue-1.json" \
  '$i[0] | {number, title, assignees, labels, body, comments}' >"$d/issues-open.jsonlines"
printf '%s\n' "$(c '**CLAIM** | agent: evil | human: @evil | at: 2020-01-01T00:00:02Z' stranger1 2020-01-01T00:00:02Z NONE
  c '**CLAIM** | agent: other | human: @o | at: 2020-01-01T00:00:10Z' otheragent 2020-01-01T00:00:10Z COLLABORATOR)" >"$d/comments-1.jsonlines"
printf 'otheragent\nstranger1\n' >"$d/racers-1.txt"
out="$(run_coord "$d" claim 1)"
expect_contains "B race winner is trusted otheragent (stranger CLAIM invisible) [RED today]" "@otheragent" "$out"
expect_absent "B stranger never credited [RED today]" "@stranger1" "$out"

# --------------------------------------------------------------------------
# C: accept must not copy a stranger PROPOSE into ## Agreed.
# Contract issue 2, two PROPOSEs: goodagent trusted (T+1m) first, then
# stranger1 NONE (T+2m) LAST - selection-critical order. Today `accept` takes
# .last of all PROPOSEs -> EVIL CONTRACT flows into the `issue edit --body`
# (asserted via COORD_STUB_LOG). GREEN: body contains GOOD, never EVIL.
# --------------------------------------------------------------------------
d="$(newdir C)"
ev_c_gh="$( {
  ghc '**PROPOSE** | agent: good | human: @g | at: 2020-01-01T00:01:00Z

GOOD CONTRACT' goodagent 2020-01-01T00:01:00Z
  ghc '**PROPOSE** | agent: evil | human: @evil | at: 2020-01-01T00:02:00Z

EVIL CONTRACT' stranger1 2020-01-01T00:02:00Z
} )"
printf '%s\n' "$ev_c_gh" >"$WORK/c-cmts.jsonlines"
jq -cn --slurpfile cm "$WORK/c-cmts.jsonlines" \
  '{number:2, title:"t", labels:[{name:"type:contract"}], body:"base body",
    author:{login:"goodagent"}, author_association:"COLLABORATOR", assignees:[], comments:$cm}' >"$d/issue-2.json"
jq -cn --slurpfile i "$d/issue-2.json" \
  '$i[0] | {number, title, assignees, labels, body, comments}' >"$d/issues-open.jsonlines"
printf '%s\n' "$(c '**PROPOSE** | agent: good | human: @g | at: 2020-01-01T00:01:00Z

GOOD CONTRACT' goodagent 2020-01-01T00:01:00Z COLLABORATOR
  c '**PROPOSE** | agent: evil | human: @evil | at: 2020-01-01T00:02:00Z

EVIL CONTRACT' stranger1 2020-01-01T00:02:00Z NONE)" >"$d/comments-2.jsonlines"
log="$WORK/c-log"
: >"$log"
log_coord "$d" "$log" accept 2 >/dev/null
expect_absent "C stranger PROPOSE never recorded [RED today]" "EVIL CONTRACT" "$(cat "$log")"
expect_contains "C trusted PROPOSE is the recorded one [RED today]" "GOOD CONTRACT" "$(cat "$log")"

# --------------------------------------------------------------------------
# D: board must list only trusted issues. issues-open.jsonlines holds trusted
# #10 (COLLABORATOR) and stranger #11 (NONE) with DISTINCT titles so the
# assertions are unambiguous. D1 is the positive control (passes today and in
# GREEN). Today `board` lists both -> D2 RED.
# --------------------------------------------------------------------------
d="$(newdir D)"
row "$d/issue-10.json" 10 "trusted task" goodagent COLLABORATOR
row "$d/issue-11.json" 11 "stranger poison" stranger1 NONE
cat "$d/issue-10.json" "$d/issue-11.json" >"$d/issues-open.jsonlines"
out="$(run_coord "$d" board)"
expect_contains "D1 board lists trusted issue (positive control)" "trusted task" "$out"
expect_absent "D2 board hides stranger issue [RED today]" "stranger poison" "$out"

# --------------------------------------------------------------------------
# E: a per-issue command on a stranger-authored issue must be refused with a
# coord: diagnostic. Today `show 11` prints the issue happily -> RED.
# --------------------------------------------------------------------------
d="$(newdir E)"
jq -cn '{number:11, title:"stranger issue", state:"open",
  labels:[{name:"status:unclaimed"},{name:"ws:docs"}], assignees:[],
  body:"## Files\na.txt", author:{login:"stranger1"},
  author_association:"NONE", comments:[]}' >"$d/issue-11.json"
out="$(run_coord "$d" show 11)"
expect_contains "E show on stranger issue refused (coord: message) [RED today]" "coord:" "$out"

# --------------------------------------------------------------------------
# F: comment reads must paginate; page-2 trusted events must be ingested.
# comments-5.jsonlines: 131 REST comments; .page2 marker "100" -> page 1 =
# lines 1-100 (trusted STATUS heartbeats), page 2 = lines 101-131: 1 stranger
# STATUS poison at the head, 29 trusted STATUS, and the ONLY REVIEW comment
# carrying "pr: example/rc/pull/9" (trusted goodagent). issue-5.json (today's
# gh-shape source) has comments:[] and no pr: link, so `done 5` (no --pr)
# sees no PR; today it even dies in the prurl-scan jq on the empty result
# (set -e abort). GREEN: gate paginates REST comments, finds the page-2 pr:,
# checks pr-9.json (OPEN) -> done refuses: "PR #9 is not merged yet".
# Assertions: (1) "not merged yet" in output [RED: absent]; (2) stub log
# shows a page=2 REST fetch [RED: zero page=2 calls - single-page ingest].
# --------------------------------------------------------------------------
d="$(newdir F)"
{
  for _ in $(seq 1 100); do
    c '**STATUS** | agent: a | human: @a | at: 2020-01-01T00:00:00Z' goodagent 2020-01-01T00:00:00Z COLLABORATOR
  done
  c '**STATUS** | agent: evil | human: @evil | at: 2020-01-01T00:00:00Z' stranger1 2020-01-01T00:00:00Z NONE
  for _ in $(seq 1 29); do
    c '**STATUS** | agent: a | human: @a | at: 2020-01-01T01:00:00Z' goodagent 2020-01-01T01:00:00Z COLLABORATOR
  done
  c '**REVIEW** | agent: a | human: @a | at: 2020-01-01T00:30:00Z

pr: example/rc/pull/9' goodagent 2020-01-01T00:30:00Z COLLABORATOR
} >"$d/comments-5.jsonlines"
printf '100\n' >"$d/comments-5.jsonlines.page2"
jq -cn '{number:5, title:"t", labels:[{name:"status:in-progress"}],
  assignees:[{login:"goodagent"}], body:"x", author:{login:"goodagent"},
  author_association:"COLLABORATOR", comments:[]}' >"$d/issue-5.json"
jq -cn '{"state":"OPEN", "merged":false, "mergedAt":null}' >"$d/pr-9.json"
printf '[]\n' >"$d/issues-open.jsonlines"
log="$WORK/f-log"
: >"$log"
out="$(log_coord "$d" "$log" done 5)"
expect_contains "F page-2 trusted pr: found (done checks PR merge state) [RED today]" "not merged yet" "$out"
if grep -q "page=2" "$log"; then
  echo "PASS: F fetched comments page 2"
else
  echo "FAIL: F fetched comments page 2 (single-page ingest; stub calls: $(wc -l <"$log"), none with page=2) [RED]"
  sed 's/^/    | /' "$log"
  FAILS=$((FAILS + 1))
fi

echo
if [ "$FAILS" -eq 0 ]; then
  echo "ALL PASS (end-state behavior achieved)"
else
  echo "FAILURES: $FAILS (RED baseline: these are the ingestion-gate gaps)"
  exit 1
fi