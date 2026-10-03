"""Ingest the repo docs into the vault with wikilinks (the generated half).

    python ingest.py --repo <repo-root> --vault <vault-dir>

Idempotent: re-run after every pull (``loop vault-sync`` does). Overwrites
the generated notes only; hand-authored synthesis notes (Home, Repo Map,
Architecture Overview, Open Questions & Gaps, Markdown Lint & CI) and the
loop-written Milestones/ and Sessions/ folders are never touched.
"""
import argparse
import datetime as _dt
import re
import shutil
import subprocess
from pathlib import Path

_ap = argparse.ArgumentParser()
_ap.add_argument("--repo", required=True)
_ap.add_argument("--vault", required=True)
_a = _ap.parse_args()
REPO = Path(_a.repo).resolve()
VAULT = Path(_a.vault).resolve()
ADRS = REPO / "docs" / "adrs"
TODAY = _dt.date.today().isoformat()

def git(*args):
    return subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, encoding="utf-8").stdout

HEAD = git("rev-parse", "--short", "HEAD").strip()

def read(p): return p.read_text(encoding="utf-8")
def write(p, s):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(s, encoding="utf-8", newline="\n")

def split_fm(text):
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            return text[4:end], text[end + 5:]
    return None, text

def with_fm(text, extra: dict):
    """Ensure a frontmatter block exists and append/replace keys."""
    fm, body = split_fm(text)
    fm = (fm.rstrip("\n") + "\n") if fm else ""
    for k, v in extra.items():
        fm = re.sub(rf"^{re.escape(k)}:.*\n", "", fm, flags=re.M)  # replace if present
        if isinstance(v, list):
            fm += f"{k}: [{', '.join(v)}]\n"
        else:
            fm += f"{k}: {v}\n"
    return f"---\n{fm}---\n{body}"

# ---------- ADR filename -> note title ----------
adr_titles = {}
for p in sorted(ADRS.glob("[0-9][0-9][0-9][0-9]-*.md")):
    fm, body = split_fm(read(p))
    title = None
    if fm:
        m = re.search(r"^title:\s*(.+)$", fm, re.M)
        if m: title = m.group(1).strip()
    if not title:
        title = re.search(r"^# (.+)$", body, re.M).group(1).strip()
    adr_titles[p.name] = f"ADR {p.name[:4]} - {title}"

NOTE_FOR = {**adr_titles, "template.md": "ADR Template", "README.md": "ADR Conventions"}

# Repo-root-relative paths -> note names
ROOT_LINKS = {
    "README.md": "README (repo)",
    "NEXT.md": "Post-Hackathon Roadmap (NEXT)",
    "QUESTIONS.md": "Open Questions Register (QUESTIONS)",
    "docs/adrs/README.md": "ADR Conventions",
    "docs/adrs/": "ADR Conventions",
    "docs/adrs/template.md": "ADR Template",
    "docs/agents/use-okf.md": "OKF Frontmatter Convention",
    "docs/agents/rubric.md": "Judging Rubric & Win Strategy",
    "docs/agents/demo-path.md": "Demo Path",
    "docs/superpowers/specs/": "Spec - ADR Series Design",
    "docs/superpowers/plans/": "Plan - ADR Series",
    "docs/superpowers/specs/2026-09-12-adr-scaffold-design.md": "Spec - ADR Scaffold Design",
    "docs/superpowers/specs/2026-09-12-adr-series-design.md": "Spec - ADR Series Design",
    "docs/superpowers/plans/2026-09-12-adr-scaffold.md": "Plan - ADR Scaffold",
    "docs/superpowers/plans/2026-09-12-adr-series.md": "Plan - ADR Series",
    "docs/superpowers/specs/2026-09-12-custom-openai-compatible-provider-design.md": "Spec - Custom OpenAI Provider",
    "docs/superpowers/plans/2026-09-12-custom-openai-compatible-provider.md": "Plan - Custom OpenAI Provider",
    "docs/agents/coordination.md": "Agent Coordination over GitHub Issues",
    "docs/agents/coordination-best-practices.md": "Coordination Best Practices v1",
    "docs/agents/coordination-best-practices-2.md": "Coordination Best Practices v2",
    "docs/agents/coordination-best-practices-3.md": "Coordination Best Practices v3",
    "docs/research/README.md": "Coordination Research (Q01)",
    "docs/research/": "Coordination Research (Q01)",
    "docs/submission-form.md": "Submission Form Draft",
    "docs/JUDGES.md": "Judges Walkthrough",
    "LICENSE": "LICENSE (AGPL-3.0)",
}
for fname, note in adr_titles.items():
    ROOT_LINKS[f"docs/adrs/{fname}"] = note
