#!/usr/bin/env bash
# test-gate.sh - RED fixture tests for the coord.sh issue-ingestion gate.
# Isolation: a fake `gh` (stub-gh.sh) is shimmed onto PATH; coord.sh runs
# UNMODIFIED and never touches the network or the real repo.
#
# 7 cases: A1, B, C, D1, D2, E, F. RED contract: every case FAILS against
# ungated coord.sh because stranger (untrusted) content IS ingested through
# today's read paths; all PASS after the gate (OWNER/MEMBER/COLLABORATOR).
#
# Fixture duality: today's coord.sh reads GH-SHAPE payloads (issue view/list:
# comments carry body, author.login, createdAt); the gate will read REST-SHAPE
# (api .../comments: body, user.login, created_at, author_association).
# Every case stores its events in BOTH shapes (see stub-gh.sh header).
#
# Run:  bash test-gate.sh   (exit 0 + ALL PASS = green; exit 1 = RED gaps)
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
STUB="$HERE/stub-gh.sh"
COORD="$HERE/../coord.sh"
FIX="$HERE/fixtures"

# jq bootstrap: repo-level tools dir (sibling of the checkout), then common
# Windows installs. jq is needed by the stub, the fixtures, and coord.sh.
if ! command -v jq >/dev/null 2>&1; then
  for d in "$HERE/../../../../../../tools/bin" \
           "$HOME"/AppData/Roaming/npm/node_modules/node-jq/bin \
           /c/ProgramData/chocolatey/bin \
           "/c/Program Files/jq"; do
    if [ -x "$d/jq" ] || [ -x "$d/jq.exe" ]; then PATH="$PATH:$d"; export PATH; break; fi
  done
fi
command -v jq >/dev/null 2>&1 || { echo "test-gate.sh: jq not found on PATH" >&2; exit 2; }
export PATH

ME_LOGIN="test-agent"
FAILS=0
PASS=0
WORK="$(mktemp -d "${TMPDIR:-/tmp}/gate-tests-XXXXXX")"

mkdir -p "$WORK/bin"
printf '#!/usr/bin/env bash\nexec bash "%s" "$@"\n' "$STUB" >"$WORK/bin/gh"
chmod +x "$WORK/bin/gh"

NOWF="$(date -u +%Y-%m-%dT%H:%M:%SZ)"   # fresh heartbeat timestamp for poisons

newdir() { # name -> fresh fixture dir + user.json; prints the path
  rm -rf "$FIX/$1"
  mkdir -p "$FIX/$1"
  printf '{"login":"%s"}\n' "$ME_LOGIN" >"$FIX/$1/user.json"
  printf '%s\n' "$FIX/$1"
}
ghc() { # gh-shape comment line: body author createdAt
  jq -cn --arg b "$1" --arg a "$2" --arg t "$3" \
    '{body:$b, author:{login:$a}, createdAt:$t}'
}
c() { # REST-shape comment line: body user.login created_at author_association
  jq -cn --arg b "$1" --arg a "$2" --arg t "$3" --arg assoc "$4" \
    '{body:$b, user:{login:$a}, created_at:$t, author_association:$assoc}'
}
# gh issue view object; args: file number title assignees labels body author
# assoc; comments (gh-shape) come from a slurped JSONL file via $cm.
ghi() {
  local f="$1" n="$2" ti="$3" asg="$4" labs="$5" bd="$6" au="$7" assoc="$8" cmf="$9"
  jq -cn --argjson n "$n" --arg ti "$ti" --argjson asg "$asg" --argjson labs "$labs" \
    --arg bd "$bd" --arg au "$au" --arg assoc "$assoc" --slurpfile cm "$cmf" \
    '{number:$n, title:$ti, state:"open", assignees:$asg, labels:$labs,
      body:$bd, author:{login:$au}, author_association:$assoc, comments:$cm}' >"$f"
}
expect_contains() {
  local desc="$1" needle="$2" hay="$3"
  if grep -q -- "$needle" <<<"$hay"; then echo "PASS: $desc"; PASS=$((PASS + 1))
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
  else echo "PASS: $desc"; PASS=$((PASS + 1)); fi
}
run_coord() { # fixture-dir cmd... (stderr merged)
  local d="$1"; shift
  PATH="$WORK/bin:$PATH" COORD_STUB_DIR="$d" COORD_AGENT="$ME_LOGIN" \
    COORD_STALE_MIN="${TEST_STALE_MIN:-45}" bash "$COORD" "$@" 2>&1
}
log_coord() { # fixture-dir logfile cmd...
  local d="$1" log="$2"; shift 2
  PATH="$WORK/bin:$PATH" COORD_STUB_DIR="$d" COORD_AGENT="$ME_LOGIN" COORD_STALE_MIN=45 \
    COORD_STUB_LOG="$log" bash "$COORD" "$@" 2>&1
}

