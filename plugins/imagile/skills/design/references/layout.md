# Layout

Visual structure is information. Borders, numbers, labels and dividers say something about the content. Use them only when they are true.

## Space

- Use a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Name spacing tokens by relationship, such as `--space-related` and `--space-section`, not by value.
- Use `gap` for spacing between siblings, not margins on each child.
- Related things sit closer together than unrelated things. Spacing that is the same everywhere hides the groups.
- Give elements room to breathe. Cramped padding is a common complaint. When in doubt, take one step up the scale.

## The frame

- Outer margins are equal on both sides. Asymmetry happens inside the grid, never in the frame.
- Text shares two or three left edges across the page. Count them in a screenshot.
- No section is huddled on one side with half the width empty.
- No blank stretch is taller than half a screen.
- On desktop, sections sit about 96 to 240px apart. Persuade pages take the high end.
- Content width sits around 1100 to 1200px, with prose held to its measure inside.

## Hierarchy

- Build hierarchy from two or three dimensions at once: size, weight, color, space, position.
- A strong size step is about 3:1. Under 2:1 is weak.
- **Squint test.** Blur a screenshot. The primary element, the secondary element and the groups should still read in that order.
- One `h1` per page. Every section has a heading. Never skip heading levels.

## Grids and cards

- A grid has a balanced count. Four items go 2 by 2, not 3 plus 1. Six go 3 by 2 or 2 by 3.
- Cards in one grid share a height, with the footer pinned by `margin-top: auto`.
- `repeat(auto-fit, minmax(280px, 1fr))` gives a responsive grid without breakpoints.
- A bento grid has exactly as many cells as there is content.
- Never nest cards inside cards.
- Lock one radius system: all square, all moderate, or pills for interactive elements. Larger containers may take a larger radius than their children.
- Shadows should be barely visible and offset downward. A zero-offset colored halo is decoration.
- Use a named z-index scale: dropdown 100, sticky 200, backdrop 300, modal 400, toast 500, tooltip 600.
- Never repeat the same layout in every section. Vary the layout family through the page.

## Stability

- Nothing moves after it renders. Reserve space for images, embeds and async content.
- Animated, looping or async panels hold a fixed height, so the page does not jump.
- Never tilt, rotate or skew anything clickable. It reads as broken and makes the hit area unclear.
- Banners and hero images never clip their subject at any width. Check `object-position`.

## Responsive

- Design for 375px first, then grow. Test from 320px.
- 16px side gutter, and no sideways scroll at any width.
- Give flex and grid children `min-width: 0` so long words do not force overflow.
- Asymmetric and multi-column layouts collapse to one strict column under 768px.
- Use container queries for components and viewport queries for page layout.
- Choose breakpoints where the content breaks, typically around 640, 768 and 1024px.
- Use `100dvh` for app shells and `100svh` for heroes, never `100vh` on mobile.
- Use `viewport-fit=cover` with `env(safe-area-inset-*)` padding for full-bleed layouts.

## Touch

- Tap targets are at least 44 by 44px. Enlarge a small control with a pseudo-element.
- Inputs use a 16px font so iOS does not zoom. Never set `user-scalable=no` or `maximum-scale=1`.
- Remove the default tap highlight with `-webkit-tap-highlight-color: transparent`, and then give every control an `:active` state.
- Use `touch-action: manipulation` on controls to drop the tap delay.
- Gate hover effects behind `@media (hover: hover) and (pointer: fine)` so touch devices do not get stuck hover states.
- Use `overscroll-behavior: contain` on inner scrollers.
- Apply `user-select: none` to controls only, never to text people may want to copy.

## Performance

- Put grain, noise and texture on one fixed layer with `pointer-events: none`, never on scrolling content.
- Use `backdrop-filter` only on fixed elements such as a header.
- Targets: LCP under 2.5s, INP under 200ms, CLS under 0.1.

Sources: Impeccable (4px scale, relationship naming, squint test, 3:1 size step, z-index scale, auto-fit grids, container queries), taste-skill (frame rules, left edges, section spacing, bento cell count, one radius system, dvh, collapse under 768px, texture layers, performance targets), Emil Kowalski (the mobile and touch rules), Anthropic `frontend-design` (structure as information). Imagile's own rules from shipped sites: balanced grids, shared card heights, fixed-height animated panels, no tilted controls, room to breathe.