# docs/agents/-relative links (rubric.md <-> demo-path.md)
AGENTS_LINKS = {"rubric.md": "Judging Rubric & Win Strategy", "demo-path.md": "Demo Path",
                "use-okf.md": "OKF Frontmatter Convention"}

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")

def rewrite_links(text, local_map):
    def sub(m):
        label, target = m.group(1), m.group(2)
        if target.startswith(("http://", "https://", "#", "mailto:")):
            return m.group(0)
        anchor = ""
        if "#" in target:
            target, anchor = target.split("#", 1)
            anchor = "#" + anchor
        note = local_map.get(target) or ROOT_LINKS.get(target)
        if not note:
            return m.group(0)
        return f"[[{note}{anchor}]]" if label == note else f"[[{note}{anchor}|{label}]]"
    return LINK_RE.sub(sub, text)

# ---------- ADRs ----------
for p in sorted(ADRS.glob("*.md")):
    note = NOTE_FOR[p.name]
    text = rewrite_links(read(p), NOTE_FOR)
    extra = {"source": f"docs/adrs/{p.name}", "ingested": TODAY, "repo_head": HEAD}
    if p.name[:4].isdigit():
        extra["adr"] = f'"{p.name[:4]}"'
    if p.name == "0000-record-architecture-decisions.md":
        extra = {"type": "Architecture Decision Record", "title": "Record architecture decisions",
                 "status": "accepted", "tags": ["architecture", "process"], **extra}
    if p.name == "README.md":
        extra = {"type": "convention", "tags": ["adr", "process"], **extra}
    if p.name == "template.md":
        extra = {"type": "template", "tags": ["adr", "template"], **extra}
    write(VAULT / "ADRs" / f"{note}.md", with_fm(text, extra))

# ---------- Root docs ----------
ROOT_DOCS = {
    "README.md": ("README (repo)", {}, VAULT),
    "NEXT.md": ("Post-Hackathon Roadmap (NEXT)", {"tags": ["roadmap", "future", "dominic"]}, VAULT / "Hackathon"),
    "QUESTIONS.md": ("Open Questions Register (QUESTIONS)", {"tags": ["questions", "team", "planning", "dominic"]}, VAULT / "Hackathon"),
    "docs/JUDGES.md": ("Judges Walkthrough", {"tags": ["judges", "walkthrough", "dominic"]}, VAULT / "Hackathon"),
    "docs/submission-form.md": ("Submission Form Draft", {"tags": ["hackathon", "submission", "form"]}, VAULT / "Hackathon"),
}
for rel, (note, extra, folder) in ROOT_DOCS.items():
    if not (REPO / rel).exists():
        continue
    text = rewrite_links(read(REPO / rel), {})
    write(folder / f"{note}.md", with_fm(text, {**extra, "source": rel, "ingested": TODAY, "repo_head": HEAD}))

# ---------- docs/agents (rubric, demo-path) ----------
for rel, note in [("docs/agents/rubric.md", "Judging Rubric & Win Strategy"),
                  ("docs/agents/demo-path.md", "Demo Path")]:
    text = rewrite_links(read(REPO / rel), AGENTS_LINKS)
    write(VAULT / "Hackathon" / f"{note}.md", with_fm(text, {"source": rel, "ingested": TODAY, "repo_head": HEAD}))

