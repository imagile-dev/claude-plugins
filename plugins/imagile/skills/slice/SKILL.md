---
name: imagile:slice
description: Turn an idea, feature request or list of ideas into GitHub issues sized as vertical slices that agents can build in parallel without conflicting, and plan the build order. Replaces story/epic planning. Use when someone says "plan X", "scope this", "break this down", "write up issues", "create tickets", "what should we build next", or hands over a list of ideas to file.
---

# Slice

Plan in issues, not documents. A slice is one PR that delivers a feature end to
end. Size it large enough that process overhead doesn't dominate, and small enough
that one agent finishes it in one sitting.

## Steps

1. **Research the code first.** Find the feature area, the existing patterns, and
   the files a change would touch. Plans written without reading the code are
   fiction.
2. **Cut slices.** Each slice:
   - goes end to end through the layers (data → API → UI → tests → docs), never
     one layer at a time
   - lists the files and folders it **owns**. Two slices that own the same file
     can't run in parallel. Order them, or redesign so the shared file isn't
     needed (principle: adding a feature never edits a shared list).
   - names its edge cases when it handles input, so they're tests from day one
   - has one "Done when" line a machine can check
3. **Show the slices in chat**, one line each, with the parallel groups and the
   order. Recommend; don't ask about every choice. Make any sizing or scope call
   the principles don't settle yourself, and say it in one line.
4. **File the issues** once the user says go, or right away if they asked for
   issues. Use the template below, label by product area (for example `ui`,
   `cli`, `api`) and add `deferred` for anything the user called "later".
5. **Ideas that aren't ready** become one-paragraph issues labelled `deferred`.
   Don't plan them in detail.

## Issue template

```markdown
[What and why, in one short paragraph.]

**Owns:** `path/to/feature/`, `path/to/test/`
**Edge cases:** [hostile inputs this must survive, or "none: no outside input"]
**Done when:** [one checkable line]
**Parallel with:** #n, #m   **After:** #k
```

## Running slices in parallel

Start one agent per slice in a parallel group, each on its own branch or
worktree, each finishing with `imagile:ship`. `imagile:ship` rebases each
remaining branch onto `main` before its next round. When two in-flight PRs keep conflicting, that's a
missing registration-by-convention seam: log it with `imagile:revisit` and fix
the seam before the next wave.
