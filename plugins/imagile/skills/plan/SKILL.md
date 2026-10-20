---
name: plan
description: Scope engineering work as a GitHub issue and a vertical-slice plan. Use for "plan X", "scope Y", "break this down", or "write an issue or user story".
---

# Plan

Turn a description of work into one well-sized issue and, for large work, a phased plan.

## Steps

1. **Read the code first.** Find the files, patterns and tests the work touches. The plan reflects this codebase, not a generic one.
2. **Size it.** One engineer in two weeks or less is a **Story**. Anything bigger is an **Epic**. State the size and the reason in one sentence.
3. **Slice it vertically.** Each slice delivers one capability end to end (data, API, UI, tests) and can ship as one PR. Prefer few large slices over many small ones. Never slice by layer.
   - Each slice **owns** its files. Two slices that own the same file cannot run in parallel. Order them, or remove the shared file (features register by existing).
   - A slice that takes outside input lists its **edge cases**, so they are tests from the first commit.
   - Group slices that can run in parallel, and say the order.
4. **Show the draft in the chat**, not only in a file or a summary box. Ask whether it is right.
5. On approval, **create the issue** before any branch (`gh issue create`). If the repo uses Jira, write the same content as a Jira story instead.
6. For an Epic, also write the plan file and create one sub-issue per slice.

Take the recommended option when a choice is minor, and record it (see **Decisions**). Ask only when the choice is the user's to make.

## Issue format

Short. A reader understands what and why in ten seconds.

```markdown
[One paragraph: what changes and why.]

**Done when:** [one line of observable behavior: "A user can sign in with Google on mobile and desktop."]
**Owns:** `path/to/feature/`
**Edge cases:** [hostile inputs it must survive, or "none"]
```

Labels: the area, plus `deferred` for anything the user calls "later".

## Plan file (Epics only)

Save as `plans/<issue#>-<kebab-title>.md`.

```markdown
# [Title] (#<issue>)

## Goal
[One sentence.]

## Approach
- [Shape of the solution, not implementation detail]

## Slices
### 1. [Capability] (#<sub-issue>)
- Builds: [what]
- Files: [main files or areas]
- Verify: [how a user or API caller sees it work]

### 2. ...

## Out of scope
- [Each item becomes a follow-up issue]
```

## Rules

- **Verification is observable behavior.** "A user can log in with Google", not "the callback returns 200".
- **Every slice is verified before its PR opens:** build, tests, format, and a browser check at mobile and desktop widths for UI.
- **Follow-ups become issues**, never TODO comments or a list at the end of a PR.
- **Decisions:** when you choose a default the user may want to overturn, add it to the repo's `AGENT_DECISIONS.md` in the format of the `revisit` skill (what, what it optimizes for, what it gives up, where). Create the file if the repo has none.
- **Ideas that are not ready** become one-paragraph issues labelled `deferred`. Do not plan them in detail.
- **Build parallel slices in parallel:** one agent per slice, each on its own branch, each finishing with the `ship` skill. Slices that keep conflicting point to a missing seam. Log it and fix the seam before the next wave.
- **Cost:** if a slice adds cloud resources, state the monthly cost in the issue.

## User story (on request)

```
As a [role], I want to [action] so that [outcome].

Acceptance criteria
- [Behavior a tester can check by using the feature]
- [Edge case and what the user sees]
```