# --------------------------------------------------------------------------
# A1: stranger CLAIM must not reset the heartbeat/stale timer.
# Issue 10 is assigned to victim; its ONLY protocol comment is a FRESH
# stranger1 CLAIM (author_association NONE). RED today: the heartbeat read
# ingests it -> issue 10 looks fresh -> absent from `stale`. GREEN: the gate
# filters the stranger CLAIM -> "no heartbeat" -> issue 10 listed stale.
# --------------------------------------------------------------------------
d="$(newdir A1)"
EV_A1="**CLAIM** | agent: evil | human: @evil | at: $NOWF"
printf '%s\n' "$(ghc "$EV_A1" stranger1 "$NOWF")" >"$d/ghc-a1.jsonl"
printf '%s\n' "$(c "$EV_A1" stranger1 "$NOWF" NONE)" >"$d/comments-10.jsonlines"
ghi "$d/issue-10.json" 10 "victim task" '[{"login":"victim"}]' \
  '[{"name":"status:claimed"},{"name":"ws:docs"}]' '## Files
a.txt' victim COLLABORATOR "$d/ghc-a1.jsonl"
jq -cn --rawfile i "$d/issue-10.json" \
  '$i | fromjson | {number, title, assignees, labels, body, comments}' \
  >"$d/issues-open.jsonlines"
out="$(run_coord "$d" stale)"
expect_contains "A1 stranger CLAIM invisible to heartbeat (issue reads no heartbeat)" "no heartbeat" "$out"

# --------------------------------------------------------------------------
# B: claim-race winner must ignore the stranger's earlier CLAIM and back off
# to the TRUSTED other agent.
# racers-1.txt makes the stub add otheragent + stranger1 as concurrent
# assignees when claim assigns @me, so all three enters the race. CLAIM
# comments (both shapes, identical data; REST order = oldest first):
#   stranger1 CLAIM at T+0:02 (NONE, earliest overall -> poison)
#   otheragent CLAIM at T+0:10 (COLLABORATOR, earliest trusted)
# RED today: earliest-CLAIM selection picks stranger1 -> back-off credits
# @stranger1. GREEN: winner = otheragent -> back-off credits @otheragent.
# --------------------------------------------------------------------------
d="$(newdir B)"
{
  ghc '**CLAIM** | agent: evil | human: @evil | at: 2020-01-01T00:00:02Z' stranger1 2020-01-01T00:00:02Z
  ghc '**CLAIM** | agent: other | human: @o | at: 2020-01-01T00:00:10Z' otheragent 2020-01-01T00:00:10Z
} >"$d/ghc-b.jsonl"
{
  c '**CLAIM** | agent: evil | human: @evil | at: 2020-01-01T00:00:02Z' stranger1 2020-01-01T00:00:02Z NONE
  c '**CLAIM** | agent: other | human: @o | at: 2020-01-01T00:00:10Z' otheragent 2020-01-01T00:00:10Z COLLABORATOR
} >"$d/comments-1.jsonlines"
ghi "$d/issue-1.json" 1 "t" '[]' '[{"name":"status:unclaimed"}]' '## Files
b.txt' otheragent COLLABORATOR "$d/ghc-b.jsonl"
printf 'otheragent\nstranger1\n' >"$d/racers-1.txt"
printf '[]\n' >"$d/issues-open.jsonlines"
out="$(run_coord "$d" claim 1)"
expect_contains "B race winner is trusted otheragent (back-off credits @otheragent)" "@otheragent" "$out"
expect_absent "B stranger never credited" "@stranger1" "$out"

