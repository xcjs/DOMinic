# Record architecture decisions

| ADR&nbsp;Number | Status | Date | Deciders |
| --- | --- | --- | --- |
| 0000 | accepted | 2026-09-12 | Zack |

## Technical Story

The DOMinic project needs a lightweight, durable way to record significant architecture and tooling decisions so that future contributors understand not just *what* was decided, but *why*.

## Context and Problem Statement

Projects accumulate decisions that are cheap to revisit but expensive to re-litigate without context: which libraries to use, which patterns to follow, which conventions to adopt. Tribal knowledge and chat history do not survive team changes. We need a practice for capturing decisions in a format that lives with the code.

## Decision Drivers

- Decisions must be recorded in version-controllable plain text.
- The format must be quick to write and quick to read.
- The format must be understandable without special tooling.
- The practice must be easy for new contributors to adopt.

## Considered Options

- Michael Nygard's classic ADR format
- MADR (Markdown Any Decision Records) 4.0
- No formal ADR practice

## Decision Outcome

Chosen option: **MADR 4.0**, because it keeps Nygard's strengths (plain markdown, short documents) while adding structure that improves quality: explicit decision drivers, considered options with pros/cons, and a decision outcome with consequences. It is widely adopted and works well in code review and pull requests.

Decisions are recorded in this directory (`docs/adrs/`), numbered sequentially starting at 0001 for real decisions (0000 is this meta-ADR), with kebab-case file names.

### Confirmation

Practice confirmed for the start of the project; revisit if the format proves too heavyweight for small decisions.

## Pros and Cons of the Options

### Michael Nygard's classic ADR format

- ✅ Minimal, extremely well known.
- ❌ No explicit place for considered options or their trade-offs.

### MADR (Markdown Any Decision Records) 4.0

- ✅ Lightweight and markdown-native.
- ✅ Forces explicit consideration of alternatives.
- ❌ Slightly more boilerplate than Nygard.

### No formal ADR practice

- ✅ Zero overhead.
- ❌ Decision context is lost over time.

## Links

- [MADR project](https://adr.github.io/madr/)
- [Nygard's original ADR format](http://adamdrake.com/content/2015/07/03/architecture-decision-records-adrs/)
