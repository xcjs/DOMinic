#!/usr/bin/env bash
# stub-gh.sh - gh CLI stub for the coordination fixture tests (network-free).
# Invoked as `gh` via a PATH shim created by test-gate.sh / test-gate.ps1.
#
#coord.sh passes jq programs to gh via --jq (real gh applies them client-side),
# so this stub APPLIES --jq with real jq. A jq error fails loudly (exit 1)
# instead of leaking raw JSON into the caller.
#
# Serves canned JSON from $COORD_STUB_DIR; logs argv to $COORD_STUB_LOG and
# (optionally) argv+response to $COORD_STUB_RESP for debugging.
#
# Fixtures (JSON-lines file = one JSON object per line; served as an array):
#   user.json                     api user (login emitted bare for --jq .login)
#   comments-<N>.jsonlines        api repos/O/R/issues/N/comments (REST shape)
#   comments-<N>.jsonlines.page2  optional: page-1 line count; page 2 = rest
#   issues-open.jsonlines         gh issue list AND api issues?state=open rows
#   issue-<N>.json                issue view N (served verbatim, then --jq)
#   issues-<label>.jsonlines      issue list --label L (else issues-open)
#   pr-<N>.json                   pr view N (served verbatim, then --jq)
#   racers-<N>.txt                claim-race simulation: logins that become
#                                 assignees when `issue edit N --add-assignee @me`
#                                 runs (assignees := [me] + racers, replacing)
# Write commands (comment, edit body/labels, close, pin, label): exit 0 silent.
set -uo pipefail
DIR="${COORD_STUB_DIR:?COORD_STUB_DIR required}"
[ -n "${COORD_STUB_LOG:-}" ] && printf '%s\n' "$*" >>"$COORD_STUB_LOG"
resp_log() { # ARGV OUT
  [ -n "${COORD_STUB_RESP:-}" ] &&
    { printf 'ARGV: %s\nOUT: %s\n---\n' "$1" "$2" >>"$COORD_STUB_RESP"; } || true
}

emit_login() { sed -n 's/.*"login":"\([^"]*\)".*/\1/p' "$1"; }

jsonlines_to_array() {
  if [ -s "$1" ]; then
    jq -s 'map(.)' "$1"
  else
    echo "[]"
  fi
}

# serve_paged <file> <argv> - if <file>.page2 exists it holds the page-1 line
# count N; page 1 serves lines 1..N, page P>=2 serves lines (P-1)*N+1..end
# (empty for P beyond the file). Otherwise the whole file is one JSON array.
serve_paged() { # file argv
  local f="$1" argv="$2" n part p
  if [ -f "$f.page2" ]; then
    n="$(cat "$f.page2")"
    p="$(printf '%s' "$argv" | sed -n 's/.*[?&]page=\([0-9]*\).*/\1/p')"
    p="${p:-1}"
    if [ "$p" = "1" ]; then
      part="$(head -n "$n" "$f")"
    else
      part="$(tail -n +$(((p - 1) * n + 1)) "$f")"
    fi
    if [ -n "$part" ]; then printf '%s\n' "$part" | jq -s 'map(.)'; else echo "[]"; fi
  else
    jsonlines_to_array "$f"
  fi
}

# next_val <flag> <argv...> - the value following flag, if any
next_val() {
  local flag="$1"; shift
  local prev="" a
  for a in "$@"; do
    if [ "$prev" = "$flag" ]; then printf '%s' "$a"; return 0; fi
    prev="$a"
  done
  return 1
}

# jq_apply <prog> <json> - apply gh's --jq client-side; loud on error.
jq_apply() {
  local prog="$1" json="$2" out
  if [ -z "$prog" ]; then printf '%s\n' "$json"; return 0; fi
  if ! out="$(jq -r "$prog" <<<"$json" 2>&1)"; then
    printf 'stub: jq error for prog [%s]: %s\n' "$prog" "$out" >&2
    return 1
  fi
  printf '%s\n' "$out"
}

# ---- gh api user ----
if [ "$1" = "api" ] && [ "$2" = "user" ]; then
  jqprog="$(next_val --jq "$@" || true)"
  if [ -s "$DIR/user.json" ]; then
    out="$(cat "$DIR/user.json")"
    res="$(jq_apply "$jqprog" "$out")" || exit 1
  else
    res="test-agent"
  fi
  resp_log "$* | jq=$jqprog" "$res"
  printf '%s\n' "$res"
  exit 0
fi

