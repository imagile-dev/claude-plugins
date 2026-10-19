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

Run three subagents on the diff. Each scores every finding 0 to 100 for confidence.

| Agent | Looks for |
|-------|-----------|
| **Correctness and security** | secrets in code, injection, auth gaps, null safety, off-by-one, async misuse, missing `CancellationToken`, edge cases that will happen |
| **Performance and complexity** | queries in loops, unbounded scans, O(n²) on unbounded input, abstractions with one use, code that could be much shorter |
| **Repo rules** | breaks of a rule in `CLAUDE.md`, `AGENTS.md` or a repo skill. Quote the rule. |

Count only problems this diff introduces. Skip what a linter or formatter catches. Drop findings under 70. Merge duplicates.

Keep **principle findings** apart: a finding that the change conflicts with a stated principle of the repo, not a rule. Report them for the maintainer to decide. Do not fix them.

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

If you act on the review, fix every Major, Minor and Nit in the same round, with the simplest fix. Leave principle findings to the maintainer. Reply to each thread with what changed, or why it was deferred.
