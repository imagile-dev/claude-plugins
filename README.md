# kolatts/claude-marketplace

Personal Claude Code plugin marketplace — a curated collection of plugins for developer workflow and communication.

## Installation

```bash
/plugin marketplace add kolatts/claude-marketplace
```

## Plugins

### sunny

A personal developer workflow toolkit. Skills that cover commits, code review, project scaffolding, and writing in your voice.

```bash
/plugin install sunny@kolatts-marketplace
```

#### Skills

| Skill | Command | Description |
|-------|---------|-------------|
| Smart Commit | `/sunny:commit` | Analyze changes and generate a conventional commit message |
| Code Review | `/sunny:code-review` | Review code with .NET/Blazor patterns and Sunny's voice |
| Scaffold | `/sunny:scaffold <type>` | Scaffold a new project (react, node-ts, dotnet, python) |
| Writing | `/sunny:write` | Draft anything — Slack messages, emails, proposals, blog posts, LinkedIn articles |
| Identity | `/sunny:identity` | Write personal bios, speaker profiles, and LinkedIn About sections |
| Planning | `/sunny:plan` | Draft Stories and Epics with JIRA-ready structure |
| Mentoring | `/sunny:mentoring` | Prep 1:1s and growth conversations |
| Hiring | `/sunny:hiring` | Pre-screen candidates and structure hiring debriefs |
| Architecture | `/sunny:architecture` | Design and review systems against Sunny's .NET/Azure architecture principles |
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

### imagile-dev-tools

Imagile developer tools — AI image generation via the ChatGPT UI or the OpenAI Images API, web image optimization, axe-core accessibility audits, and other team-specific utilities.

```bash
/plugin install imagile-dev-tools@kolatts-marketplace
```

#### Skills

| Skill | Command | Description |
|-------|---------|-------------|
| Image Generation | `/imagile-dev-tools:image-generation` | Generate or edit images from a prompt — through the ChatGPT UI when Claude in Chrome is connected, otherwise the OpenAI Images API (`gpt-image-2`) |
| Web Optimize | `/imagile-dev-tools:web-optimize` | Convert images to AVIF/WebP with responsive `srcset` widths and a `<picture>` snippet |
| Accessibility | `/imagile-dev-tools:accessibility` | Audit pages for WCAG 2.2 A/AA with Deque's axe-core across mobile and desktop widths, light and dark, and named themes; guide fixes and re-verify |

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
