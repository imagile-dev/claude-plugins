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

### Subtle adjustments to consider

Warm cream, a serif display and a terracotta accent is now one of the most common generated looks, and `#c25d33` sits close to the clay accent that generated pages default to. imagile.dev keeps its direction. These small moves push it from "tasteful default" toward "drafting table only Imagile has", without a rebrand. They are ordered from smallest to largest. Each ships on its own, and none touches the logo.

1. **Drop the yellow cast from the paper.** Move the light background from `#faf8f4` toward a near-neutral drafting vellum around `#f6f6f3`, and the surface to about `#fcfcfa`. Keep the warmth in the ink and the accent, where it reads as intent. Dark mode stays as it is.
2. **Draw the grid in non-photo blue.** Drafters sketch in a light blue that copiers drop. Tint the drafting grid toward that blue (around `#a4cde0` at a few percent opacity) instead of warm gray. It is a detail only a drafting table has, so it passes the competitor test where cream does not.
3. **Move the accent from clay to red pencil.** Shift the hue a few degrees toward the red of a correction pencil, around `#b4452c` in light and `#e26f52` in dark. It still reads warm, and it stops matching the default clay. It also fixes a contrast miss: white button text on today's `#c25d33` is 4.3:1, under AA for normal text, and on `#b4452c` it is 5.5:1. The dark pair measures 5.9:1 against `#16130f`.
4. **Let blueprint blue be the second voice.** The focus blue (`#1b6fe0`, `#6fb2ff`) already exists. Use it for line art and inline links too, so terracotta marks only the action. Link text needs a deeper shade in light mode: `#1b6fe0` is 4.4:1 on the vellum, and `#1763cc` is 5.3:1. Dark mode's `#6fb2ff` is 8.4:1 and needs no change.
5. **Replace eyebrows with patent figure labels.** Swap the uppercase eyebrows and registration-mark bullets for patent-style captions ("Fig. 3, the review loop") and leader-line callouts that point at the thing they describe. The drafting idea does the work the chrome is doing now.
6. **Pull mono back to real data.** Fira Code stays on prices, stats and commands. Remove it from decorative labels, where it reads as a technical costume.
7. **Retest the display face last.** Source Serif 4 and IBM Plex Sans are both on the watch list now. Run the font procedure for the display role only, with "a patent drawing" as the physical object. Mock up two or three candidates (an engineering or highway-gothic grotesk, a slab with typewriter roots, and the current serif) on the real home page, and keep Source Serif 4 if it still wins.

Steps 1 to 4 are token changes in `global.css`. Steps 5 and 6 touch components. Step 7 needs mockups and a decision. The changes belong in the imagile-dotcom repo, with before and after screenshots at 375px and desktop, light and dark.

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