# ---------- docs/agents coordination docs ----------
COORD_LINKS = {
    "coordination.md": "Agent Coordination over GitHub Issues",
    "coordination-best-practices.md": "Coordination Best Practices v1",
    "coordination-best-practices-2.md": "Coordination Best Practices v2",
    "coordination-best-practices-3.md": "Coordination Best Practices v3",
    "rubric.md": "Judging Rubric & Win Strategy", "demo-path.md": "Demo Path",
    "use-okf.md": "OKF Frontmatter Convention",
}
COORD = {
    "docs/agents/coordination.md": ("Agent Coordination over GitHub Issues", ["agents", "coordination", "process"]),
    "docs/agents/coordination-best-practices.md": ("Coordination Best Practices v1", ["coordination", "playbook", "historical"]),
    "docs/agents/coordination-best-practices-2.md": ("Coordination Best Practices v2", ["coordination", "playbook", "historical"]),
    "docs/agents/coordination-best-practices-3.md": ("Coordination Best Practices v3", ["coordination", "playbook", "active"]),
}
for rel, (note, tags) in COORD.items():
    if not (REPO / rel).exists():
        continue
    text = rewrite_links(read(REPO / rel), COORD_LINKS)
    write(VAULT / "Coordination" / f"{note}.md",
          with_fm(text, {"tags": tags, "source": rel, "ingested": TODAY, "repo_head": HEAD}))

# ---------- research Q01 (verbatim external artifacts + index) ----------
research_dir = REPO / "docs" / "research"
if research_dir.exists():
    idx = rewrite_links(read(research_dir / "README.md"), {})
    write(VAULT / "Coordination" / "Coordination Research (Q01).md",
          with_fm(idx, {"tags": ["research", "coordination", "provenance"],
                        "source": "docs/research/README.md", "ingested": TODAY, "repo_head": HEAD}))

# ---------- OKF doc: split guidance from embedded spec ----------
okf = read(REPO / "docs" / "agents" / "use-okf.md")
head, _, rest = okf.partition("````markdown\n")
spec, _, _ = rest.rpartition("````")
guidance = head.rstrip() + "\n\n"
guidance += ("> [!note] Embedded specification\n"
             "> The repo file embeds the full OKF v0.2 spec verbatim inside a fenced block. "
             "In this vault it lives as its own note: [[OKF v0.2 Specification]].\n")
write(VAULT / "Conventions" / "OKF Frontmatter Convention.md", with_fm(guidance, {
    "type": "convention", "title": "Use Google's Open Knowledge Format (OKF)",
    "tags": ["okf", "convention", "agents"],
    "source": "docs/agents/use-okf.md", "ingested": TODAY, "repo_head": HEAD}))

spec_note = with_fm(spec.strip() + "\n", {
    "type": "reference", "title": "Open Knowledge Format (OKF) v0.2 specification",
    "tags": ["okf", "reference", "spec"],
    "source": "docs/agents/use-okf.md (embedded verbatim)",
    "canonical": "https://github.com/GoogleCloudPlatform/open-knowledge-format",
    "ingested": TODAY})
spec_note = spec_note.replace(
    "# Open Knowledge Format (OKF)\n",
    "# Open Knowledge Format (OKF)\n\n> [!info] Provenance\n> Verbatim copy of the OKF v0.2 spec as embedded in the repo's "
    "[[OKF Frontmatter Convention|docs/agents/use-okf.md]]. Canonical home: "
    "https://github.com/GoogleCloudPlatform/open-knowledge-format\n", 1)
write(VAULT / "Conventions" / "OKF v0.2 Specification.md", spec_note)

