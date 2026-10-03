#!/usr/bin/env node
// loop.mjs - a harness-agnostic work loop over the roadmap (NEXT.md), the
// /coordinate protocol (GitHub Issues), and the in-repo vault (second brain).
//
//   node .claude/skills/work-loop/scripts/loop.mjs <command> [options]
//   npm run loop -- <command> [options]
//
// Commands: help, status, next, start, checkpoint, resume, milestone,
//           vault-init, vault-sync. Run `help` for the full option list.
//
// No dependencies beyond Node >= 24, git, and gh. Works from any shell on any
// OS; any agent (or a human) can run it. State lives in issues, branches, and
// vault notes - never in the process.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------- setup ----
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..', '..')
const WIN = process.platform === 'win32'
const DEFAULTS = {
  roadmap: 'NEXT.md',
  vault: 'vault',
  repo: '',                       // owner/name; empty = ask gh
  coordinate: '.claude/skills/coordinate/scripts',
  issueTitlePrefix: '[{id}] ',
  branchPrefix: 'step/',
  sequentialPhases: [1],          // steps in these phases unlock in order
  parallel: { '3.1': 1 },         // step -> earliest phase it may start in
  stepHours: 4,                   // default eta posted on claim
  wsByHandle: {},                 // optional overrides: handle -> ws label
}
const cfgPath = join(HERE, '..', 'loop.config.json')
const CFG = { ...DEFAULTS, ...(existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, 'utf8')) : {}) }

const argv = process.argv.slice(2)
const cmd = argv.shift() || 'help'
const OPT = {}
const POS = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a.startsWith('--')) {
    const k = a.slice(2)
    const next = argv[i + 1]
    if (next !== undefined && !next.startsWith('--')) { OPT[k] = next; i++ } else OPT[k] = true
  } else if (a === '-m') { OPT.message = argv[++i] } else POS.push(a)
}
const ROADMAP = resolve(ROOT, OPT.roadmap || CFG.roadmap)
const VAULT = resolve(ROOT, OPT.vault || CFG.vault)
const DRY = !!OPT['dry-run']
const AGENT = process.env.COORD_AGENT || ''

const die = (m) => { console.error(`loop: ${m}`); process.exit(1) }
const note = (m) => console.error(`loop: ${m}`)
const bin = (name) => (WIN ? `${name}.exe` : name)

function run(file, args, opts = {}) {
  const r = spawnSync(file, args, { cwd: ROOT, encoding: 'utf8', ...opts })
  if (r.error) throw r.error
  if (r.status !== 0 && !opts.allowFail) {
    throw new Error(`${file} ${args.join(' ')} failed:\n${(r.stderr || '').trim()}`)
  }
  return (r.stdout || '').trim()
}
const git = (...a) => run(bin('git'), a)
const gh = (...a) => run(bin('gh'), a)
const ghJson = (...a) => JSON.parse(gh(...a) || 'null')

let _me = null
const me = () => (_me ??= gh('api', 'user', '--jq', '.login'))
let _repo = null
const repo = () => (_repo ??= CFG.repo || gh('repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'))

// /coordinate bridge: bash on POSIX / Git Bash, PowerShell otherwise.
function coord(...args) {
  if (DRY) { console.log(`  [dry-run] coord ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`); return '' }
  const dir = resolve(ROOT, CFG.coordinate)
  const env = { ...process.env, COORD_AGENT: AGENT || 'unknown-agent' }
  const useBash = process.env.COORD_SHELL === 'bash' || (process.env.COORD_SHELL !== 'pwsh' && (!WIN || process.env.MSYSTEM))
  if (useBash) return run(bin('bash'), [join(dir, 'coord.sh'), ...args], { env })
  const ps = existsSync('C:\\Program Files\\PowerShell\\7\\pwsh.exe') ? 'pwsh.exe' : 'powershell.exe'
  return run(ps, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(dir, 'coord.ps1'), ...args], { env })
}

