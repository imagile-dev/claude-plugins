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
/plugin install imagile-dev-tools@imagile
```

`sunny` is Sunny Kolattukudy's personal plugin. It is public so you can read it or borrow its shape, but it writes as Sunny.

```text
/plugin install sunny@imagile
```

## imagile-dev-tools

How Imagile designs, plans, reviews and ships, plus the tools we reach for on web work.

| Skill | What it does |
|-------|--------------|
| `/imagile-dev-tools:architecture` | Opinionated design and review for .NET, Blazor, TypeScript, Astro and Azure: modular monolith first, no repository or mediator, CAF naming, cost as a gate |
| `/imagile-dev-tools:plan` | Sizes work, slices it vertically, and files a short GitHub issue with a "Done when" line |
| `/imagile-dev-tools:code-review` | Approve or Request Changes, with Major, Minor and Nit findings from three parallel reviewers |
| `/imagile-dev-tools:commit` | Conventional Commit for what is staged, with a check for stray files |
| `/imagile-dev-tools:accessibility` | WCAG 2.2 AA audit with axe-core at mobile and desktop widths, light and dark, and every theme |
| `/imagile-dev-tools:image-generation` | Images from a prompt through ChatGPT in Chrome, or the OpenAI Images API |
| `/imagile-dev-tools:web-optimize` | AVIF and WebP with responsive `srcset`, only when it is worth it |
| `/imagile-dev-tools:background-removal` | Offline background removal with rembg |

**Image generation** drives chatgpt.com when [Claude in Chrome](https://code.claude.com/docs/en/chrome) is connected, so images come from the ChatGPT plan. Otherwise it uses the API with `OPENAI_API_KEY`. Transparent backgrounds, exact sizes, masked edits and batches always use the API. Each run is kept under `.claude/image-generation/<yymmdd-slug>/` with its prompt, and a shared `style.md` holds the palette.

**Accessibility** runs axe-core in real Chromium through Playwright (Node 22.12 or later). Its dependencies install into a temp folder, never your project. Reports land in `.claude/accessibility/<timestamp>/`.

## sunny

| Skill | What it does |
|-------|--------------|
| `/sunny:chat` | Sunny's default register and context |
| `/sunny:write` | Slack, email, proposals, blog and LinkedIn posts in Sunny's voice |
| `/sunny:identity` | Bios, speaker profiles and personal essays |
| `/sunny:eng-philosophy` | Team, process and leadership questions, or a talk on them |
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