# ---------- Specs & Plans ----------
SP = {
    "docs/superpowers/specs/2026-09-12-adr-scaffold-design.md": ("Spec - ADR Scaffold Design", "spec"),
    "docs/superpowers/specs/2026-09-12-adr-series-design.md": ("Spec - ADR Series Design", "spec"),
    "docs/superpowers/plans/2026-09-12-adr-scaffold.md": ("Plan - ADR Scaffold", "plan"),
    "docs/superpowers/plans/2026-09-12-adr-series.md": ("Plan - ADR Series", "plan"),
    "docs/superpowers/plans/2026-09-12-hackathon-finish.md": ("Plan - Hackathon Finish", "finish-plan"),
    "docs/superpowers/specs/2026-09-12-custom-openai-compatible-provider-design.md": ("Spec - Custom OpenAI Provider", "spec-live"),
    "docs/superpowers/plans/2026-09-12-custom-openai-compatible-provider.md": ("Plan - Custom OpenAI Provider", "plan-live"),
}
ROOT_LINKS["docs/superpowers/plans/2026-09-12-hackathon-finish.md"] = "Plan - Hackathon Finish"
for rel, (note, kind) in SP.items():
    if not (REPO / rel).exists():
        continue
    text = rewrite_links(read(REPO / rel), {})
    if kind == "finish-plan":
        text = with_fm(text, {"type": "plan", "title": note, "tags": ["plan", "hackathon", "finish"],
                              "source": rel, "date": TODAY, "ingested": TODAY, "repo_head": HEAD})
        text = text.replace("\n# ", "\n> [!abstract] Michael's finish plan (PR #37)\n> The team's own timeline "
                            "working back from the 16:00 portal close; the live status view is on [[DOMinic Home]].\n\n# ", 1)
        write(VAULT / "Specs & Plans" / f"{note}.md", text)
        continue
    if kind in ("spec-live", "plan-live"):
        base = "spec" if kind == "spec-live" else "plan"
        text = with_fm(text, {"type": base, "title": note, "tags": [base, "superpowers", "provider"],
                              "source": rel, "date": TODAY, "ingested": TODAY, "repo_head": HEAD})
        text = text.replace("\n# ", "\n> [!abstract] Shipped feature\n> The custom OpenAI-compatible "
                            "provider this describes shipped in PR #70 (base URL + model, no key at rest). "
                            "See [[ADR 0005 - Agent chat via Vercel AI SDK with server-side provider proxy|ADR 0005]] "
                            "and [[Architecture Overview]].\n\n# ", 1)
        write(VAULT / "Specs & Plans" / f"{note}.md", text)
        continue
    text = with_fm(text, {"type": kind, "title": note, "tags": [kind, "superpowers", "adr"],
                          "source": rel, "date": TODAY, "ingested": TODAY})
    callout = ("\n> [!abstract] Historical execution plan\n"
               "> This is the step-by-step plan an agent followed to write the ADRs. It restates the "
               "*original* file contents verbatim; PR #2 has since added a Hackathon POC (Golden Path) "
               "section to every ADR, so the live ADR notes differ from what is quoted here.\n\n# ")
    if kind == "plan":
        text = text.replace("\n# ", callout, 1)
    else:
        text = text.replace("\n# ", "\n> [!abstract] Design spec\n> Written before PR #2; the ADRs' "
                            "Decision Outcome sections were later restructured into POC / Future / Open "
                            "Questions blocks. The decisions themselves are unchanged.\n\n# ", 1)
    write(VAULT / "Specs & Plans" / f"{note}.md", text)

# ---------- LICENSE note ----------
if (REPO / "LICENSE").exists():
    lic = with_fm("", {"type": "reference", "title": "LICENSE (AGPL-3.0)",
                       "tags": ["licence", "legal"], "source": "LICENSE",
                       "ingested": TODAY, "repo_head": HEAD})
    lic += ("# LICENSE (AGPL-3.0-or-later)\n\n"
            "DOMinic is licensed **GNU Affero General Public License v3.0 or "
            "later** (`chore: license DOMinic under AGPL-3.0-or-later`, PR-era "
            f"`{HEAD}`). `package.json` declares `\"license\": "
            "\"AGPL-3.0-or-later\"`.\n\n"
            "What that means in one line: anyone may use, modify, and "
            "redistribute the code, but a modified version offered to users "
            "**over a network** must also offer them its complete source — the "
            "AGPL's network-use clause, which the plain GPL lacks. Fitting for a "
            "browser OS meant to be hosted.\n\n"
            "The full text is `LICENSE` in the repo root; canonical: "
            "<https://www.gnu.org/licenses/agpl-3.0.txt>. Back to "
            "[[DOMinic Home]] · [[Repo Map]].\n")
    write(VAULT / "LICENSE (AGPL-3.0).md", lic)