const now = () => new Date()
const iso = (d = now()) => d.toISOString().replace(/\.\d{3}Z$/, 'Z')
const stamp = (d = now()) => iso(d).slice(0, 16).replace('T', '-').replace(':', '')
const slug = (s) => s.toLowerCase().replace(/[`'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
const firstSentence = (s) => s.replace(/`/g, '').split(/(?<=[.:;])\s/)[0].replace(/[.:;]$/, '').slice(0, 90)
const esc = (s) => s.replace(/\|/g, '\\|')

// ------------------------------------------------------- roadmap parser ----
// Reads NEXT.md: "## Phase N - Title" sections containing a table whose rows
// start "| N.M |", an "**Exit:**" paragraph, and a "### Lanes" table.
function parseRoadmap() {
  if (!existsSync(ROADMAP)) die(`roadmap not found: ${ROADMAP}`)
  const lines = readFileSync(ROADMAP, 'utf8').split(/\r?\n/)
  const phases = []
  const lanes = []
  let phase = null
  let headers = null
  let inLanes = false
  const splitRow = (l) => l.replace(/\\\|/g, '\u0001').split('|').slice(1, -1).map((c) => c.trim().replace(/\u0001/g, '|'))
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    const ph = l.match(/^## Phase (\d+)\s*[-\u2014]\s*(.+)$/)
    if (ph) { phase = { n: Number(ph[1]), title: ph[2].trim(), steps: [], exit: '' }; phases.push(phase); headers = null; inLanes = false; continue }
    if (/^## /.test(l)) { phase = null; headers = null; inLanes = false }
    if (/^### Lanes/.test(l)) { inLanes = true; headers = null; continue }
    if (/^### /.test(l) && inLanes && !/^### Lanes/.test(l)) inLanes = false
    if (l.startsWith('|')) {
      const cells = splitRow(l)
      if (/^-+$/.test(cells[0].replace(/:/g, '-'))) continue
      if (!headers) { headers = cells.map((c) => c.toLowerCase()); continue }
      if (inLanes) {
        const m = cells[0].match(/^(.+?)\s*\(`([^`]+)`\)/)
        if (m) lanes.push({ name: m[1].trim(), handle: m[2], lane: cells[1], paths: cells[2], steps: cells[3] || '' })
        continue
      }
      if (phase && /^\d+\.\d+$/.test(cells[0])) {
        const get = (h) => { const k = headers.findIndex((x) => x.startsWith(h)); return k >= 0 ? cells[k] || '' : '' }
        phase.steps.push({ id: cells[0], phase: phase.n, work: get('work'), why: get('why'), owner: get('owner') || '-' })
      }
      continue
    }
    headers = headers && l.trim() === '' ? null : headers
    const ex = l.match(/^\*\*Exit:\*\*\s*(.*)$/)
    if (ex && phase) {
      let text = ex[1]
      for (let j = i + 1; j < lines.length && lines[j].trim() !== ''; j++) text += ' ' + lines[j].trim()
      phase.exit = text.trim()
    }
  }
  if (!phases.length) die(`no "## Phase N - ..." sections with step tables in ${basename(ROADMAP)} - is the sequenced roadmap merged?`)
  return { phases, lanes, steps: phases.flatMap((p) => p.steps) }
}

function laneFor(handleOrName, lanes) {
  return lanes.find((l) => l.handle === handleOrName || l.name.toLowerCase() === String(handleOrName).toLowerCase())
}
function ownersOf(step, lanes) {
  return lanes.filter((l) => new RegExp(`\\b${l.name}\\b`, 'i').test(step.owner)).map((l) => l.handle)
}
// Label for `coord new`: the lane decides when it is unambiguous; a lane that
// spans several slices (runtime + persistence + chat route) falls back to the
// step text.
function wsFor(step, lane) {
  if (CFG.wsByHandle[lane?.handle]) return CFG.wsByHandle[lane.handle]
  const ln = (lane?.lane || '').toLowerCase()
  if (/docs|process|coordination|quality/.test(ln)) return 'docs'
  if (/platform|shell/.test(ln)) return 'os-shell'
  if (/integration/.test(ln)) return 'integration'
  const t = step.work.toLowerCase()
  if (/\b(vfs|indexeddb|registry|persist)/.test(t)) return 'persistence'
  if (/\/api\/chat|provider|tool results|proxy|api-key|env-var/.test(t)) return 'agent-chat'
  if (/runner|sandbox|esm\.sh|vetting|csp|iframe/.test(t)) return 'runtime-engine'
  if (/test|readme|adr|docs|truth pass/.test(t)) return 'docs'
  return 'runtime-engine'
}

// --------------------------------------------------------- issue state ----
function issueIndex() {
  const list = ghJson('issue', 'list', '--repo', repo(), '--state', 'all', '--limit', '300',
    '--json', 'number,title,state,labels,assignees,url,closedAt') || []
  const byStep = new Map()
  for (const it of list) {
    const m = it.title.match(/^\[(\d+\.\d+)\]/)
    if (!m) continue
    const prev = byStep.get(m[1])
    if (!prev || (prev.state === 'CLOSED' && it.state === 'OPEN')) byStep.set(m[1], it)
  }
  return byStep
}
const labelsOf = (it) => (it?.labels || []).map((l) => l.name)
const statusOf = (it) => labelsOf(it).find((l) => l.startsWith('status:'))?.slice(7) || (it ? (it.state === 'CLOSED' ? 'done' : 'open') : 'missing')

function stepStates(road, idx) {
  const done = new Set()
  for (const s of road.steps) if (idx.get(s.id)?.state === 'CLOSED') done.add(s.id)
  const started = new Set(road.steps.filter((s) => idx.has(s.id)).map((s) => s.phase))
  const phaseDone = (n) => road.phases.find((p) => p.n === n)?.steps.every((s) => done.has(s.id)) ?? true
  const eligible = (s) => {
    if (done.has(s.id)) return false
    const earliest = CFG.parallel[s.id]
    const gateOk = earliest !== undefined
      ? [...started].some((p) => p >= earliest) || [...Array(s.phase).keys()].every(phaseDone)
      : [...Array(s.phase).keys()].every(phaseDone)
    if (!gateOk) return false
    if (CFG.sequentialPhases.includes(s.phase)) {
      const ph = road.phases.find((p) => p.n === s.phase)
      const before = ph.steps.slice(0, ph.steps.findIndex((x) => x.id === s.id))
      if (!before.every((x) => done.has(x.id))) return false
    }
    return true
  }
  return { done, eligible, phaseDone }
}

function describe(s, it) {
  const who = it?.assignees?.map((a) => '@' + a.login).join(',') || '-'
  return `${s.id}  ${statusOf(it).padEnd(11)} ${who.padEnd(14)} ${firstSentence(s.work)}  [${s.owner}]`
}

// ------------------------------------------------------------- vault ----
const V = (...p) => join(VAULT, ...p)
function fm(fields) {
  const body = Object.entries(fields).map(([k, v]) => `${k}: ${typeof v === 'string' && /[:#]/.test(v) && !v.startsWith('{') ? JSON.stringify(v) : v}`).join('\n')
  return `---\n${body}\n---\n`
}
function writeNote(rel, text) {
  const p = V(rel)
  if (DRY) { console.log(`  [dry-run] write ${p}`); console.log(text.split('\n').slice(0, 12).join('\n') + '\n  ...'); return p }
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, text, 'utf8')
  return p
}
function replaceBlock(file, name, inner) {
  if (!existsSync(file)) return false
  const s = readFileSync(file, 'utf8')
  const re = new RegExp(`(<!-- loop:${name} -->)[\\s\\S]*?(<!-- /loop:${name} -->)`)
  if (!re.test(s)) return false
  if (!DRY) writeFileSync(file, s.replace(re, `$1\n${inner.trim()}\n$2`), 'utf8')
  return true
}
function homeFile() {
  for (const n of ['Home.md', 'DOMinic Home.md']) if (existsSync(V(n))) return V(n)
  return V('Home.md')
}
const homeLink = () => `[[${basename(homeFile(), '.md')}]]`
function progressTable(road, idx, st) {
  const rows = road.phases.map((p) => {
    const d = p.steps.filter((s) => st.done.has(s.id)).length
    const next = p.steps.filter((s) => st.eligible(s)).map((s) => s.id).join(', ') || (d === p.steps.length ? 'complete' : 'gated')
    return `| ${p.n} | ${esc(p.title)} | ${d}/${p.steps.length} | ${next} |`
  })
  return ['| Phase | Title | Done | Eligible now |', '| --- | --- | --- | --- |', ...rows].join('\n')
}
function recentNotes(dir, limit = 8) {
  const d = V(dir)
  if (!existsSync(d)) return []
  return readdirSync(d).filter((f) => f.endsWith('.md')).sort().reverse().slice(0, limit)
}
function refreshHome(road, idx, st) {
  const home = homeFile()
  if (!existsSync(home)) return
  const ms = recentNotes('Milestones', 10).map((f) => `- [[Milestones/${f.replace(/\.md$/, '')}|${f.replace(/\.md$/, '')}]]`).join('\n') || '- (none yet)'
  const ss = recentNotes('Sessions', 6).map((f) => `- [[Sessions/${f.replace(/\.md$/, '')}|${f.replace(/\.md$/, '')}]]`).join('\n') || '- (none yet)'
  replaceBlock(home, 'progress', `${progressTable(road, idx, st)}\n\n_Updated ${iso()} by \`${AGENT || 'loop'}\`._`)
  replaceBlock(home, 'milestones', ms)
  replaceBlock(home, 'sessions', ss)
}

// ---------------------------------------------------------- commands ----
function cmdHelp() {
  console.log(`loop.mjs - roadmap work loop (NEXT.md + /coordinate + vault)

usage: node .claude/skills/work-loop/scripts/loop.mjs <command> [options]
       npm run loop -- <command> [options]

commands
  status [--write]                 roadmap progress by phase; --write refreshes vault/Roadmap Progress.md + Home
  next [--mine|--any]              eligible steps, yours first (needs COORD_AGENT + gh login)
  start [--step ID] [--any] [--no-git] [--dry-run]
                                   resume brief -> pick next eligible step -> create issue if missing ->
                                   claim -> branch -> print the work brief
  checkpoint [-m "text"] [--step ID] [--handoff @user] [--no-post] [--dry-run]
                                   write a Session note to the vault (run BEFORE context compaction /
                                   end of session); posts STATUS (or HANDOFF) on the issue
  resume [--all]                   the post-compaction digest: latest session note, recent milestones,
                                   board, next step
  milestone ID --pr URL [-m "text"] [--dry-run]
                                   PR merged -> coord done -> Milestone note -> progress refresh
  vault-init                       scaffold the vault schema if missing (idempotent)
  vault-sync                       regenerate the vault's generated notes from repo docs (ingest.py)

env   COORD_AGENT=<harness>/<model>   who you are (required for start/checkpoint/milestone)
      COORD_SHELL=bash|pwsh           which /coordinate helper to drive (auto)
      COORD_HUB, COORD_REPO, COORD_STALE_MIN  passed through to /coordinate
opts  --roadmap <file>  --vault <dir>  override loop.config.json`)
}

function cmdStatus() {
  const road = parseRoadmap()
  const idx = issueIndex()
  const st = stepStates(road, idx)
  console.log(progressTable(road, idx, st))
  console.log('')
  for (const p of road.phases) {
    console.log(`Phase ${p.n} - ${p.title}`)
    for (const s of p.steps) console.log('  ' + describe(s, idx.get(s.id)) + (st.eligible(s) ? '  <- eligible' : ''))
  }
  const total = road.steps.length
  const done = st.done.size
  console.log(`\n${done}/${total} steps done${done === total ? '  ROADMAP COMPLETE' : ''}`)
  if (OPT.write) {
    const text = fm({ type: 'dashboard', title: 'Roadmap Progress', description: 'Generated by loop.mjs status --write from NEXT.md and the issue board.', tags: '[dominic, roadmap, progress]', refreshed: iso() })
      + `\n# Roadmap Progress\n\nGenerated ${iso()} from \`${basename(ROADMAP)}\` and the GitHub issue board. Back to ${homeLink()}.\n\n${progressTable(road, idx, st)}\n\n## Steps\n\n`
      + road.phases.map((p) => `### Phase ${p.n} - ${p.title}\n\n| Step | Status | Owner of record | Work |\n| --- | --- | --- | --- |\n`
        + p.steps.map((s) => { const it = idx.get(s.id); return `| ${s.id} | ${statusOf(it)}${it ? ` ([#${it.number}](${it.url}))` : ''} | ${esc(s.owner)} | ${esc(firstSentence(s.work))} |` }).join('\n')).join('\n\n')
      + '\n'
    writeNote('Roadmap Progress.md', text)
    refreshHome(road, idx, st)
    note('wrote Roadmap Progress.md and refreshed Home')
  }
}

function pickCandidates(road, idx, st, mineOnly, any) {
  const my = AGENT ? me() : null
  const el = road.steps.filter((s) => st.eligible(s))
  const unclaimed = el.filter((s) => { const it = idx.get(s.id); return !it || (it.state === 'OPEN' && !(it.assignees || []).length) })
  const mine = unclaimed.filter((s) => my && ownersOf(s, road.lanes).includes(my))
  const inProgressMine = el.filter((s) => { const it = idx.get(s.id); return it && (it.assignees || []).some((a) => a.login === my) })
  if (mineOnly) return { mine, others: [], inProgressMine }
  const others = any ? unclaimed.filter((s) => !mine.includes(s)) : unclaimed.filter((s) => !mine.includes(s) && (s.owner === '-' || !ownersOf(s, road.lanes).length))
  return { mine, others, inProgressMine, unclaimedOtherLanes: unclaimed.filter((s) => !mine.includes(s) && !others.includes(s)) }
}

function cmdNext() {
  const road = parseRoadmap()
  const idx = issueIndex()
  const st = stepStates(road, idx)
  const c = pickCandidates(road, idx, st, !!OPT.mine, !!OPT.any)
  if (c.inProgressMine.length) { console.log('You already hold:'); for (const s of c.inProgressMine) console.log('  ' + describe(s, idx.get(s.id))) }
  console.log(c.mine.length ? 'Eligible in your lane:' : 'Nothing eligible in your lane.')
  for (const s of c.mine) console.log('  ' + describe(s, idx.get(s.id)))
  if (c.others?.length) { console.log('Unowned / open to anyone:'); for (const s of c.others) console.log('  ' + describe(s, idx.get(s.id))) }
  if (c.unclaimedOtherLanes?.length) { console.log("Other lanes' steps (ask or propose before taking):"); for (const s of c.unclaimedOtherLanes) console.log('  ' + describe(s, idx.get(s.id))) }
  if (st.done.size === road.steps.length) console.log('\nROADMAP COMPLETE')
}

function reviewQueue() {
  const prs = ghJson('pr', 'list', '--repo', repo(), '--state', 'open', '--limit', '30', '--json', 'number,title,author,reviewDecision,url,isDraft') || []
  return prs.filter((p) => !p.isDraft && p.author.login !== me() && p.reviewDecision !== 'APPROVED')
}

function cmdStart() {
  if (!AGENT) die('set COORD_AGENT=<harness>/<model> first (e.g. codex/gpt-5, claude-code/claude-fable-5.1)')
  console.log('== resume ==')
  cmdResume(true)
  const road = parseRoadmap()
  const idx = issueIndex()
  const st = stepStates(road, idx)
  const c = pickCandidates(road, idx, st, false, !!OPT.any)
  let step = OPT.step ? road.steps.find((s) => s.id === OPT.step) : null
  if (OPT.step && !step) die(`no step ${OPT.step} in the roadmap`)
  if (!step && c.inProgressMine.length) {
    step = c.inProgressMine[0]
    console.log(`\nContinuing your in-progress step ${step.id}.`)
  }
  if (!step) step = c.mine[0] || c.others[0] || (OPT.any ? c.unclaimedOtherLanes?.[0] : null)
  if (!step) {
    if (st.done.size === road.steps.length) { console.log('\nROADMAP COMPLETE - nothing left to claim.'); return }
    console.log('\nNo step is eligible for you right now (gated by another lane or phase).')
    const q = reviewQueue()
    if (q.length) { console.log('Useful meanwhile - PRs awaiting a non-author review:'); for (const p of q) console.log(`  #${p.number} ${p.title}  (${p.author.login})  ${p.url}`) }
    else console.log('No PRs need review either. Check `coord.sh board`, or wait for the gating step.')
    return
  }
  const owners = ownersOf(step, road.lanes)
  const lane = laneFor(owners.includes(me()) ? me() : owners[0] || '', road.lanes)
  const phase = road.phases.find((p) => p.n === step.phase)
  let it = idx.get(step.id)
  const branch = `${CFG.branchPrefix}${step.id}-${slug(firstSentence(step.work))}`
  if (!it) {
    const title = CFG.issueTitlePrefix.replace('{id}', step.id) + firstSentence(step.work)
    // Lane paths are globs; drop prose entries such as "board hygiene".
    const files = (lane?.paths || '').replace(/`/g, '').replace(/\s*\([^)]*\)/g, '').split(/,\s*/).map((x) => x.trim()).filter((x) => /[/.*]/.test(x)).join(';') || '_(none listed)_'
    // `--done` splits on ";": the step's own text is one criterion, so soften its semicolons.
    const done = [step.work.replace(/\.$/, '').replace(/;/g, ','), ...phase.exit.split(/;\s*/).map((x) => x.replace(/\.$/, ''))].filter(Boolean).join(';')
    const body = `Roadmap step **${step.id}** (Phase ${step.phase} - ${phase.title}) from \`${basename(ROADMAP)}\`.\n\n**Work:** ${step.work}\n\n**Why here:** ${step.why || '-'}\n\n**Owner of record:** ${step.owner}\n\n**Phase exit:** ${phase.exit}\n\nCreated by \`loop.mjs start\` for ${AGENT}.`
    const p = step.phase === Math.min(...road.phases.filter((p) => !st.phaseDone(p.n)).map((p) => p.n)) ? '0' : '1'
    const out = coord('new', title, '--ws', wsFor(step, lane), '--p', p, '--type', 'task', '--files', files, '--done', done, '--body', body)
    const m = out.match(/^#(\d+)\s+(\S+)/m)
    if (!DRY && !m) die(`could not parse issue number from coord new output:\n${out}`)
    it = DRY ? { number: 0, url: '(dry-run)', state: 'OPEN', assignees: [] } : { number: Number(m[1]), url: m[2], state: 'OPEN', assignees: [] }
    console.log(`\nCreated issue #${it.number} for ${step.id}`)
  }
  if (!(it.assignees || []).some((a) => a.login === me())) {
    coord('claim', String(it.number), '--plan', `branch: ${branch}; ${firstSentence(step.work)}`, '--eta', `${CFG.stepHours}h`)
    console.log(`Claimed #${it.number}`)
  }
  if (!OPT['no-git'] && !DRY) {
    const cur = git('branch', '--show-current')
    if (cur !== branch) {
      const exists = run(bin('git'), ['rev-parse', '--verify', '--quiet', branch], { allowFail: true })
      git('fetch', '--prune', '-q')
      if (exists) git('checkout', '-q', branch)
      else git('checkout', '-q', '-b', branch, 'origin/main')
      console.log(`On branch ${branch}`)
    }
  }
  console.log(`
== work brief: step ${step.id} (Phase ${step.phase} - ${phase.title}) ==
Issue    #${it.number}  ${it.url}
Branch   ${branch}
Lane     ${lane ? `${lane.name} (@${lane.handle}) - ${lane.lane}` : step.owner}
Files    ${lane?.paths || '(declare in the issue)'}

Work
  ${step.work}
Why here
  ${step.why || '-'}
Done when (phase exit)
  ${phase.exit}

While you work
  - keep the diff inside the issue's ## Files; touching another lane needs its owner as reviewer
  - post progress:  loop checkpoint -m "what changed; what is next"   (at milestones, and BEFORE context compaction)
  - open the PR with "Closes #${it.number}" in the body; one step per PR
When the PR is merged
  - loop milestone ${step.id} --pr <url>   then   loop start
If you must stop
  - loop checkpoint --handoff @<login> -m "exact stopping point"`)
}

function currentStepId(road) {
  if (OPT.step) return OPT.step
  const b = run(bin('git'), ['branch', '--show-current'], { allowFail: true })
  const m = b.match(new RegExp(`^${CFG.branchPrefix.replace('/', '\\/')}(\\d+\\.\\d+)-`))
  if (m) return m[1]
  const idx = issueIndex()
  const my = me()
  for (const s of road.steps) { const it = idx.get(s.id); if (it?.state === 'OPEN' && (it.assignees || []).some((a) => a.login === my)) return s.id }
  return null
}

function cmdCheckpoint() {
  if (!AGENT) die('set COORD_AGENT first')
  const road = parseRoadmap()
  const id = currentStepId(road)
  const step = road.steps.find((s) => s.id === id)
  const idx = issueIndex()
  const it = id ? idx.get(id) : null
  const branch = run(bin('git'), ['branch', '--show-current'], { allowFail: true })
  const last = run(bin('git'), ['log', '-1', '--format=%h %s'], { allowFail: true })
  const dirty = run(bin('git'), ['status', '--short'], { allowFail: true }).split('\n').filter(Boolean).length
  const pr = branch ? run(bin('gh'), ['pr', 'view', branch, '--repo', repo(), '--json', 'url,state,reviewDecision'], { allowFail: true }) : ''
  const prInfo = pr ? JSON.parse(pr) : null
  const msg = OPT.message || '(no summary given)'
  const t = now()
  const file = `Sessions/${stamp(t)}-${slug(AGENT)}.md`
  const text = fm({ type: 'session', title: `Session ${stamp(t)} ${AGENT}`, description: `Checkpoint of ${AGENT}${id ? ` on step ${id}` : ''} - written before context compaction or session end.`, tags: '[session, checkpoint, work-loop]', generated: `{ by: ${AGENT}, at: ${iso(t)} }`, step: id || '-', issue: it ? `#${it.number}` : '-', branch: branch || '-', pr: prInfo?.url || '-' })
    + `\n# Session ${stamp(t)} - ${AGENT}\n\n`
    + `## Doing\n\n${step ? `Step **${id}** (Phase ${step.phase}): ${firstSentence(step.work)}` : 'No roadmap step on this branch.'}${it ? `\nIssue [#${it.number}](${it.url}) - ${statusOf(it)}` : ''}\n\n`
    + `## State\n\n- Branch: \`${branch || '-'}\`${last ? `\n- Last commit: \`${last}\`` : ''}\n- Uncommitted changes: ${dirty} file(s)${prInfo ? `\n- PR: ${prInfo.url} (${prInfo.state}${prInfo.reviewDecision ? `, ${prInfo.reviewDecision}` : ''})` : ''}\n\n`
    + `## Summary\n\n${msg}\n\n`
    + `## Next action\n\n${OPT.next || (OPT.handoff ? `Handed off to ${OPT.handoff}.` : 'Continue the step from the state above.')}\n\n`
    + `## Resume\n\n\`\`\`bash\nexport COORD_AGENT=${AGENT}\ngit checkout ${branch || 'main'}\nnode .claude/skills/work-loop/scripts/loop.mjs resume\n\`\`\`\n`
  const p = writeNote(file, text)
  const st = stepStates(road, idx)
  refreshHome(road, idx, st)
  if (it && !OPT['no-post']) {
    if (OPT.handoff) coord('handoff', String(it.number), '--to', OPT.handoff, `checkpoint ${basename(file, '.md')}: ${msg}`)
    else coord('status', String(it.number), `checkpoint ${basename(file, '.md')}: ${msg}`)
  }
  console.log(`Checkpoint written: ${p}\nAfter compaction, first action:  node .claude/skills/work-loop/scripts/loop.mjs resume`)
}

function cmdResume(brief = false) {
  const sessions = recentNotes('Sessions', 20)
  const mine = AGENT ? sessions.filter((f) => f.endsWith(`-${slug(AGENT)}.md`)) : []
  const pick = OPT.all ? sessions.slice(0, 3) : (mine.length ? [mine[0]] : sessions.slice(0, 1))
  if (!pick.length) console.log('No session notes in the vault yet.')
  for (const f of pick) {
    const s = readFileSync(V('Sessions', f), 'utf8').replace(/^---[\s\S]*?---\n/, '')
    console.log(`--- ${f} ---\n${brief ? s.split('\n').slice(0, 24).join('\n') : s}`)
  }
  const ms = recentNotes('Milestones', 5)
  if (ms.length) console.log('\nRecent milestones:\n' + ms.map((f) => '  ' + f.replace(/\.md$/, '')).join('\n'))
  if (!brief) {
    try { console.log('\n== board ==\n' + coord('board')) } catch (e) { note(`board unavailable: ${e.message.split('\n')[0]}`) }
    console.log('\n== next ==')
    cmdNext()
  }
}

function cmdMilestone() {
  if (!AGENT) die('set COORD_AGENT first')
  const id = POS[0]
  if (!id || !OPT.pr) die('usage: milestone <step-id> --pr <url> [-m "text"]')
  const road = parseRoadmap()
  const step = road.steps.find((s) => s.id === id)
  if (!step) die(`no step ${id} in the roadmap`)
  const pr = ghJson('pr', 'view', OPT.pr, '--repo', repo(), '--json', 'number,title,body,state,mergedAt,author,url,files,closingIssuesReferences')
  if (pr.state !== 'MERGED' && !DRY) die(`PR #${pr.number} is ${pr.state}, not MERGED - milestones are merged PRs only`)
  const idx = issueIndex()
  const it = idx.get(id)
  if (it && it.state === 'OPEN') coord('done', String(it.number), '--pr', pr.url, OPT.message || `step ${id} shipped in PR #${pr.number}`)
  const phase = road.phases.find((p) => p.n === step.phase)
  const t = pr.mergedAt ? new Date(pr.mergedAt) : now()
  const title = `${id} - ${firstSentence(step.work)}`
  const files = (pr.files || []).map((f) => `- \`${f.path}\` (+${f.additions}/-${f.deletions})`).join('\n') || '- (none)'
  const text = fm({ type: 'milestone', title: `Milestone ${title}`, description: `Roadmap step ${id} completed: ${firstSentence(step.work)}.`, tags: '[milestone, roadmap, work-loop]', generated: `{ by: ${AGENT}, at: ${iso()} }`, step: id, phase: step.phase, pr: pr.url, merged_at: iso(t), author: pr.author?.login || '-', issue: it ? `#${it.number}` : '-' })
    + `\n# Milestone ${title}\n\n`
    + `**Phase ${step.phase} - ${phase.title}.** Shipped in [PR #${pr.number}](${pr.url}) by @${pr.author?.login || '?'}, merged ${iso(t)}.${it ? ` Issue [#${it.number}](${it.url}).` : ''}\n\n`
    + `## What shipped\n\n${(pr.body || '').trim().split('\n').slice(0, 30).join('\n') || pr.title}\n\n`
    + `## Roadmap context\n\n- **Work:** ${step.work}\n- **Why here:** ${step.why || '-'}\n- **Serves phase exit:** ${phase.exit}\n\n`
    + `## Files\n\n${files}\n\n${OPT.message ? `## Note\n\n${OPT.message}\n\n` : ''}Back to ${homeLink()} · [[Roadmap Progress]].\n`
  const p = writeNote(`Milestones/${title.replace(/[\\/:*?"<>|]/g, '')}.md`, text)
  const st = stepStates(road, issueIndex())
  refreshHome(road, issueIndex(), st)
  console.log(`Milestone written: ${p}`)
  const remaining = road.steps.length - st.done.size
  console.log(remaining ? `${remaining} steps remain - run: loop start` : 'ROADMAP COMPLETE')
}

function cmdVaultInit() {
  const dirs = ['Milestones', 'Sessions', 'ADRs', 'Conventions', 'Coordination', 'Hackathon', 'Specs & Plans', 'Repo Config', '_templates', '.obsidian']
  for (const d of dirs) if (!existsSync(V(d))) { if (!DRY) mkdirSync(V(d), { recursive: true }); console.log(`  mkdir ${d}`) }
  const seed = (rel, text) => { if (existsSync(V(rel))) return; writeNote(rel, text); console.log(`  seed  ${rel}`) }
  if (!existsSync(homeFile())) seed('Home.md', fm({ type: 'index', title: 'Home', description: 'Entry point of the project second brain: roadmap progress, milestones, sessions, and the ingested repo docs.', tags: '[moc, work-loop]' })
    + `\n# Home\n\n## Roadmap progress\n\n<!-- loop:progress -->\n_(run \`loop status --write\`)_\n<!-- /loop:progress -->\n\n## Latest milestones\n\n<!-- loop:milestones -->\n- (none yet)\n<!-- /loop:milestones -->\n\n## Active sessions\n\n<!-- loop:sessions -->\n- (none yet)\n<!-- /loop:sessions -->\n\n## Map\n\n- [[Roadmap Progress]] - generated from the roadmap and the issue board\n- \`ADRs/\` \`Conventions/\` \`Coordination/\` \`Hackathon/\` \`Specs & Plans/\` - generated from the repo docs by \`loop vault-sync\`\n- \`Milestones/\` - one note per completed roadmap step\n- \`Sessions/\` - one note per checkpoint (written before context compaction)\n- \`Repo Config/\` - raw copies of the config files\n`)
  seed('_templates/milestone.md', `---\ntype: milestone\ntitle: Milestone {{step}} - {{title}}\nstep: {{step}}\nphase: {{phase}}\npr: {{pr}}\n---\n\n# Milestone {{step}} - {{title}}\n\n## What shipped\n\n## Roadmap context\n\n## Files\n`)
  seed('_templates/session.md', `---\ntype: session\ntitle: Session {{stamp}} {{agent}}\nstep: {{step}}\nbranch: {{branch}}\n---\n\n# Session {{stamp}} - {{agent}}\n\n## Doing\n\n## State\n\n## Summary\n\n## Next action\n\n## Resume\n`)
  seed('.obsidian/app.json', '{\n  "readableLineLength": false,\n  "showFrontmatter": true\n}\n')
  seed('README.md', `# Vault\n\nThe project's second brain, kept in the repo so every agent on every machine shares it. Open this folder in Obsidian.\n\nSchema: OKF-style frontmatter on every note (\`type\`, \`title\`, \`description\`, \`tags\`, \`generated\`, plus \`repo_head\`/\`ingested\` on generated notes). Generated notes (ADRs, conventions, coordination, hackathon docs, specs and plans) are rebuilt by \`loop vault-sync\` and must not be hand-edited; synthesis notes (Home, Architecture Overview, Repo Map, Open Questions & Gaps) are hand-written; \`Milestones/\` and \`Sessions/\` are written by \`loop milestone\` and \`loop checkpoint\`.\n\nSee \`.claude/skills/work-loop/SKILL.md\`.\n`)
  console.log(`vault ready at ${VAULT}`)
}

function cmdVaultSync() {
  const py = WIN ? 'python' : 'python3'
  const script = join(HERE, 'ingest.py')
  if (!existsSync(script)) die('ingest.py missing from the skill')
  const r = spawnSync(py, [script, '--repo', ROOT, '--vault', VAULT], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
  if (r.error || r.status !== 0) die(`ingest.py failed (needs Python 3): ${(r.stderr || r.error?.message || '').trim()}`)
  console.log(r.stdout.trim())
}

// ---------------------------------------------------------- dispatch ----
const commands = { help: cmdHelp, status: cmdStatus, next: cmdNext, start: cmdStart, checkpoint: cmdCheckpoint, resume: () => cmdResume(false), milestone: cmdMilestone, 'vault-init': cmdVaultInit, 'vault-sync': cmdVaultSync }
if (!commands[cmd]) { cmdHelp(); die(`unknown command: ${cmd}`) }
try { commands[cmd]() } catch (e) { die(e.message) }
