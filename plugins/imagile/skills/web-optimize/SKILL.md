---
name: imagile:web-optimize
description: Convert images into web-ready AVIF/WebP derivatives with responsive srcset widths and a legacy fallback, and decide whether that conversion is even worth doing. Use when someone says optimize images for web, compress images, convert to webp, convert to avif, make images smaller, responsive images, srcset, picture element, images are slowing down the page, reduce page weight, LCP, or asks about image formats for a website. Also use after generating an image that is headed for a site or app.
---

<!--
allowed-tools: Bash, Read, Glob, Grep, AskUserQuestion
-->

Produce AVIF/WebP derivatives at responsive widths, with a legacy fallback and a ready `<picture>` block. Originals are never modified or deleted.

## First: decide whether this is worth doing

Web optimization is not free — it multiplies files, adds a build/deploy step, and complicates the asset story. Run it when the image is actually going to be served over HTTP to real users. Assess from context before asking:

**Do it when** the repo looks like a web project (`package.json`, `index.html`, `wwwroot/`, `public/`, `static/`, Next/Astro/Vite/Blazor), *or* the image is destined for a page — hero, banner, background, og:image, product shot, avatar — *or* the user mentions page weight, load time, LCP, or Lighthouse.

**Skip it when** the image is for print, a slide deck, a PDF, a Figma import, or a doc; when it's a master intended for further editing; when the user just wants to look at it; or when it's already small (under ~50 KB) and the extra files buy nothing.

**Say "use SVG instead" when** the asset is a logo, icon, or flat geometric mark. No raster format competes with vector here at any size, and the script will tell you when it detects flat art.

If it's genuinely unclear *and* the payoff is real (a large image in a repo that might be a web project), ask once with `AskUserQuestion` rather than guessing — but don't interrupt for a 30 KB image or an obvious one-off. Defaulting to "no" and mentioning it's available is better than optimizing things nobody serves.

## Prerequisites

**`uv`** — verify with `uv --version`. Dependencies (`pillow>=11.3`) resolve automatically from the script's inline metadata. AVIF encoding is built into modern Pillow; no `pillow-avif-plugin` needed. If a Pillow build lacks the AVIF encoder the script says so and emits WebP only.

## Usage

```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/web-optimize/scripts/optimize_for_web.py" hero.png --widths 480,960,1440 --snippet
```

Derivatives land in a `web/` folder beside the source (or `-o DIR`). Point it at a folder to batch a whole directory tree.

| Flag | Notes |
|------|-------|
| `--widths` | Comma-separated srcset widths. Widths above the source are dropped — it never upscales |
| `--formats` | Default `avif,webp` |
| `--fallback` | `jpeg` (default), `png`, `none`. Auto-switches to PNG when the image has alpha |
| `--art` | `auto` (default), `photo`, `flat` — see below |
| `--lossless` | Force lossless; mainly for screenshots containing text |
| `--avif-quality` / `--webp-quality` / `--jpeg-quality` | Defaults 70 / 80 / 82 |
| `--snippet` | Print a `<picture>` block |
| `--base-url` / `--sizes` / `--alt` | Feed the snippet |

On Git Bash for Windows, a `--base-url` starting with `/` gets rewritten into a Windows path (`/assets/img` becomes `C:/Program Files/Git/assets/...`). Use PowerShell for that flag, or prefix with `//`, or just edit the emitted snippet.

## Photos vs flat art — they behave in opposite directions

This is the part that's easy to get wrong, so the script detects it (`--art auto`) rather than trusting the caller:

- **Photographic / gradient content** — lossy AVIF and WebP both win big, and a width ladder pays off. This is the case the standard advice is written for.
- **Flat art (icons, logos, few colors)** — the advice inverts. Lossy AVIF can land *several times larger* than the source PNG. The script drops AVIF, switches to lossless WebP, and emits a single width, because downscaling antialiases hard edges into gradients and makes the smaller file *bigger*. It also reminds you that SVG is the real answer.

Detection is deliberately conservative (256 distinct colors), so it fires on genuinely flat sources — rasterized SVG exports, UI screenshots — and **not** on `gpt-image-2` output. A generated "flat vector icon" measured 6,425 distinct colors, because the model antialiases and dithers even when the result looks flat. That's the right call: treating it as a photo took a 759 KB PNG down to a 9 KB AVIF with no visible degradation.

### AVIF does not always win

"AVIF is ~50% smaller than JPEG" is a statement about averages, not about your image. On a real generated photo at the default settings, **WebP beat AVIF at every width** (184 KB vs 201 KB at full width). Since `<picture>` serves the first supported `<source>`, a hardcoded AVIF-first list would have shipped the *larger* file to the more capable browser.

So the script orders `<source>` elements by measured output size rather than by reputation, and says so when AVIF loses. Trust the numbers it prints over any format ranking, including this one.

As a backstop, any format whose full-width output is larger than the source is deleted and reported — shipping the original is strictly better than shipping a bloated derivative. If everything gets dropped, that's the tool telling you this image doesn't need optimizing.

Always read the reported percentages instead of assuming a win. Savings depend heavily on the source: converting the PNG that `gpt-image-2` returns is a dramatic reduction, while re-encoding an already-compressed JPEG is a modest one.

## Wiring it into a page

The emitted `<picture>` puts the smallest measured format first, then the other, then the fallback `<img>`; browsers take the first type they support. It ships `width`/`height` (reserves layout, avoids CLS), `loading="lazy"`, and `decoding="async"`.

Two things to adjust by hand:
- **`sizes`** defaults to `100vw`, which is only right for full-bleed images. For a constrained column, something like `(max-width: 768px) 100vw, 1200px` prevents mobile from pulling a desktop-sized file.
- **The LCP image** — usually the hero — should have `loading="lazy"` **removed** and `fetchpriority="high"` added. Lazy-loading the LCP image makes the metric worse, not better.

## Self-healing

If the script misbehaves (a Pillow API change, an encoder that isn't available, output that doesn't match the reported sizes), fix `scripts/optimize_for_web.py` and this SKILL.md directly rather than only working around it for the current run.
