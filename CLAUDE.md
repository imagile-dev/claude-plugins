# CLAUDE.md

Imagile's public Claude Code plugin marketplace, `imagile`, with two plugins:

- `plugins/imagile-dev-tools/`: skills anyone can use to design, plan, review and ship software, plus web tools. Written for any developer. Never assume the reader is Sunny.
- `plugins/sunny/`: Sunny Kolattukudy's personal skills (voice, identity, hiring, mentoring). Personal by design.

A new skill goes in `imagile-dev-tools` unless it only makes sense for Sunny. Fold new guidance into an existing skill before you add one.

## Skill format

Skills follow the [Agent Skills spec](https://agentskills.io/specification) so they work outside Claude Code too.

- Frontmatter is exactly two lines, `name` then `description`. No other keys: Claude Code extensions such as `user-invocable` or `allowed-tools` break the spec validator and claude.ai uploads.
- `name` equals the folder name. Claude Code adds the plugin prefix (`imagile-dev-tools:plan`). Never write the prefix.
- `description` is one plain line of 200 characters or less: what it does, then "Use for/when ...". No `: ` or ` #` inside it, no quotes, no dashes.
- The body stays under 500 lines. Put detail in `references/`, scripts in `scripts/`, and link them by relative path.
- Write skill text in plain technical English: active voice, short sentences, one instruction per sentence.
- Examples use placeholders: `Company.App.*`, `example.com`, `abc12345`. Never a real client, employer system, host or tenant.

## Versions

Bump the plugin's version in `plugins/<name>/.claude-plugin/plugin.json` once per PR that changes it. CI fails a PR that changes a plugin without a bump. `hooks/bump-plugin-version.js` bumps the patch on commit; raise minor or major by hand for new skills or moved skills.

## Checks

CI runs these on every PR, and the `CI ok` check is required on `main`:

```bash
uvx yamllint==1.37.1 --strict .
uvx --from "git+https://github.com/agentskills/agentskills@69ef37e9424c0a7ea9dd2293b559e43ec8176379#subdirectory=skills-ref" skills-ref validate plugins/<plugin>/skills/<skill>
claude plugin validate --strict .
claude plugin validate --strict plugins/<plugin>
node scripts/check-skills.mjs --base origin/main
```

Pin every action to a commit SHA and every tool to an exact version at least 14 days old.

## Workflow

- Branch `kolatts/<issue#>-<desc>`, Conventional Commits without emoji, PR to `main`, squash merge. A human merges.
- `main` is protected: no direct push, no force push, no deletion, and `CI ok` must pass.
