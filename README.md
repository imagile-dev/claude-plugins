# kolatts/claude-marketplace

Personal Claude Code plugin marketplace — a curated collection of plugins for developer workflow and communication.

## Installation

```bash
/plugin marketplace add kolatts/claude-marketplace
```

## Plugins

### sunny

Sunny's personal toolkit: writing in Sunny's voice, conversation, and the people side of engineering leadership. Engineering workflow lives in `imagile`.

```bash
/plugin install sunny@kolatts-marketplace
```

#### Skills

| Skill | Command | Description |
|-------|---------|-------------|
| Smart Commit | `/sunny:commit` | Analyze changes and generate a conventional commit message |
| Writing | `/sunny:write` | Draft anything: Slack messages, emails, proposals, blog posts, LinkedIn articles |
| Chat | `/sunny:chat` | Talk it through in Sunny's voice, routing to a specialist skill when one fits |
| Identity | `/sunny:identity` | Write personal bios, speaker profiles, and LinkedIn About sections |
| Mentoring | `/sunny:mentoring` | Prep 1:1s and growth conversations |
| Hiring | `/sunny:hiring` | Pre-screen candidates and structure hiring debriefs |
| Eng Philosophy | `/sunny:eng-philosophy` | Apply engineering philosophy frameworks to team and culture questions |

### tools

General-purpose utility skills — standalone tools for image processing, file manipulation, and other everyday tasks.

```bash
/plugin install tools@kolatts-marketplace
```

#### Skills

| Skill | Command | Description |
|-------|---------|-------------|
| Background Removal | `/tools:background-removal` | Remove image backgrounds locally with Python + rembg — single file or folder, fully offline |

### imagile

The Imagile engineering system. A repo's `CLAUDE.md` (with an `AGENTS.md` symlink) sets a few core principles. Agents work inside them without asking about each decision, log the calls the principles don't settle in `AGENT_DECISIONS.md`, and the maintainer revisits that log in batches. Quality comes from deterministic gates, narrow reviewer agents that run in parallel and back findings with real runs, and proof in every PR.

```bash
/plugin install imagile@kolatts-marketplace
```

#### Principal track: decide what's true

| Skill | Command | Description |
|-------|---------|-------------|
| Principles | `/imagile:principles` | Write, sharpen and audit a repo's principle-first `CLAUDE.md`; turn corrections into principles |
| Revisit | `/imagile:revisit` | Review the agents' open decisions in one batch: keep, promote to a principle, or reverse |
| Architecture | `/imagile:architecture` | Design and review systems against Imagile's principles, with .NET/Blazor, Node/TypeScript and Azure naming references |

#### Development track: ship inside the principles

| Skill | Command | Description |
|-------|---------|-------------|
| Slice | `/imagile:slice` | Turn ideas into vertical-slice GitHub issues that own their files, so agents build them in parallel without conflicts |
| Ship | `/imagile:ship` | Parallel reviewer agents, fix every finding in one round, open the PR with proof, watch it to merge |
| Bootstrap | `/imagile:bootstrap` | Install the system in a repo: principles, labels, PR template, review bot, capped fix agent, auto-merge on approval |

#### Reviewer agents

| Agent | Checks |
|-------|--------|
| `gate-reviewer` | Runs the repo's Gate and checks for stray files |
| `code-reviewer` | Correctness, security, performance at scale, needless complexity, missing tests, rule breaks |
| `edge-case-reviewer` | Runs hostile inputs against code that parses, does IO, handles time, or takes user input |
| `docs-reviewer` | Stale and missing docs, PR description drift, leaked hostnames |
| `principle-reviewer` | Sorts each principle the change touches into breaks (fix), gaps (log) and stops (ask) |

#### Utilities

| Skill | Command | Description |
|-------|---------|-------------|
| Image Generation | `/imagile:image-generation` | Generate or edit images from a prompt — through the ChatGPT UI when Claude in Chrome is connected, otherwise the OpenAI Images API (`gpt-image-2`) |
| Web Optimize | `/imagile:web-optimize` | Convert images to AVIF/WebP with responsive `srcset` widths and a `<picture>` snippet |
| Accessibility | `/imagile:accessibility` | Audit pages for WCAG 2.2 A/AA with Deque's axe-core across mobile and desktop widths, light and dark, and named themes; guide fixes and re-verify |

Image generation takes the browser route first: with [Claude in Chrome](https://code.claude.com/docs/en/chrome) connected (`claude --chrome`), it drives chatgpt.com in a logged-in tab, so images come out of the ChatGPT plan rather than being billed per image. It falls back to the API — transparent backgrounds, exact pixel sizes, masked edits and batches always go that way. Set `OPENAI_API_KEY` (or `IMAGILE_OPENAI_API_KEY`) and the skill picks it up automatically; otherwise it asks for a key at use time.

Image work is kept in the repo under `.claude/image-generation/` regardless of route — one dated folder per run holding `prompt.md` and its output, plus a shared `style.md` whose palette and design rules are folded into every prompt:

```
.claude/image-generation/
├── style.md
└── 260724-rocket-icon/
    ├── prompt.md
    └── rocket-icon.png
```

Either route returns PNG — a good master, a bad thing to serve. Web Optimize derives AVIF/WebP from it when the image is actually going onto a page, and judges whether that's worth doing rather than converting everything by reflex.

Accessibility runs axe-core 4.14.0 in real Chromium through Playwright (`node scripts/axe_audit.mjs`, Node 22.12+). Its pinned dependencies install into a temp folder on first use, never into your project. It audits every URL at mobile and desktop widths, in light and dark, and across the themes you list, each marked `strict` (fails the run with `--fail-on`) or `report` (findings shown, never failing). Reports land in `.claude/accessibility/<timestamp>/` as `report.md` and `axe-results.json`, and an allowlist with a reason per entry keeps known exceptions from blocking CI. The skill follows up with a manual checklist for what axe can't see: keyboard, focus, reflow, motion and a screen reader smoke.

## Customization

The `sunny` plugin ships with a voice style guide at `plugins/sunny/voice/STYLE-GUIDE.md`. Editing that file with your own writing samples makes the writing skills sound more like you over time.

## License

MIT