# ---- gh api REST endpoints ----
if [ "$1" = "api" ]; then
  jqprog="$(next_val --jq "$@" || true)"
  case "$*" in
    *"issues/"*"/comments"*)
      iss="$(printf '%s' "$*" | sed -n 's|.*/issues/\([0-9]*\)/comments.*|\1|p')"
      out="$(serve_paged "$DIR/comments-$iss.jsonlines" "$*")"
      ;;
    *"issues?"*)
      out="$(serve_paged "$DIR/issues-open.jsonlines" "$*")"
      ;;
    *"issues/"*) # single issue GET (comments matched above)
      iss="$(printf '%s' "$*" | sed -n 's|.*/issues/\([0-9]*\).*$|\1|p')"
      if [ -n "$iss" ] && [ -f "$DIR/issue-$iss.json" ]; then
        out="$(cat "$DIR/issue-$iss.json")"
      else
        out="{}"
      fi
      ;;
    *)
      out="[]"
      ;;
  esac
  res="$(jq_apply "$jqprog" "$out")" || exit 1
  resp_log "$* | jq=$jqprog" "$res"
  printf '%s\n' "$res"
  exit 0
fi

# ---- gh issue view ----
if [ "$1" = "issue" ] && [ "$2" = "view" ]; then
  f="$DIR/issue-$3.json"
  [ -f "$f" ] || { echo "stub: missing fixture $f" >&2; exit 1; }
  jqprog="$(next_val --jq "$@" || true)"
  out="$(cat "$f")"
  res="$(jq_apply "$jqprog" "$out")" || exit 1
  resp_log "$* | jq=$jqprog" "$res"
  printf '%s\n' "$res"
  exit 0
fi

# ---- gh issue list ----
if [ "$1" = "issue" ] && [ "$2" = "list" ]; then
  lab="$(printf '%s' "$*" | sed -n 's/.*--label \([^ ]*\).*/\1/p')"
  f="$DIR/issues-open.jsonlines"
  [ -n "$lab" ] && [ -f "$DIR/issues-$lab.jsonlines" ] && f="$DIR/issues-$lab.jsonlines"
  jqprog="$(next_val --jq "$@" || true)"
  out="$(jsonlines_to_array "$f")"
  res="$(jq_apply "$jqprog" "$out")" || exit 1
  resp_log "$* | jq=$jqprog" "$res"
  printf '%s\n' "$res"
  exit 0
fi

# ---- gh pr view ----
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then
  f="$DIR/pr-$3.json"
  [ -f "$f" ] || { echo "stub: missing fixture $f" >&2; exit 1; }
  jqprog="$(next_val --jq "$@" || true)"
  out="$(cat "$f")"
  res="$(jq_apply "$jqprog" "$out")" || exit 1
  resp_log "$* | jq=$jqprog" "$res"
  printf '%s\n' "$res"
  exit 0
fi

# ---- mutations: gh issue edit (assignee add/remove) ----
# `issue edit N --add-assignee @me` with racers-<N>.txt present replaces the
# assignee list with [me] + racers (standing in for concurrent claimants).
if [ "$1" = "issue" ] && [ "$2" = "edit" ]; then
  n="$3"
  f="$DIR/issue-$n.json"
  if [ -f "$f" ] && printf '%s' "$*" | grep -q -- '--add-assignee @me' && [ -f "$DIR/racers-$n.txt" ]; then
    me="test-agent"
    [ -s "$DIR/user.json" ] && me="$(emit_login "$DIR/user.json")"
    extra="$(jq -R -s 'split("\n") | map(select(length > 0)) | map({login: .})' "$DIR/racers-$n.txt")"
    jq -c --arg me "$me" --argjson extra "$extra" \
      '.assignees = (([{login: $me}] + $extra) | unique_by(.login))' "$f" >"$f.tmp" &&
      mv "$f.tmp" "$f"
    resp_log "$*" "$(cat "$f")"
  elif [ -f "$f" ] && v="$(next_val --remove-assignee "$@" || true)" && [ -n "$v" ]; then
    [ "$v" = "@me" ] && v="$(emit_login "$DIR/user.json")"
    jq -c --arg a "$v" '.assignees |= map(select(.login != $a))' "$f" >"$f.tmp" && mv "$f.tmp" "$f"
    resp_log "$*" "$(cat "$f")"
  fi
  exit 0
fi

# Everything else (issue comment/edit bodies, close, pin, label, ...): silent no-op.
exit 0