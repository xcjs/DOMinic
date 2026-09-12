# coord.ps1 - multi-agent coordination over GitHub Issues via the gh CLI.
# Protocol: ../SKILL.md and ../references/protocol.md
# Usage:    powershell -File .claude/skills/coordinate/scripts/coord.ps1 <command> [args]
# Env:      COORD_AGENT (who you are), COORD_REPO, COORD_STALE_MIN
# Windows counterpart of coord.sh; use this on Windows hosts.

$ErrorActionPreference = 'Stop'

$REPO      = if ($env:COORD_REPO)      { $env:COORD_REPO }      else { 'xcjs/DOMinic' }
$AGENT     = if ($env:COORD_AGENT)     { $env:COORD_AGENT }     else { 'unknown-agent' }
$STALE_MIN = if ($env:COORD_STALE_MIN) { [int]$env:COORD_STALE_MIN } else { 45 }
$HUB_TITLE = 'Coordination hub'
$STATUSES  = @('unclaimed', 'claimed', 'in-progress', 'blocked', 'in-review')
$HEARTBEAT = '^\*\*(CLAIM|STATUS|UNBLOCKED|HANDOFF)\*\*'

function Die([string]$msg) {
  [Console]::Error.WriteLine("coord: $msg")
  exit 1
}

function Note([string]$msg) { [Console]::Error.WriteLine("coord: $msg") }
function Now { (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') }

# Find gh.exe: PATH first, then the standard install dir (common on Windows).
$GH = $null
$c = Get-Command gh -ErrorAction SilentlyContinue
if ($c) { $GH = $c.Source }
else {
  $p = Join-Path $env:ProgramFiles 'GitHub CLI\gh.exe'
  if (Test-Path $p) { $GH = $p }
  else { Die 'gh CLI not found: https://cli.github.com' }
}
& $GH auth status *> $null
if ($LASTEXITCODE -ne 0) { Die 'gh is not authenticated; run: gh auth login' }
$ME = (& $GH api user | ConvertFrom-Json).login

function Gh {
  & $GH @args
  if ($LASTEXITCODE -ne 0) { Die "gh exited $LASTEXITCODE on: gh $($args -join ' ')" }
}

function Parse-Iso([string]$s) {
  $d = [datetime]::Parse($s, [Globalization.CultureInfo]::InvariantCulture,
        [Globalization.DateTimeStyles]::RoundtripKind)
  if ($d.Kind -ne [datetimekind]::Utc) { $d = $d.ToUniversalTime() }
  $d
}

function Header([string]$verb) {
  '**{0}** | agent: {1} | human: @{2} | at: {3}' -f $verb, $AGENT, $ME, (Now)
}

function Comment([int]$issue, [string]$verb, [string]$body) {
  & $GH issue comment $issue --repo $REPO --body ((Header $verb) + "`n`n" + $body) *> $null
  if ($LASTEXITCODE -ne 0) { Die "failed to comment on #$issue" }
  "#$issue <- $verb"
}

function Get-IssueJson([int]$n, [string]$fields) {
  Gh issue view $n --repo $REPO --json $fields | ConvertFrom-Json
}

function Labels-Of([int]$n) {
  @(Get-IssueJson $n labels).labels | ForEach-Object { $_.name }
}

function Assignees-Of([int]$n) {
  @(Get-IssueJson $n assignees).assignees | ForEach-Object { $_.login }
}

function Has-Label([int]$n, [string]$label) {
  (Labels-Of $n) -contains $label
}

function Set-Status([int]$n, [string]$status) {
  $a = @('--add-label', "status:$status")
  foreach ($s in $STATUSES) { if ($s -ne $status) { $a += @('--remove-label', "status:$s") } }
  & $GH issue edit $n --repo $REPO @a *> $null
  if ($LASTEXITCODE -ne 0) { Die "failed to set status:$status on #$n" }
}

function Hub-Number {
  $r = Gh issue list --repo $REPO --label hub --state open --limit 1 --json number |
       ConvertFrom-Json
  if (@($r).Count -gt 0) { @($r)[0].number } else { $null }
}

# Minutes since the last heartbeat verb on an issue; 999999 if none.
function Heartbeat-Age([int]$n) {
  $comments = @(Get-IssueJson $n comments).comments
  $times = @($comments | Where-Object { $_.body -match $HEARTBEAT } |
             ForEach-Object { Parse-Iso $_.createdAt })
  if ($times.Count -eq 0) { return 999999 }
  [math]::Floor((((Get-Date).ToUniversalTime() - ($times | Measure-Object -Maximum).Maximum).TotalMinutes))
}

function Is-Stale([int]$n) { (Heartbeat-Age $n) -gt $STALE_MIN }

$KNOWN_OPTS = @('--plan', '--eta', '--reason', '--by', '--to', '--pr', '--ws',
                '--p', '--type', '--files', '--done', '--depends', '--body')
$KNOWN_FLAGS = @('--claim', '--stale', '--human')

# Generic option parser: sets $POS (positionals), $OPT (name -> value), $FLAG.
function Parse-Args([object[]]$argv) {
  $script:POS = @()
  $script:OPT = @{}
  $script:FLAG = @{}
  $i = 0
  while ($i -lt $argv.Count) {
    $a = [string]$argv[$i]
    if ($KNOWN_OPTS -contains $a) {
      if ($i + 1 -ge $argv.Count) { Die "$a needs a value" }
      $script:OPT[$a.Substring(2)] = [string]$argv[$i + 1]
      $i += 2
    } elseif ($KNOWN_FLAGS -contains $a) {
      $script:FLAG[$a.Substring(2)] = $true
      $i += 1
    } elseif ($a.StartsWith('--')) {
      Die "unknown option $a"
    } else {
      $script:POS += $a
      $i += 1
    }
  }
}

function Need-Issue {
  $script:N = -1
  if ($POS.Count -ge 1 -and $POS[0] -match '^\d+$') { $script:N = [int]$POS[0] }
  if ($N -lt 0) { Die 'first argument must be an issue number' }
}

# "@a @b" for everyone who posted PROPOSE/COUNTER + assignees + author.
function Mention-Humans([int]$n) {
  $j = Get-IssueJson $n 'author,assignees,comments'
  $logins = @($j.author.login) + @($j.assignees | ForEach-Object { $_.login })
  foreach ($c in @($j.comments)) {
    if ($c.body.StartsWith('**PROPOSE**') -or $c.body.StartsWith('**COUNTER**')) {
      $logins += $c.author.login
    }
  }
  ($logins | Select-Object -Unique | ForEach-Object { "@$_" }) -join ' '
}

function Usage {
  @'
coord.ps1 - multi-agent coordination over GitHub Issues via the gh CLI.
Protocol: SKILL.md and references/protocol.md
Env:      COORD_AGENT (who you are), COORD_REPO, COORD_STALE_MIN

Commands:
  setup                                  labels + pinned hub issue (idempotent)
  sync                                   board, your claims, stale, needs-human, hub tail
  board                                  open issues by ws/status/owner/files
  hub "text"                             post SYNC on the hub issue
  new "title" --ws X [--p 0|1|2] [--type task|contract|decision|bug]
      [--files G] [--done "a;b"] [--depends "#n"] [--body T] [--claim]
  claim N [--plan T] [--eta T]           assign yourself (refuses if owned)
  release N [--reason T] [--stale]       unassign (--stale: anyone, if abandoned)
  status N "text"                        heartbeat + progress
  block N --by "#m|@u" "text"            mark blocked
  unblock N "text"                       mark unblocked
  question N [--to @u] [--human] "text"  ask (--human labels needs-human)
  answer N "text"                        answer (clears needs-human)
  propose N [--to @u] "text"             propose an interface / split / plan
  accept N ["text"]                      accept latest proposal (contracts: record it)
  counter N "text"                       counter-propose (4th round escalates)
  reject N "reason"                      reject latest proposal
  handoff N --to @u "text"               transfer ownership
  review N --pr URL                      mark in-review
  done N [--pr URL] ["text"]             close + notify dependents
  stale                                  list stale claims
  show N                                 issue + protocol comment history
'@ | Write-Output
}

function Cmd-Setup {
  Note "labels on $REPO"
  $rows = @(
    'ws:os-shell|1d76db|SDE 1 - window manager, taskbar, desktop',
    'ws:agent-chat|5319e7|SDE 2 - /api/chat, streaming UI, tool execution',
    'ws:runtime-engine|e99695|SDE 3 - vue3-sfc-loader runner, error boundary',
    'ws:persistence|0e8a16|SDE 4 - VFS, registry hydration, settings',
    'ws:integration|fbca04|SDE 5 - Settings app, demo apps, polish',
    'ws:docs|c5def5|ADRs, README, submission writing',
    'status:unclaimed|ededed|Nobody owns this yet - claim it',
    'status:claimed|c2e0c6|Assigned; work not started',
    'status:in-progress|0e8a16|Actively being worked',
    'status:blocked|b60205|Waiting on another issue or person',
    'status:in-review|fbca04|PR open, needs review',
    'p0|b60205|On the demo golden path - must ship',
    'p1|d93f0b|Important, not demo-critical',
    'p2|fef2c0|Nice to have',
    'type:task|0075ca|A unit of work',
    'type:contract|5319e7|Interface agreement between workstreams',
    'type:decision|d876e3|A choice the team must make (may become an ADR)',
    'type:bug|d73a4a|Something broken',
    'needs-human|e11d21|Agents could not converge - a human must decide',
    'hub|000000|Pinned coordination hub (SYNC comments only)'
  )
  foreach ($r in $rows) {
    $f = $r -split '\|', 3
    Gh label create $f[0] --repo $REPO --color $f[1] --description $f[2] --force *> $null
    "  label  $($f[0])" | Write-Output
  }
  $hub = Hub-Number
  if (-not $hub) {
    $body = @'
Pinned. Agents post **SYNC** one-liners here at the start of a session and
whenever their focus changes (`coord hub "..."`). Read the last few before
starting work.

Protocol: `.claude/skills/coordinate/SKILL.md` - Claude Code users run
`/coordinate sync`; any agent with `gh` can follow `references/protocol.md`.

Board: `coord.ps1 board` (Windows) or `coord.sh board` (POSIX) - or filter
issues by `ws:*`, `status:*`, `p0`, `needs-human`.
'@
    $url = Gh issue create --repo $REPO --title $HUB_TITLE --label hub --body $body
    $hub = ([string]$url -split '/')[-1]
    & $GH issue pin $hub --repo $REPO *> $null
    "  hub    #$hub created and pinned" | Write-Output
  } else {
    "  hub    #$hub exists" | Write-Output
  }
}

function Board-Rows {
  $issues = Gh issue list --repo $REPO --state open --limit 100 `
    --json 'number,title,labels,assignees,body' | ConvertFrom-Json
  $rows = @()
  foreach ($i in $issues) {
    $labels = @($i.labels | ForEach-Object { $_.name })
    if ($labels -contains 'hub') { continue }
    $status = '-'; $ws = '-'; $p = '-'
    foreach ($l in $labels) {
      if ($l.StartsWith('status:')) { $status = $l.Substring(7) }
      elseif ($l.StartsWith('ws:'))  { $ws = $l.Substring(3) }
      elseif ($l -match '^p[0-2]$')  { $p = $l }
    }
    $owner = @($i.assignees | ForEach-Object { "@$($_.login)" }) -join ','
    if (-not $owner) { $owner = '-' }
    $body = if ($null -eq $i.body) { '' } else { $i.body }
    $m = [regex]::Match($body, '## Files\s*\n([^#]*)')
    $files = ''
    if ($m.Success) {
      $files = ($m.Groups[1].Value -replace "`r", '' -replace "`n", ' ' `
                -replace '_\(none listed\)_', '').Trim()
    }
    if ($files.Length -gt 48) { $files = $files.Substring(0, 48) }
    $rows += [pscustomobject]@{
      Issue = "#$($i.number)"; Status = $status; WS = $ws; P = $p
      Owner = $owner; Title = $i.title; Files = $files
    }
  }
  $rows | Sort-Object -Property P, WS
}

