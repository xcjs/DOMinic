# Vault

The project's second brain, kept in the repo so every agent on every machine shares it. Open this folder in Obsidian.

Schema: OKF-style frontmatter on every note (`type`, `title`, `description`, `tags`, `generated`, plus `repo_head`/`ingested` on generated notes). Generated notes (ADRs, conventions, coordination, hackathon docs, specs and plans) are rebuilt by `loop vault-sync` and must not be hand-edited; synthesis notes (Home, Architecture Overview, Repo Map, Open Questions & Gaps) are hand-written; `Milestones/` and `Sessions/` are written by `loop milestone` and `loop checkpoint`.

See `.claude/skills/work-loop/SKILL.md`.
