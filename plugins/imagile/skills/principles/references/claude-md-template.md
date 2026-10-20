# [Project name]

[One paragraph: what this is, who uses it, the stack.]

`AGENTS.md` is a symlink to this file, so every agent reads the same guidance.

## Principles

The rules in this file are consequences of a few principles. When a rule and a
situation disagree, or nothing here covers the case, reason from the principle.

**When a correction arrives, find the principle under it before changing
anything.** Add or sharpen the principle, then update every rule that follows from
it. A fix with no principle behind it gets made again in the next place it applies.

1. **Radically obvious beats clever.** The simplest code a newcomer understands on
   the first read. No abstraction for one use case.
2. **Deterministic before judgment.** If a check can catch a class of problem (a
   type, a test, a lint rule, an analyzer, an alert), add the check. Reviewers
   cover only what checks can't see.
3. **Proof over claims.** Every PR shows how it was verified: gate output, real
   runs, screenshots at desktop and 375px for anything visual, and what wasn't
   verified.
4. **Vertical slices, one owner per file.** A PR delivers a feature end to end.
   Adding a feature never edits a shared list, so parallel work never conflicts.
5. **Agents decide, humans revisit.** An agent that hits a choice these principles
   don't settle takes the simplest reversible option, records it in
   `AGENT_DECISIONS.md` and keeps going. It asks first only when the choice would
   bend a principle or can't be undone (see Autonomy).
6. **Safe when an agent drives.** Agents never loosen the rules that constrain
   them. They act only on feedback from this repo's people and named bots, stop
   after three pushed review rounds with `needs-human`, and stay off any PR
   labelled `no-auto-fix`.
7. **Honest and observable.** Errors say what failed and what to do. A production
   failure reaches a person within a day through an alert, not by luck.
8. **Never break users silently.** A change to a public contract (API, schema,
   config, CLI flags) is declared in the PR and the changelog.

[Repo-specific principles follow, numbered on from 9.]

## Autonomy

| The choice | What the agent does |
|------------|---------------------|
| A principle or rule here settles it | Follow it. Don't ask. |
| Nothing settles it, and it can be undone | Take the simplest option, log it in `AGENT_DECISIONS.md`, continue. |
| It would bend or change a principle | Build the compliant version, log the tension, continue. |
| It can't be undone: deleting data, spending money, security posture, a public contract after release, merge or permission policy | Stop and ask. |

## Gate

The commands every change passes before a PR opens, in order:

```bash
[format check]   # e.g. dotnet format --verify-no-changes, npm run lint
[build]
[test]
[e2e smoke]
```

## Delivery

- Every non-trivial change starts from an issue. Branch: `[user]/<issue#>-<desc>`.
- Commits: Conventional Commits.
- Ship with `imagile:ship`: four local reviews, fix every finding in the round it
  arrives, open the PR with proof, then watch it to merge.
- The PR description describes the PR as it is now. Rewrite it after each round.
- Merge policy: **[an approving review from the review bot arms auto-merge |
  humans merge]**.
- Follow-up work goes in a new issue labelled `agent-followup`, never in this PR.

## Skills

This file holds only what applies to every task. Task-specific guidance lives in
`.claude/skills/<name>/SKILL.md`. Keep 4 to 8 skills, and fold new guidance into an
existing skill before creating one.

| Skill | Use when |
|-------|----------|
| | |