# --------------------------------------------------------------------------
# C: accept must not copy the stranger's PROPOSE into ## Agreed.
# Contract issue 2; PROPOSE comments (oldest first):
#   goodagent (COLLABORATOR) GOOD CONTRACT at :01
#   stranger1 (NONE)         EVIL CONTRACT at :02  <- LAST PROPOSE
# RED today: accept takes the LAST visible PROPOSE -> EVIL CONTRACT flows
# into the `issue edit --body` rewrite, visible verbatim in COORD_STUB_LOG.
# GREEN: only trusted PROPOSEs are candidates -> GOOD recorded, EVIL never.
# Second run re-checks with the orderings swapped (EVIL first, GOOD last) so
# the gate's candidate list stays trusted-only regardless of order.
# --------------------------------------------------------------------------
d="$(newdir C)"
GOOD_P='**PROPOSE** | agent: good | human: @g | at: 2020-01-01T00:01:00Z

GOOD CONTRACT'
EVIL_P='**PROPOSE** | agent: evil | human: @evil | at: 2020-01-01T00:02:00Z

EVIL CONTRACT'
{ ghc "$GOOD_P" goodagent 2020-01-01T00:01:00Z
  ghc "$EVIL_P" stranger1 2020-01-01T00:02:00Z
} >"$d/ghc-c.jsonl"
{ c "$GOOD_P" goodagent 2020-01-01T00:01:00Z COLLABORATOR
  c "$EVIL_P" stranger1 2020-01-01T00:02:00Z NONE
} >"$d/comments-2.jsonlines"
ghi "$d/issue-2.json" 2 "contract t" '[]' '[{"name":"type:contract"}]' \
  'base body' goodagent COLLABORATOR "$d/ghc-c.jsonl"
printf '[]\n' >"$d/issues-open.jsonlines"
log="$WORK/c-log"; : >"$log"
log_coord "$d" "$log" accept 2 >/dev/null
# Run 1 (EVIL is the LAST PROPOSE):
expect_absent "C stranger PROPOSE never recorded (run 1)" "EVIL CONTRACT" "$(cat "$log")"
expect_contains "C trusted PROPOSE is the recorded one (run 1)" "GOOD CONTRACT" "$(cat "$log")"
# Run 2 (swap order: GOOD last, EVIL first) - candidate source must stay
# trusted-only; recorded text must still be GOOD.
ghc "$EVIL_P" stranger1 2020-01-01T00:02:00Z >"$d/ghc-c.jsonl"
ghc "$GOOD_P" goodagent 2020-01-01T00:01:00Z >>"$d/ghc-c.jsonl"
{
  c "$EVIL_P" stranger1 2020-01-01T00:02:00Z NONE
  c "$GOOD_P" goodagent 2020-01-01T00:01:00Z COLLABORATOR
} >"$d/comments-2.jsonlines"
ghi "$d/issue-2.json" 2 "contract t" '[]' '[{"name":"type:contract"}]' \
  'base body' goodagent COLLABORATOR "$d/ghc-c.jsonl"
log="$WORK/c2-log"; : >"$log"
log_coord "$d" "$log" accept 2 >/dev/null
expect_absent "C stranger PROPOSE never recorded (run 2, reordered)" "EVIL CONTRACT" "$(cat "$log")"
expect_contains "C trusted PROPOSE is the recorded one (run 2, reordered)" "GOOD CONTRACT" "$(cat "$log")"

