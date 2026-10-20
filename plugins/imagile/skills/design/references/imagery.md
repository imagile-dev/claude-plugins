# Imagery

A page that explains with images beats a page that explains with paragraphs. Generate or source real imagery instead of shipping a text-only page or placeholder blocks.

## Set the art direction first

Before the first image, write `.claude/image-generation/style.md` (the `image-generation` skill has a template). It holds:

- **A named medium.** "Die-cut sticker illustration with comic inking", "patent drawing line art", "watercolor storybook". A named medium keeps a set consistent far better than adjectives.
- **The palette** as named colors with hex and RGB, and "use only these colors".
- **Composition rules.** Where the subject sits, how much negative space, which side stays clear for a headline.
- **An avoid list.** What this brand never shows.

The palette in `style.md` matches the design tokens. Images and UI come from one world.

## One hand

- All art on a site looks drawn by the same hand. Review generated images as a set, side by side, not one at a time.
- Recurring characters get a character sheet: the exact description, colors and proportions, reused verbatim in every prompt. Attach the reference image when editing.
- When one image drifts off-model, regenerate it. Do not ship the outlier.
- Never reuse an old or stock version of a character next to new art.

## Fit the page

- Character and decorative art ships as a transparent cutout. Ask for a transparent background in the image prompt, and cut it out with the `background-removal` skill when the result comes back opaque. Never a dark rectangle on a page that is not dark.
- Fade edges where art meets the page, so it feels part of the layout.
- Reserve negative space where text will sit. Text over an image needs a scrim or a baked gradient on that side.
- No text, letters or logos baked into generated images. Set real text in the layout.

## Photos

- Subjects people judge by eye, such as food, travel, places, products and people, need real photos, verified and licensed. Never colored placeholder blocks.
- Credit the source where the license asks for it.
- Avoid stock clichés: handshakes, laptops on desks, smiling teams, glowing brains and orbs, lens flare, glossy 3D.

## Icons and marks

- Use one icon family at one stroke weight. Never emoji or unicode glyphs as icons.
- Brand logos come from an icon set such as Simple Icons, never redrawn.
- A logo, icon or flat geometric mark for the web should be SVG. Image models do not produce clean vectors.
- Reproduce an existing logo as it is. Never redraw or "improve" it.

## Ship it

- Keep the PNG master in the run folder. Ship AVIF or WebP with responsive `srcset` through the `web-optimize` skill.
- Give every image explicit dimensions so it does not shift the layout.
- Lazy-load images below the fold, and never the largest image in the first screen.

Sources: Imagile's own practice across shipped sites and image runs (style.md shape, one hand, character sheets, cutouts, set review), Impeccable (real photos for subjects judged by eye), Anthropic `frontend-design` and taste-skill (stock and placeholder tells).
