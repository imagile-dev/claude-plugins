---
name: commit
description: Write a Conventional Commit for the staged changes and commit them. Use when asked to commit, or to write a commit message.
---

# Commit

1. Read `git status` and `git diff --staged`. If nothing is staged, say so and stop. Never run `git add -A` or `git add .`.
2. **Check the staged list for accidents:** empty files from a shell redirect (`nul`, `{}`), scratch scripts, logs, screenshots, local config, `.env`. Unstage them and say which.
3. Write the message:

   ```
   <type>(<optional scope>): <imperative summary, 72 chars max>
   ```

   - Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `build`.
   - Title only. Add a body only when the reason is not obvious from the diff.
   - No emoji, no jokes.
   - A breaking change uses `feat!:` with a `BREAKING CHANGE:` footer that says why and how to migrate. Skip breaking markers before a project's first release.
   - Keep any trailer the environment requires (for example `Co-Authored-By`).
   - If the repo's `CLAUDE.md` defines another format, use that.
4. Commit with a heredoc so the message survives quoting.

## Rules

- Commit only when the user asked for a commit, or when the repo's workflow (for example a ship skill) says to.
- Never push from this skill. Never amend or force-push a commit that is already pushed.
- If a hook fails, fix the cause and make a new commit. Never skip hooks.