# ---------- Repo config copies ----------
cfg = VAULT / "Repo Config"
cfg.mkdir(exist_ok=True)
for src, dst in [("package.json", "package.json"), (".markdownlint.jsonc", ".markdownlint.jsonc"),
                 (".editorconfig", ".editorconfig"), (".gitignore", "gitignore.txt"),
                 (".github/workflows/ci.yml", "ci.yml"), (".husky/pre-commit", "husky-pre-commit.txt"),
                 (".nvmrc", "nvmrc.txt"), (".gitattributes", "gitattributes.txt"),
                 ("nuxt.config.ts", "nuxt.config.ts"), ("tsconfig.json", "tsconfig.json")]:
    if (REPO / src).exists():
        shutil.copyfile(REPO / src, cfg / dst)
raw_log = git("log", "--format=%h|%an|%ad|%s", "--date=iso").strip()
(cfg / "git-log.txt").write_text(raw_log + "\n", encoding="utf-8")

# ---------- Commit timeline ----------
PRS = {"#1": "Judging Rubric & Win Strategy", "#2": "ADR 0010 - Agent app interface and tool protocol",
       "#3": "Demo Path"}
rows = []
for line in raw_log.splitlines():
    h, an, ad, s = line.split("|", 3)
    pr = re.search(r"\(#(\d+)\)$", s)
    link = f" → [[{PRS['#'+pr.group(1)]}]]" if pr and "#"+pr.group(1) in PRS else ""
    rows.append(f"| `{h}` | {ad[11:16]} | {an} | {s}{link} |")
remote = [b.strip() for b in git("branch", "-r").splitlines() if "->" not in b]
tl = with_fm("", {"type": "reference", "title": "Commit Timeline", "tags": ["git", "history"],
                  "source": "git log origin/main", "repo_head": HEAD, "ingested": TODAY})
n_commits = len(rows)
authors = {}
for line in raw_log.splitlines():
    an = line.split("|", 3)[1]
    authors[an] = authors.get(an, 0) + 1
by_author = " · ".join(f"{a} {c}" for a, c in sorted(authors.items(), key=lambda kv: -kv[1]))
tl += "# Commit Timeline\n\n"
tl += (f"All **{n_commits}** commits on `main` as of ingest (HEAD `{HEAD}`, newest first). "
       "Times are ET as recorded by the committer. The final PR was **#76**; the merged-PR "
       "record by author is in [[Submission Form Draft#Team contributions]]. See [[Repo Map]] "
       "for the file inventory and [[DOMinic Home]] for the story.\n\n")
tl += f"Commits by author: {by_author}.\n\n"
tl += "## Commits on `main`\n\n| Commit | Time | Author | Message |\n| --- | --- | --- | --- |\n" + "\n".join(rows) + "\n"
tl += "\n## Remote branches at ingest\n\n" + "\n".join(f"- `{b}`" for b in remote) + "\n"
tl += "\n## Raw log\n\n```\n" + raw_log + "\n```\n"
write(VAULT / "Commit Timeline.md", tl)

# ---------- cleanup of notes from earlier ingests that no longer apply ----------
for stale in [VAULT / "Source Mirror"]:
    if stale.exists(): shutil.rmtree(stale)

print(f"HEAD {HEAD}; ADR notes: {len(adr_titles)}; remote branches: {remote}")
