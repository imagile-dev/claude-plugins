---
name: imagile:principles
description: Write, sharpen and audit a repository's CLAUDE.md / AGENTS.md as a short list of principles that agents reason from, so they can work without asking about each decision. Use when someone says "set up CLAUDE.md", "write our principles", "agents keep asking me", "turn this correction into a rule", "why does it keep doing X", "our CLAUDE.md is too long", or corrects an agent in a way that reveals a pattern. Also use when a principle reviewer or the revisit skill says a principle is missing or wrong.
---

# Principles

The principal track. A repo's CLAUDE.md sets a few core principles. Agents work
autonomously inside them, and the human revisits what they decided later (the
`imagile:revisit` skill). The better the principles, the fewer questions.

## Mode 1: write

For a repo with no CLAUDE.md, or one that is a list of rules with no principles.

1. Read what exists: CLAUDE.md, AGENTS.md, `.github/copilot-instructions.md`,
   README, CI workflows, the project layout.
2. Ask the user at most five questions, only about what the code can't answer:
   who uses it, what must never break, what can't an agent do alone, the merge
   policy.
3. Start from `references/claude-md-template.md`. Keep Imagile principles 1 to 9
   unless the user rejects one. Add repo-specific principles from step 2.
4. Fill in the Gate from the commands CI actually runs. Run each one locally to
   prove it works.
5. Move every task-specific rule into a repo skill (`.claude/skills/<name>/`), and
   leave a one-line index entry.
6. Create the `AGENTS.md` symlink (`ln -s CLAUDE.md AGENTS.md`) and an empty
   `AGENT_DECISIONS.md` (format in `imagile:revisit`).

## Mode 2: absorb a correction

When the user corrects an agent, or the revisit skill promotes a decision:

1. Name the principle under the correction. If none exists, write one. If one
   exists but didn't stop the mistake, sharpen its wording.
2. Find every rule and skill that follows from it, and update all of them.
3. If a check could catch this class of mistake, add the check (principle 2),
   or file an `agent-followup` issue for it.
4. Show the diff to the CLAUDE.md in chat, one line on why.

## Mode 3: audit

Report, then fix with the user's OK:

- More than about 12 principles, or a CLAUDE.md that runs past roughly 400 lines.
  Move detail into skills.
- Rules with no principle above them.
- Principles that contradict each other or the repo's actual behavior, such as a
  merge policy CLAUDE.md states but CI doesn't enforce.
- More than 8 skills, or skills that overlap.
- `AGENT_DECISIONS.md` with more than about 30 open entries. Run `imagile:revisit`.

## Principles for writing principles

- One sentence of rule, one of reason. The reason is what lets an agent apply it
  to a case no one listed.
- Positive and concrete: "Errors say what to do next", not "avoid bad errors".
- A principle with an exception names the exception and who granted it, with the
  date: "(the maintainer's call, 2026-10-19)".
