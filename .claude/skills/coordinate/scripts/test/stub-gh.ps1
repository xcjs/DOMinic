#!/usr/bin/env powershell
# Stub gh for fixture tests (PowerShell): serves canned JSON keyed by args.
# Mirrors stub-gh.sh exactly; see that file for the fixture contract.
# Env: COORD_STUB_DIR (required), COORD_STUB_LOG (optional).

if (-not $env:COORD_STUB_DIR) { [Console]::Error.WriteLine('stub: COORD_STUB_DIR required'); exit 1 }
$DIR = $env:COORD_STUB_DIR
$LOG = $env:COORD_STUB_LOG
if ($LOG) { Add-Content -LiteralPath $LOG -Value ($args -join ' ') }

function Serve-Verbatim([string]$f) {
  if (Test-Path -LiteralPath $f) { Get-Content -LiteralPath $f -Raw; exit 0 }
  [Console]::Error.WriteLine("stub: no fixture $f")
  exit 1
}

function Serve-Paged([string]$f, [string]$args_) {
  if (-not (Test-Path -LiteralPath $f)) {
    [Console]::Error.WriteLine("stub: no fixture $f")
    exit 1
  }
  $page = 1
  if ($args_ -like '*page=2*') { $page = 2 }
  $p2 = "$f.page2"
  if (Test-Path -LiteralPath $p2) {
    $n = [int](Get-Content -LiteralPath $p2 -Raw).Trim()
    if ($page -eq 1) { Get-Content -LiteralPath $f -TotalCount $n }
    else { Get-Content -LiteralPath $f | Select-Object -Skip $n }
  } else {
    Get-Content -LiteralPath $f
  }
  exit 0
}

$a = @($args)
while ($a.Count -gt 0 -and [string]::IsNullOrEmpty([string]$a[$a.Count - 1])) { $a = $a[0..($a.Count - 2)] }
if ($a.Count -gt 0 -and [string]::IsNullOrEmpty([string]$a[0])) { $a = @($a | Select-Object -Skip 1) }
$argv = @([string[]]$a)

# gh api user (identity)
if ($argv.Count -ge 2 -and $argv[0] -eq 'api' -and $argv[1] -eq 'user') {
  $u = Join-Path $DIR 'user.json'
  if (Test-Path -LiteralPath $u) { Get-Content -LiteralPath $u -Raw } else { '{"login":"test-agent"}' }
  exit 0
}

# REST: repos/.../issues/<n>/comments and repos/.../issues?state=open
if ($argv.Count -ge 3 -and $argv[0] -eq 'api' -and $argv[1] -eq 'repos') {
  $rest = [string]$argv[2]
  if ($rest -like '*/comments*') {
    $m = [regex]::Match($rest, '/issues/(\d+)/comments')
    if ($m.Success) { Serve-Paged (Join-Path $DIR ("comments-$($m.Groups[1].Value).json")) $rest }
    exit 1
  }
  if ($rest -like '*issues?state=open*') { Serve-Paged (Join-Path $DIR 'issues-open.json') $rest }
  [Console]::Error.WriteLine("stub: unhandled api call: $($argv -join ' ')")
  exit 1
}

# gh issue view <n>: serve stored JSON verbatim.
if ($argv.Count -ge 3 -and $argv[0] -eq 'issue' -and $argv[1] -eq 'view') {
  Serve-Verbatim (Join-Path $DIR ("issue-$($argv[2]).json"))
}

# gh pr view <n>: serve stored JSON verbatim.
if ($argv.Count -ge 3 -and $argv[0] -eq 'pr' -and $argv[1] -eq 'view') {
  Serve-Verbatim (Join-Path $DIR ("pr-$($argv[2]).json"))
}

# gh issue list [... --label L]: label-filtered fixture if present.
if ($argv.Count -ge 2 -and $argv[0] -eq 'issue' -and $argv[1] -eq 'list') {
  $label = [regex]::Match(($argv -join ' '), '--label ([^ ]+)').Groups[1].Value
  $f = Join-Path $DIR 'issues-open.json'
  if ($label -and (Test-Path -LiteralPath (Join-Path $DIR "issues-$label.json"))) {
    $f = Join-Path $DIR "issues-$label.json"
  }
  Get-Content -LiteralPath $f
  exit 0
}

# exit-code override + write-style commands succeed silently
exit 0