# --------------------------------------------------------------------------
# D: board lists only trusted-authored open issues.
# Rows: #10 trusted task (goodagent, COLLABORATOR) / #11 stranger poison
# (stranger1, author_association NONE). Distinct titles make the assertions
# unambiguous. D1 is the positive control: trusted ingestion must KEEP
# working after the gate (it passes today and must pass in GREEN too).
# RED today: D2 fails - board lists the stranger issue too.
# --------------------------------------------------------------------------
d="$(newdir D)"
ghi "$d/issue-10.json" 10 "trusted task" '[]' \
  '[{"name":"status:unclaimed"},{"name":"ws:docs"}]' '## Files
a.txt' goodagent COLLABORATOR /dev/null
ghi "$d/issue-11.json" 11 "stranger poison" '[]' \
  '[{"name":"status:unclaimed"},{"name":"ws:docs"}]' '## Files
a.txt' stranger1 NONE /dev/null
cat "$d/issue-10.json" "$d/issue-11.json" >"$d/issues-open.jsonlines"
out="$(run_coord "$d" board)"
expect_contains "D1 board lists trusted issue (positive control)" "trusted task" "$out"
expect_absent "D2 board hides stranger issue" "stranger poison" "$out"

# --------------------------------------------------------------------------
# E: a per-issue command on an untrusted (stranger-authored) issue must be
# refused with a coord: diagnostic. Issue 11 is stranger-authored.
# RED today: `show 11` prints the issue happily (no coord: refusal).
# GREEN: the gate dies with "coord: ... not trusted ..." before reading.
# --------------------------------------------------------------------------
d="$(newdir E)"
ghi "$d/issue-11.json" 11 "stranger issue" '[]' \
  '[{"name":"status:unclaimed"},{"name":"ws:docs"}]' '## Files
a.txt' stranger1 NONE /dev/null
printf '[]\n' >"$d/issues-open.jsonlines"
out="$(run_coord "$d" show 11)"
expect_contains "E show on stranger issue refused (coord: message)" "coord:" "$out"

# --------------------------------------------------------------------------
# F: comment reads must paginate; page-2 trusted events must be ingested.
# comments-5.jsonlines: 131 REST comments; .page2=100 -> page 1 = lines 1-100
# (trusted STATUS heartbeats), page 2 = lines 101-131 (1 stranger STATUS
# poison, 29 trusted STATUS, and the ONLY REVIEW comment carrying
# "pr: example/rc/pull/9" from trusted goodagent).
# issue-5.json carries one gh-shape STATUS without any pr: link, so today's
# single-shot gh-shape read finds no PR and `done 5` just closes.
# RED today: the stub log shows ZERO page=2 fetches (single-page ingest) and
# the page-2 trusted REVIEW/pr is never seen. GREEN: the gate paginates the
# REST comments, so the log contains page=2 and the trusted page-2 event is
# ingested (Task 3 also feeds it into done's PR-merge check).
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
ghc '**STATUS** | agent: a | human: @a | at: 2020-01-01T00:00:00Z' goodagent 2020-01-01T00:00:00Z >"$d/ghc-f.jsonl"
ghi "$d/issue-5.json" 5 "t" '[{"login":"goodagent"}]' \
  '[{"name":"status:in-progress"}]' 'x' goodagent COLLABORATOR "$d/ghc-f.jsonl"
jq -cn '{"state":"OPEN","merged":false,"mergedAt":null}' >"$d/pr-9.json"
printf '[]\n' >"$d/issues-open.jsonlines"
log="$WORK/f-log"; : >"$log"
log_coord "$d" "$log" done 5 >/dev/null
if grep -q "page=2" "$log"; then
  echo "PASS: F fetched comments page 2 (paginated ingest)"; PASS=$((PASS + 1))
else
  echo "FAIL: F fetched comments page 2 (single-page ingest; page-2 trusted events never seen) [RED]"
  printf '%s\n' "    | $(grep -c . "$log") stub calls, none with page=2"
  FAILS=$((FAILS + 1))
fi

echo
if [ "$FAILS" -eq 0 ]; then
  echo "ALL PASS ($PASS assertions)"
  exit 0
fi
echo "FAILURES: $FAILS (RED baseline: these are the ingestion-gate gaps; see task-1-report.md)"
exit 1