function Cmd-Board {
  $rows = Board-Rows
  ('{0,-6} {1,-12} {2,-15} {3,-3} {4,-22} {5,-44} {6}' -f
    'ISSUE', 'STATUS', 'WS', 'P', 'OWNER', 'TITLE', 'FILES') | Write-Output
  foreach ($r in $rows) {
    $t = $r.Title; if ($t.Length -gt 44) { $t = $t.Substring(0, 44) }
    ('{0,-6} {1,-12} {2,-15} {3,-3} {4,-22} {5,-44} {6}' -f
      $r.Issue, $r.Status, $r.WS, $r.P, $r.Owner, $t, $r.Files) | Write-Output
  }
}

function Cmd-Stale {
  $issues = Gh issue list --repo $REPO --state open --limit 100 `
    --json 'number,title,assignees,comments' | ConvertFrom-Json
  foreach ($i in $issues) {
    $owners = @($i.assignees | ForEach-Object { $_.login })
    if ($owners.Count -eq 0) { continue }
    $times = @(@($i.comments) | Where-Object { $_.body -match $HEARTBEAT } |
               ForEach-Object { Parse-Iso $_.createdAt })
    if ($times.Count -gt 0) {
      $age = ((Get-Date).ToUniversalTime() - ($times | Measure-Object -Maximum).Maximum).TotalMinutes
      if ($age -le $STALE_MIN) { continue }
      $silent = '{0}m silent' -f [math]::Floor($age)
    } else {
      $silent = 'no heartbeat'
    }
    ('{0,-6} {1,-22} {2,-14} {3}' -f "#$($i.number)",
      (@($owners | ForEach-Object { "@$_" }) -join ','), $silent, $i.Title) |
      Write-Output
  }
}

function Cmd-Sync {
  "== board ($REPO) ==" | Write-Output
  Cmd-Board
  '' | Write-Output
  "== yours (@$ME) ==" | Write-Output
  $mine = Gh issue list --repo $REPO --assignee '@me' --state open `
    --json 'number,title,labels' | ConvertFrom-Json
  foreach ($i in $mine) {
    $st = @($i.labels | ForEach-Object { $_.name } |
            Where-Object { $_.StartsWith('status:') }) -join ','
    "  #$($i.number) $($i.title)  [$st]" | Write-Output
  }
  '' | Write-Output
  "== stale claims (> $STALE_MIN m) ==" | Write-Output
  Cmd-Stale | ForEach-Object { "  $_" | Write-Output }
  '' | Write-Output
  '== needs-human ==' | Write-Output
  $nh = Gh issue list --repo $REPO --label needs-human --state open `
    --json 'number,title' | ConvertFrom-Json
  foreach ($i in $nh) { "  #$($i.number) $($i.title)" | Write-Output }
  $hub = Hub-Number
  if ($hub) {
    '' | Write-Output
    "== hub #$hub, last 5 SYNC ==" | Write-Output
    $comments = @(Get-IssueJson $hub comments).comments
    $syncs = @($comments | Where-Object { $_.body.StartsWith('**SYNC**') })
    $last = @(); if ($syncs.Count -gt 0) { $last = $syncs[([Math]::Max(0, $syncs.Count - 5))..($syncs.Count - 1)] }
    foreach ($s in $last) {
      $lines = @($s.body -split "`r?`n")
      $first = $lines[0] -replace '\*\*SYNC\*\* \| agent: ', '' -replace ' \| at: .*$', ''
      $rest = ($lines | Select-Object -Skip 2) -join ' '
      "  $($s.createdAt.Substring(11, 5)) $first" | Write-Output
      if ($rest) { "     $rest" | Write-Output }
    }
  } else {
    '' | Write-Output
    '(no hub issue; run: coord setup)' | Write-Output
  }
}

function Cmd-Hub([object[]]$argv) {
  Parse-Args $argv
  $text = $POS[0]
  if (-not $text) { Die 'hub "on / blocked / next"' }
  $hub = Hub-Number
  if (-not $hub) { Die 'no hub issue; run: coord setup' }
  Comment $hub 'SYNC' $text
}

function Cmd-New([object[]]$argv) {
  Parse-Args $argv
  $title = $POS[0]
  if (-not $title) { Die 'new "title" --ws <slice> [...]' }
  $ws = $OPT['ws']
  if (-not $ws) { Die '--ws is required: os-shell|agent-chat|runtime-engine|persistence|integration|docs' }
  $p = if ($OPT['p']) { $OPT['p'] -replace '^p', '' } else { '1' }
  $type = if ($OPT['type']) { $OPT['type'] -replace '^type:', '' } else { 'task' }
  $doneItems = if ($OPT['done']) { $OPT['done'] -split ';' } else { @('') }
  $doneList = ($doneItems | ForEach-Object { "- [ ] $($_.TrimStart())" }) -join "`n"
  $goal = if ($OPT['body']) { $OPT['body'] } else { $title }
  $files = if ($OPT['files']) { $OPT['files'] } else { '_(none listed)_' }
  $depends = if ($OPT['depends']) { $OPT['depends'] } else { '_(none)_' }
  $body = "## Goal`n$goal`n`n## Done when`n$doneList`n`n## Files`n$files`n`n## Depends on`n$depends`n`n## Notes`n_(created by $AGENT for @$ME at $(Now))_`n"
  $url = Gh issue create --repo $REPO --title $title --body $body `
    --label "ws:$ws" --label "p$p" --label "type:$type" --label 'status:unclaimed'
  $n = ([string]$url -split '/')[-1]
  "#$n $url" | Write-Output
  if ($FLAG['claim']) {
    $extra = @()
    if ($OPT['plan']) { $extra += @('--plan', $OPT['plan']) }
    if ($OPT['eta'])  { $extra += @('--eta', $OPT['eta']) }
    Cmd-Claim (@($n) + $extra)
  }
}

function Cmd-Claim([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $owners = @(Assignees-Of $N)
  if ($owners -contains $ME) { Note "#$N is already yours"; return }
  if ($owners.Count -gt 0) {
    Die "#$N is held by @$(($owners -join ', ')) - use: propose $N `"split: ...`"  or  question $N `"...`""
  }
  Comment $N 'CLAIM' ("plan: $(if ($OPT['plan']) { $OPT['plan'] } else { '_(none given)_' })`neta: $(if ($OPT['eta']) { $OPT['eta'] } else { '_(none given)_' })")
  & $GH issue edit $N --repo $REPO --add-assignee '@me' *> $null
  if ($LASTEXITCODE -ne 0) { Die "failed to assign #$N" }
  Set-Status $N 'claimed'
  Start-Sleep -Seconds 2
  $all = @(Assignees-Of $N)
  if ($all.Count -gt 1) {
    $j = Get-IssueJson $N comments
    $claims = @(@($j.comments) |
      Where-Object { $_.body.StartsWith('**CLAIM**') -and $all -contains $_.author.login } |
      Sort-Object createdAt)
    $winner = $claims[0].author.login
    if ($winner -ne $ME) {
      & $GH issue edit $N --repo $REPO --remove-assignee '@me' *> $null
      Comment $N 'RELEASE' "lost claim race to @$winner (earlier CLAIM); backing off"
      Die "#$N was claimed simultaneously by @$winner - they keep it"
    }
    Note "claim race on #${N}: your CLAIM is earliest; the other claimant's script will back off"
  }
  "#$N claimed by @$ME" | Write-Output
}

