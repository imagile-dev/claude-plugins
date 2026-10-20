# Color

Pick a color strategy before you pick a single swatch. Most generated pages default to one accent at ten percent on a neutral ground, whatever the subject.

## Strategy

| Strategy | What it means | Fits |
|----------|---------------|------|
| **Restrained** | Tinted neutrals and one accent on 10% of the screen or less | Product UI, docs, the default for Operate and Read |
| **Committed** | One saturated color covers 30 to 60% of the surface | Identity-driven brand pages |
| **Full palette** | Three or four named color roles | Campaigns, games, data visualization, kids |
| **Drenched** | The surface is the color | A hero, a section break, a launch |

Proportion is visual weight, not pixel count. On a Restrained page the accent marks the primary action and at most one other thing.

## Tokens

- Define colors as roles, not as hues: `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, plus success, warning and danger.
- Use two layers. Primitives hold the raw values. Semantic tokens point at primitives. Dark mode remaps only the semantic layer.
- Author in OKLCH. It keeps lightness steps even across hues. Reduce chroma as lightness approaches 0 or 100.
- Neutrals carry a trace of the brand hue, with chroma about 0.005 to 0.015. Neutral gray is fine when the world of the design is neutral.
- Avoid pure `#000` and `#fff` for large areas. Use a very dark and a very light tone of the palette.
- Surfaces step away from the ground by 2 to 6 lightness points. Separate areas with tone before you reach for lines or shadows.
- Heavy use of alpha transparency means the palette is missing steps. Focus rings, overlays and hover states are the exceptions.
- Sections may switch to a full color field with a hard edge. Do not fade one section into the next.

## Light and dark

- Decide the default from the scene sentence in the brief: who, where, what light. Not from the category.
- Support both through `prefers-color-scheme`, overridable with `data-theme` on the root. A visible toggle, when present, wins over the system.
- Set `color-scheme` on the root, and a `theme-color` meta tag for each scheme.
- Dark mode is not inverted light mode:
  - Surfaces sit at about 12 to 18% lightness, and raised surfaces get lighter, about 15, 20 and 25%.
  - Show depth with lighter surfaces, not shadows.
  - Desaturate the accent slightly so it does not vibrate.
- A dark-only design is a valid choice for developer tools and immersive pieces. Say so in `DESIGN.md`.

## Contrast

- 4.5:1 for body text and placeholders. 3:1 for large text, icons, controls and focus indicators.
- Never put gray text on a colored ground. Use a darker or lighter tone of that same hue.
- Two bright colors that touch, such as yellow next to white, need a dark outline or a gap between them. Otherwise they bleed together.
- Check every theme. A palette that passes in light mode often fails in dark.

## Gradients

- A gradient needs a reason in the subject: light, heat, time, depth. A gradient used as a mood wash is a tell.
- Never gradient text.
- Lively surfaces can carry a bold gradient in one place, such as the primary button or the hero field. Not on every section.

Sources: Impeccable (the strategy ladder, OKLCH, tinted neutrals, two token layers, dark-mode lightness steps, the scene sentence, gray on color), taste-skill (role tokens, surface steps of 2 to 6 points, accent proportion, hard-edged color fields), Anthropic `frontend-design` (four to six named colors per brief).
