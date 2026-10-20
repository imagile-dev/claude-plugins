---
name: code-review
description: Review a diff or PR with a clear Approve or Request Changes and short Major, Minor and Nit findings. Use when asked to review code, a diff, a branch or a PR.
---

# Code review

Give a real opinion, fast. The shortest comment that names the real issue wins.

## 1. Get the change

- A PR number or URL: `gh pr diff <n>` and `gh pr view <n>`.
- Nothing given: `git diff --staged`, then `git diff`, then the branch against its base (`git diff origin/main...HEAD`).
- Nothing at all: ask for the diff or PR.

Read each changed file in full, not only the changed lines.

## 2. Read the rules

Read the repo's `CLAUDE.md` or `AGENTS.md`, and any skills under `.claude/skills/` that cover the changed files. Their rules beat the defaults below. For .NET, TypeScript or Azure code without repo rules, use the `architecture` skill's references.

## 3. Review in parallel

Run the plugin's reviewer agents on the diff in one message. Each scores every finding 0 to 100 for confidence.

| Agent | Looks for |
|-------|-----------|
| `code-reviewer` | secrets, injection, auth gaps, null safety, async misuse, queries in loops, unbounded scans, abstractions with one use, complexity no user behavior forces, missing tests, broken repo rules (quoted) |
| `principle-reviewer` | each repo principle the change breaks (fix), leaves unsettled (log) or cannot undo (ask) |
| `edge-case-reviewer` | only when the diff parses input, does IO, handles time or takes user input: hostile inputs, run for real |

Without the plugin agents, run the same three checks as general subagents.

Count only problems this diff introduces. Skip what a linter or formatter catches. Drop findings under 70. Merge duplicates.

Keep **principle findings** apart. A break of a principle is a normal finding. A gap (no principle settles the choice) or a principle that seems wrong goes to the maintainer through `AGENT_DECISIONS.md`. It does not block the review.

## 4. Check before you claim

If a finding depends on behavior (a test fails, a build breaks), run it. Say what you ran.

## 5. Output

```
**APPROVE** | **REQUEST CHANGES**

[One or two sentences: the headline. If it is clean, say so and mean it.]

**Issues**
- **Major** `path/file.cs:42`: [what and why, one sentence]
- **Minor** ...
- **Nit** ...

**Principles** (for the maintainer)
- [conflict, and the principle it touches]
```

Omit an empty section.

| Severity | Meaning |
|----------|---------|
| **Major** | Security, a bug that will fail in use, a pattern that breaks at scale, complexity that blocks safe change. Blocks approval. A secret in code is always Major, and the secret must be rotated. |
| **Minor** | Fix before merge, but not a fire. |
| **Nit** | Small and easy. Still worth fixing in the same round. |

## Tone

Direct and kind. Ask the question that exposes the tradeoff ("What happens at 10,000 rows?"). For a junior author, add one sentence of why. The code is wrong; the person is fine. If the `sunny` plugin is installed, use its voice guide.

## When you also fix

If you act on the review, fix every Major, Minor and Nit in the same round, with the simplest fix. Log principle gaps in `AGENT_DECISIONS.md` and keep going. Reply to each thread with what changed, or why it was deferred.
