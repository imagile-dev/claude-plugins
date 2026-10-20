# My brands

Each brand has its own art direction. They share habits, not a template. When you work inside one of these repos, its own `CLAUDE.md`, `DESIGN.md` and CSS tokens are the source of truth. This file is a snapshot for orientation, taken 2026-10.

## imagile.dev

**Direction:** "Workbench, refined." A drafting table: warm paper, a serif display, one terracotta accent, a faint drafting grid. I picked it over two other directions from side-by-side mockups, then warmed it up from a sharper first pass.

| Role | Light | Dark |
|------|-------|------|
| bg | `#faf8f4` | `#16130f` |
| surface | `#fffefb` | `#201c17` |
| ink | `#1c1915` | `#ece7df` |
| muted | `#6b6459` | `#a89e91` |
| accent | `#c25d33` | `#e08356` |
| focus | `#1b6fe0` | `#6fb2ff` |

- **Type:** Source Serif 4 for display, IBM Plex Sans for body, Fira Code for labels, prices and stats only, Archivo for buttons because mono reads cold on an action.
- **Motion:** `cubic-bezier(0.16, 1, 0.3, 1)` at 160 and 320ms. A drafting grid that drifts one cell every two minutes, a "survey ping" particle layer, all off under reduced motion.
- **Theme:** system preference plus a header toggle.
- **Imagery:** patent and drafting line art, terracotta on under a tenth of the frame. Never purple gradients, glowing orbs, glass, stock photos, emoji or mascots.
- **Logo:** a circuit-trace brain with a serif "i". Reproduce it as it is. Never redraw it.
- **Copy:** plain-spoken, confident, dry, anti-marketing. Often names what Imagile is not.

Note: warm cream, a serif display and a terracotta accent is now one of the most common generated looks. It is right for imagile.dev because it was chosen and pinned. Do not reach for it on a new project by default.

## toil

The imagile.dev system pushed hotter and dark-only, for a developer tool.

- bg `#16130f`, deep `#0e0c09`, surface `#1f1a15`, raised `#2a231c`, ink `#f6f1e9`, muted `#b4a998`.
- Accent: flame `rgb(255, 106, 61)` shading into amber `rgb(255, 184, 77)`.
- Same four type families as imagile.dev. A rounded, playful wordmark.
- Generated art keeps most pixels near the background color so UI can sit on top of it.

## context-overflow.dev

**Direction:** a deadpan corporate parody of an AI training course. Comic, loud and funny.

- `--ink #1e1e20` page, `--panel #242428`, `--panel-2 #2c2c31`, `--cream #f2ead9` text, `--cream-dim #b9b2a4`, `--gold #d9b84f` accent used like a rubber stamp, `--straw #ece0a8` highlights, `--line #3a3a40`. Dark only.
- **Type:** Fraunces Variable at 900 for display with a hard drop shadow, Space Grotesk for body and form chrome. No third face, ever.
- **Components:** sticker buttons with a gold fill, cream outline and hard shadow. Rubber stamps tilted a few degrees (decorative only). Comic speech bubbles, halftone starbursts, halftone grain over the page.
- **Motion:** looping animated exhibits with a time indicator, fixed heights, reduced motion respected.
- **Art:** die-cut sticker robots with a cream outline, comic inking, halftone, CRT faces. Transparent cutouts. Every image passes a squint test for one hand.
- **Copy:** deadpan corporate snark, such as a progress screen noting that your progress was retained and your parking spot was not.

## kolatts.github.io

My personal site and talk decks.

- **Site:** dark only. `--night #071316`, `--night-2 #0f2426`, `--paper #f6f2e9`, `--paper-strong #fffaf0`, accents `--teal #2ed3b7`, `--ember #ff6b35`, `--gold #f5c95a`. Outfit Variable at 700 to 950 for everything, mono for code.
- Full-bleed portrait hero under dark gradients, translucent cards with a colored top border, pill tags and chips, a gold-to-ember gradient primary button, gold uppercase kickers, brand icons from Simple Icons tinted teal, light parallax.
- **Decks** (`talks/<slug>/`): built with `pptxgenjs`. Background `#0e1014`, cards `#1a1d24`, text `#f3f1ec`, accents red `#c8282e`, gold `#e8b04b` and cyan `#5ce1e6`. A heavy sans for headlines and a plain sans for body. Full-bleed cinematic AI backgrounds with a baked fade on the headline side, a gold kicker, outlined pills, big stat numbers, framed screenshots, and a story arc.
