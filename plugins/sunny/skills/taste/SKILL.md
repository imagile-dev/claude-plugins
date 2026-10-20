---
name: taste
description: Sunny Kolattukudy's visual taste and standing design corrections, layered on the imagile design skill. Use when designing or reviewing UI, decks or AI art for Sunny's own sites, apps, games and talks.
---

# Taste

This is my visual taste, written down so I stop repeating myself. It sits on top of `imagile:design`, which holds the method: the brief, the floor, the critique. This skill sets the defaults and lists the corrections I give most.

Order of authority: the project's `DESIGN.md` and `CLAUDE.md` first, then this skill, then `imagile:design`.

## Step 1: Load the method

Run `imagile:design` for the work. Read this skill before you write the brief, and apply it to every choice the project has not already made.

## Step 2: The corrections I keep giving

These are ranked by how often I have had to say them. Treat each as a hard rule.

1. **Too many words.** Cut copy hard. Lead with the important thing. Never repeat a point. Turn paragraphs into a visual. This is my most frequent correction by far.
2. **Too plain.** Minimal is not a virtue on its own. A page with no flair is a miss. Give it one strong idea, real imagery, color and motion where the surface allows. Restrained is for tools I operate, not for things people visit.
3. **Art that doesn't match.** Every image on a site looks drawn by the same hand. Characters stay on model across every page. Never reuse an old or stock version of something next to new art.
4. **Art in a box.** Character and decorative art is a transparent cutout that blends into the page. Never a dark rectangle.
5. **Broken on mobile.** Check 375px and desktop before you show me anything. I should never have to ask "is it mobile responsive?"
6. **Sloppy alignment.** Centered avatars, balanced grids (2 by 2, not 3 plus 1), banners that don't clip, labels that don't wrap, room to breathe, nothing that jumps when it loads.
7. **Shipped without looking.** Render it, screenshot it, and play it. Reading the code is not a review.
8. **Animation bugs.** Check direction (arrows run the right way), label progress bars and timers, and make sure replays actually replay.
9. **Confusing interaction.** Never tilt anything clickable. Speech bubbles point at the speaker. Filters look like filters.
10. **Jargon on screen.** No internal codes like `SVC-01`, no developer words aimed at non-developers.

When I correct something new, add it to the project's `DESIGN.md` standing rules or `CLAUDE.md` in the same turn.

## Step 3: My defaults

Use these when the project has no direction yet. Each product still gets its own named art direction. These are my habits, not a single house look.

**Ground and color**

- Dark grounds that read warm, never `#000`: around `#16130f`, `#1e1e20` or `#0e1014`.
- Cream or ivory for text and light surfaces, never pure white: around `#f2ead9`, `#faf8f4` or `#fffaf0`.
- One warm accent (gold, ember, terracotta or flame) on a small share of the frame. A cool teal or cyan is allowed as a second voice.
- Gradients are welcome when they add life: a warm two-stop gradient on the primary button or the hero.
- No violet, lavender or purple-to-blue gradients. I find them too AI-forward.
- Blue beats green when a product needs a cool primary.
- Separate touching bright colors with a dark outline. Yellow next to white bleeds.

**Type**

- Two families at most, never a third.
- A display face with personality over a plain body face. Heavy sans at 800 to 950 for personal and punchy work, a serif display for editorial work, a comic or rounded face for playful work.
- Pick faces fresh for every new project with the procedure and watch list in `imagile:design`. Don't reuse the faces my brands already wear (Fraunces, Space Grotesk, Outfit, Source Serif 4, IBM Plex). They are taken, and most of them are on the watch list now.
- Show me two or three type pairings in side-by-side mockups with real content before you commit.
- Keep a plain, readable face for dense text such as quiz questions and lessons.
- Mono is an accent voice for labels, prices and stats only. Never buttons or navigation.
- Short uppercase kickers with letter spacing are part of my look. Each one still carries information.

**Shape, texture and motion**

- Moderate radii (8 to 12px) on cards, pills for tags and chips.
- A faint ambient texture: drafting grid, halftone dots or circuit traces, at a few percent opacity on a fixed layer.
- Motion follows the surface. Tools stay quick and quiet. Sites people visit can be lively: parallax, light particle effects, looping demonstrations with a time indicator and no replay button.
- Always respect reduced motion.

**Theme**

- Follow the system light or dark preference and show a toggle that wins. Dark-only is fine for developer tools.

**Imagery**

- Visually rich, never text-only. Generate art freely with `imagile:image-generation` from a palette-locked `style.md`.
- Cartoony and playful beats photoreal for my own projects: sticker illustration, comic inking, painterly storybook, chunky retro game art with more detail than pixel art.
- No emoji as icons, no stock photos, no glowing orbs or lens flare.
- Nerd-culture framing (retro games, D&D, Marvel, Star Wars, Lord of the Rings) is seasoning for a narrative, never the whole dish, and never copyrighted characters.

## Step 4: Match the audience

| Audience | Direction |
|----------|-----------|
| Developer tools and CLIs | Dark, warm, one hot accent, crisp mono for data. Fast, quiet motion |
| Imagile client and professional work | Calmer and confident. Plain-spoken, dry, anti-marketing. Light and dark both supported |
| Learning sites and games | Loud and comic. Characters, stickers, deadpan corporate humor, lively motion |
| Kids' stories and family projects | Watercolor or bright cel-shaded cartoon, warm and gentle. Characters exactly consistent |
| Consumer apps for a specific community | Follow that audience's taste over mine, even when it means glass or soft color |

## Step 5: Decks

My talks live in `kolatts.github.io/talks/<slug>/`. Follow `imagile:design`'s deck reference, with these defaults:

- One idea per slide, a short headline, big imagery, talking points in speaker notes.
- Dark slides with full-bleed cinematic AI backgrounds. Bake a fade into the side where the headline sits.
- A gold kicker, a repeating pill motif, and one big number when a stat matters.
- Real images fetched from the web alongside generated ones, under one `style.md`.
- A story arc borrowed from nerd culture when it fits the talk.

## Step 6: How I review

- When a choice is open (a font, a logo, a palette), show me two or three mockups side by side. I pick, then you build the winner.
- Before you show me anything, verify it locally at 375px and desktop, in light and dark, and fix what you find.
- For games and interactive pieces, send a subagent to playtest at mobile width first.
- Leave the dev server running and give me the URL so I can try it.
- Put the screenshots in the PR.

## Reference

My live brands and their tokens are in [references/brands.md](references/brands.md). Read it when working on one of those sites, or when you want a concrete example of the defaults above.

For copy on any of these surfaces, use `../../voice/STYLE-GUIDE.md`.
