<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/imagile-mark-dark.png">
    <img src="assets/imagile-mark.png" width="96" height="96" alt="Imagile">
  </picture>
</p>

<h1 align="center">Imagile Claude plugins</h1>

<p align="center">
  Skills we use every day to build software with Claude Code. Open source: use them, fork them, tell us what breaks.
  <br>
  <a href="https://imagile.dev">imagile.dev</a> ·
  <a href="https://github.com/imagile-dev/toil">toil</a> ·
  <a href="#license">MIT</a>
</p>

---

## Install

```text
/plugin marketplace add imagile-dev/claude-plugins
/plugin install imagile@imagile
```

`sunny` is Sunny Kolattukudy's personal plugin. It is public so you can read it or borrow its shape, but it writes as Sunny.

```text
/plugin install sunny@imagile
```

## imagile

How Imagile designs, plans, reviews and ships, plus the tools we reach for on web work.

A repo's `CLAUDE.md` (with an `AGENTS.md` symlink) holds a few core principles. Agents work inside them without asking about each decision. A choice the principles do not settle goes in `AGENT_DECISIONS.md` with what it optimizes for and what it gives up, and the maintainer reviews the log in batches. Quality comes from deterministic gates, narrow reviewer agents that back findings with real runs, and proof in every PR.

**Principal track: decide what is true**

| Skill | What it does |
|-------|--------------|
| `/imagile:principles` | Writes, sharpens and audits a principle-first `CLAUDE.md`, and turns corrections into principles |
| `/imagile:revisit` | Reviews the agents' logged decisions in one batch: keep, promote to a principle, or reverse |
| `/imagile:architecture` | Opinionated design and review for .NET, Blazor, TypeScript, Astro and Azure: radically obvious and simple until users force a compromise, named trade-offs, modular monolith first, Imagile resource naming, cost as a gate |

**Development track: ship inside the principles**

| Skill | What it does |
|-------|--------------|
| `/imagile:plan` | Sizes work, slices it vertically with owned files and edge cases, and files a short GitHub issue with a "Done when" line |
| `/imagile:ship` | Rebases onto the target, runs the reviewer agents in parallel, fixes every finding, opens the PR with proof, and watches it to merge |
| `/imagile:code-review` | Approve or Request Changes, with Major, Minor and Nit findings from the reviewer agents |
| `/imagile:commit` | Conventional Commit with a gitmoji at the end (release-please safe), with a check for stray files |
| `/imagile:bootstrap` | Installs the system in a repo: principles, labels, PR template, review bot, capped fix agent, auto-merge on approval |

**Reviewer agents:** `gate-reviewer`, `code-reviewer`, `edge-case-reviewer`, `docs-reviewer`, `principle-reviewer`.

**Web tools**

| Skill | What it does |
|-------|--------------|
| `/imagile:design` | Brief, build, critique and polish for UI, decks and image sets: surface modes, color strategy, motion rules, a dated list of generated-design tells, and a screenshot critique scored out of 40 |
| `/imagile:accessibility` | WCAG 2.2 AA audit with axe-core at mobile and desktop widths, light and dark, and every theme |
| `/imagile:image-generation` | Images from a prompt through the ChatGPT website, falling back to the OpenAI Images API |
| `/imagile:web-optimize` | AVIF and WebP with responsive `srcset`, only when it is worth it |
| `/imagile:background-removal` | Offline background removal with rembg |

**Design** keeps each project's decisions in a `DESIGN.md` at the repo root, so the next session follows them instead of asking again. A correction from you becomes a standing rule there. It builds on Anthropic's `frontend-design`, Impeccable, Emil Kowalski's skills and taste-skill; each reference file credits its sources.

**Image generation** drives chatgpt.com first, through the Claude desktop app's built-in browser or [Claude in Chrome](https://code.claude.com/docs/en/chrome), so images come from the ChatGPT plan. It falls back to the API with `OPENAI_API_KEY` when no signed-in browser is available, for masked edits, for large scripted batches, or when ChatGPT refuses or hits its daily cap. Transparent backgrounds and exact sizes stay on the website, with `background-removal` and a local crop as the fix. Each run is kept under `.claude/image-generation/<yymmdd-slug>/` with its prompt, and a shared `style.md` holds the palette.

**Accessibility** runs axe-core in real Chromium through Playwright (Node 22.12 or later). Its dependencies install into a temp folder, never your project. Reports land in `.claude/accessibility/<timestamp>/`.

## sunny

| Skill | What it does |
|-------|--------------|
| `/sunny:chat` | Sunny's default register and context |
| `/sunny:write` | Slack, email, proposals, blog and LinkedIn posts in Sunny's voice |
| `/sunny:taste` | Sunny's visual taste and standing design corrections, on top of `/imagile:design` |
| `/sunny:identity` | Bios, speaker profiles and personal essays |
| `/sunny:eng-philosophy` | Team, process and leadership questions through the Phoenix Project, Agile values and staffeng.com, or a talk on them |
| `/sunny:hiring` | Candidate pre-screens and hiring debriefs |
| `/sunny:mentoring` | 1:1 prep and growth conversations |

The voice lives in [`plugins/sunny/voice/STYLE-GUIDE.md`](plugins/sunny/voice/STYLE-GUIDE.md). Swap in your own writing samples to make the writing skills sound like you.

## Contributing

Every skill follows the open [Agent Skills spec](https://agentskills.io/specification), so it also works outside Claude Code. CI holds every pull request to it:

| Check | What it enforces |
|-------|------------------|
| `yamllint --strict` | Well-formed YAML everywhere |
| [`skills-ref validate`](https://github.com/agentskills/agentskills/tree/main/skills-ref) | The Agent Skills spec: name, description, allowed keys |
| `claude plugin validate --strict` | Claude Code's marketplace and plugin manifests |
| `scripts/check-skills.mjs` | House rules: two-line frontmatter, descriptions of 200 characters or less, links that resolve, a version bump for every changed plugin |

Run them locally before you push:

```bash
node scripts/check-skills.mjs --base origin/main
```

Changes go through a pull request to `main` and a squash merge. See [`CLAUDE.md`](CLAUDE.md) for the authoring rules.

## License

[MIT](LICENSE)