function Cmd-Release([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $owners = @(Assignees-Of $N)
  if ($FLAG['stale']) {
    if ($owners.Count -eq 0) { Die "#$N has no assignee" }
    if (-not (Is-Stale $N)) {
      Die "#$N had a heartbeat within $STALE_MIN m - not stale; ask the owner"
    }
    foreach ($o in $owners) {
      & $GH issue edit $N --repo $REPO --remove-assignee $o *> $null
    }
    $prev = ($owners | ForEach-Object { "@$_" }) -join ' '
    Comment $N 'RELEASE' ("stale claim released: no heartbeat for >$STALE_MIN m. previous owner(s): $prev. reason: $(if ($OPT['reason']) { $OPT['reason'] } else { 'none given' })")
  } else {
    if ($owners -notcontains $ME) {
      Die "#$N is not yours; use --stale if it is abandoned"
    }
    & $GH issue edit $N --repo $REPO --remove-assignee '@me' *> $null
    Comment $N 'RELEASE' ("reason: $(if ($OPT['reason']) { $OPT['reason'] } else { 'none given' })")
  }
  Set-Status $N 'unclaimed'
}

function Cmd-StatusCmd([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $text) { Die 'status N "progress; next"' }
  Comment $N 'STATUS' $text
  if (Has-Label $N 'status:claimed') { Set-Status $N 'in-progress' }
}

function Cmd-Block([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $OPT['by']) { Die 'block N --by "#m or @user" "what you need"' }
  $detail = if ($text) { $text } else { '_(no detail)_' }
  Comment $N 'BLOCKED' ("by: $($OPT['by'])`n$detail")
  Set-Status $N 'blocked'
}

function Cmd-Unblock([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  Comment $N 'UNBLOCKED' ($(if ($POS[1]) { $POS[1] } else { '_(no detail)_' }))
  Set-Status $N 'in-progress'
}

function Cmd-Question([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $text) { Die 'question N [--to @u] [--human] "text"' }
  $to = if ($OPT['to']) { "to: $($OPT['to'])`n" } else { '' }
  Comment $N 'QUESTION' "$to$text"
  if ($FLAG['human']) {
    & $GH issue edit $N --repo $REPO --add-label needs-human *> $null
  }
}

function Cmd-Answer([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $text) { Die 'answer N "text"' }
  Comment $N 'ANSWER' $text
  & $GH issue edit $N --repo $REPO --remove-label needs-human *> $null 2>&1
}

function Cmd-Propose([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $text) { Die 'propose N [--to @u] "one concrete proposal"' }
  $to = if ($OPT['to']) { "to: $($OPT['to'])`n" } else { '' }
  Comment $N 'PROPOSE' "$to$text"
}

function Cmd-Accept([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  Comment $N 'ACCEPT' ($(if ($POS[1]) { $POS[1] } else { 'accepted' }))
  if (Has-Label $N 'type:contract') {
    $j = Get-IssueJson $N 'comments,body'
    $props = @(@($j.comments) |
      Where-Object { $_.body.StartsWith('**PROPOSE**') -or $_.body.StartsWith('**COUNTER**') })
    if ($props.Count -eq 0) { Note 'no proposal found to record'; return }
    $proposal = (@($props[-1].body -split "`r?`n") | Select-Object -Skip 2) -join "`n"
    $body = $j.body
    & $GH issue edit $N --repo $REPO --body "$body`n`n## Agreed`n_(accepted by @$ME via $AGENT at $(Now))_`n`n$proposal" *> $null
    if ($LASTEXITCODE -ne 0) { Die "failed to record contract on #$N" }
    "#$N contract recorded under ## Agreed" | Write-Output
  }
}

function Cmd-Counter([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $text) { Die 'counter N "revised proposal"' }
  $rounds = @(@(Get-IssueJson $N comments).comments |
    Where-Object { $_.body.StartsWith('**PROPOSE**') -or $_.body.StartsWith('**COUNTER**') }).Count
  if ($rounds -ge 3) {
    $text = "$text`n`nEscalating: this is round $($rounds + 1) without agreement. $(Mention-Humans $N) please decide."
    & $GH issue edit $N --repo $REPO --add-label needs-human *> $null
    Note "#$N escalated to needs-human"
  }
  Comment $N 'COUNTER' $text
}

function Cmd-Reject([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $text = $POS[1]
  if (-not $text) { Die 'reject N "reason"' }
  Comment $N 'REJECT' $text
}

function Cmd-Handoff([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $to = $OPT['to']
  if (-not $to) { Die 'handoff N --to @user "context"' }
  $to = $to -replace '^@', ''
  $ctx = if ($POS[1]) { $POS[1] } else { '_(no context given)_' }
  Comment $N 'HANDOFF' "to: @$to`n$ctx"
  if ((@(Assignees-Of $N)) -contains $ME) {
    & $GH issue edit $N --repo $REPO --remove-assignee '@me' *> $null
  }
  & $GH issue edit $N --repo $REPO --add-assignee $to *> $null
  if ($LASTEXITCODE -ne 0) { Die "failed to assign #$N to @$to" }
  Set-Status $N 'claimed'
}

function Cmd-Review([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $pr = if ($OPT['pr']) { $OPT['pr'] } else { '_(none given)_' }
  $extra = if ($POS[1]) { "`n$($POS[1])" } else { '' }
  Comment $N 'REVIEW' "pr: $pr$extra"
  Set-Status $N 'in-review'
}

function Cmd-Done([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $pr = if ($OPT['pr']) { $OPT['pr'] } else { '_(none given)_' }
  $extra = if ($POS[1]) { "`n$($POS[1])" } else { '' }
  Comment $N 'DONE' "pr: $pr$extra"
  & $GH issue close $N --repo $REPO *> $null
  if ($LASTEXITCODE -ne 0) { Die "failed to close #$N" }
  "#$N closed" | Write-Output
  $open = Gh issue list --repo $REPO --state open --limit 100 --json 'number,body' |
          ConvertFrom-Json
  foreach ($i in $open) {
    $b = if ($null -eq $i.body) { '' } else { $i.body }
    if ($b -match "#$N\b") {
      Comment $i.number 'DEP-DONE' "#$N is done. If it was blocking you: coord unblock $($i.number) `"...`""
    }
  }
}

function Cmd-Show([object[]]$argv) {
  Parse-Args $argv; Need-Issue
  $j = Get-IssueJson $N 'number,title,state,labels,assignees,body,comments'
  "#$($j.number) $($j.title)  [$($j.state)]" | Write-Output
  "labels:    $(@($j.labels | ForEach-Object { $_.name }) -join ', ')" | Write-Output
  "assignees: $(@($j.assignees | ForEach-Object { "@$($_.login)" }) -join ', ')" | Write-Output
  '' | Write-Output
  $j.body | Write-Output
  '' | Write-Output
  '---- protocol comments ----' | Write-Output
  foreach ($c in @($j.comments)) {
    if ($c.body -match '^\*\*[A-Z-]+\*\*') {
      "`n$($c.createdAt)  $($c.body)" | Write-Output
    }
  }
}

# ---------- dispatch ----------
if ($args.Count -eq 0) { Usage; exit 0 }
$cmd = [string]$args[0]
$rest = @()
if ($args.Count -gt 1) { $rest = @($args | Select-Object -Skip 1) }
switch ($cmd) {
  'setup'    { Cmd-Setup }
  'sync'     { Cmd-Sync }
  'board'    { Cmd-Board }
  'stale'    { Cmd-Stale }
  'hub'      { Cmd-Hub $rest }
  'new'      { Cmd-New $rest }
  'claim'    { Cmd-Claim $rest }
  'release'  { Cmd-Release $rest }
  'status'   { Cmd-StatusCmd $rest }
  'block'    { Cmd-Block $rest }
  'unblock'  { Cmd-Unblock $rest }
  'question' { Cmd-Question $rest }
  'answer'   { Cmd-Answer $rest }
  'propose'  { Cmd-Propose $rest }
  'accept'   { Cmd-Accept $rest }
  'counter'  { Cmd-Counter $rest }
  'reject'   { Cmd-Reject $rest }
  'handoff'  { Cmd-Handoff $rest }
  'review'   { Cmd-Review $rest }
  'done'     { Cmd-Done $rest }
  'show'     { Cmd-Show $rest }
  '-h'       { Usage }
  '--help'   { Usage }
  'help'     { Usage }
  default    { Usage; Die "unknown command: $cmd" }
}