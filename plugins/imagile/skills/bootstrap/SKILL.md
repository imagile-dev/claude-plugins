---
name: imagile:bootstrap
description: Install the Imagile engineering system into a repository, or bring an existing repo up to it. Sets up the principles CLAUDE.md with an AGENTS.md symlink, AGENT_DECISIONS.md, the PR template, labels, and the Claude review and PR-feedback workflows where an approving bot review arms auto-merge. Use when someone says "set up this repo", "bootstrap", "add the review bot", "make this repo agent-ready", "bring this repo in line with toil", or starts a new Imagile repo.
---

# Bootstrap

Gives a repo the full loop: principles, autonomous agents, parallel local review,
a review bot in CI, a capped fix agent and auto-merge on approval. Every step is
idempotent. Skip what's already there and report what you changed.

## 1. Principles

Run `imagile:principles` (mode 1 for a new CLAUDE.md, mode 3 to audit an existing
one). The result:

- `CLAUDE.md` with Principles, Autonomy, Gate, Delivery and a Skills index
- `AGENTS.md` → symlink to `CLAUDE.md`
- `AGENT_DECISIONS.md` with an empty `## Open` section
- `.github/copilot-instructions.md`, if it exists, cut down to a pointer at
  `AGENTS.md` so the two never drift

## 2. PR template

`.github/pull_request_template.md`, with the sections `imagile:ship` writes:
What, Proof, Decisions logged, Not verified.

## 3. Labels

```bash
gh label create needs-human    --color d93f0b --force --description "Agents stopped; a person takes over"
gh label create no-auto-fix    --color b60205 --force --description "Agents stay off this PR"
gh label create auto-merge     --color 0e8a16 --force --description "Merge when the review bot approves"
gh label create no-auto-merge  --color fbca04 --force --description "A person merges this PR"
gh label create agent-followup --color c5def5 --force --description "Follow-up an agent filed"
gh label create deferred       --color ededed --force --description "Later; not planned in detail"
```

## 4. Workflows

The reference copies live in `kolatts/imagile-framework` under
`.github/workflows/`. Copy them rather than rewriting, so fixes flow one way:

- `claude-review.yml`: formal APPROVE or REQUEST_CHANGES against CLAUDE.md and
  the repo skills, dismissing earlier bot reviews. On approval it arms
  auto-merge for `claude/*` bot PRs and for PRs labelled `auto-merge`.
- `claude-pr-feedback.yml`: fixes review findings on the PR, counts
  `<!-- claude-pr-feedback-round -->` markers, stops at three with `needs-human`,
  and skips PRs labelled `no-auto-fix`.

Then adapt them:

1. Set the review prompt's build and test commands to the repo's Gate.
2. Keep every action pinned to a full commit SHA. Don't move a pin to a release
   younger than 14 days.
3. Use the model the reference uses unless the user names another.

Required settings (the user sets these; never print or guess a value):

- secret `CLAUDE_CODE_OAUTH_TOKEN`
- variable `IMAGILE_BOT_APP_ID` and secret `IMAGILE_BOT_PRIVATE_KEY` for the
  Imagile Bot GitHub App, which must be installed on the repo
- repository setting "Allow auto-merge" on
- a branch ruleset on `main` that requires the CI check and one approving review

## 5. Prove it

Open a small PR with `imagile:ship` (the bootstrap itself is a good one). It's
done when the review bot posts a formal review on the head commit and, for an
approval, auto-merge arms. Report any step that couldn't be verified.
