# Typography

Type carries the personality of the page. Treat a headline as an active part of the design, not a neutral container for words.

## Choose the faces

Run this procedure every time. Do not reach for a list of approved fonts.

1. Write three concrete words for the voice, such as "precise, warm, unhurried".
2. Imagine the brand as a physical object, such as "a 1970s terminal manual" or "a field guide with a cloth cover".
3. Write down the three fonts you would pick by reflex. Reject them.
4. Browse a real catalog (Fontsource, Google Fonts, a foundry) for faces that fit the object.
5. If your final pick matches one of the reflex fonts, start again.

Rules for the pairing:

- Use at most two families. One family in several weights often beats a timid display and body pair.
- If you use two, make them clearly different. Never pair two similar faces, such as two geometric sans.
- A display face with character over a neutral body face is the safe structure. A plain face for dense reading stays plain.
- Monospace is for code, data and prices. It is never navigation, a button or a costume.
- In product UI (Operate mode), a well-made system or neutral sans is fine. The type does not need to perform.

## The scale

- Five sizes or fewer, far apart. A useful set is about 0.75, 0.875, 1, 1.25 to 1.5, and 2 to 4rem.
- Step ratio: 1.25 or more on Persuade and Experience surfaces, 1.125 to 1.2 on Operate surfaces.
- On Persuade surfaces, the display size is at least four times the body size.
- Use `clamp()` for display and marketing headings only. Keep the maximum within about 2.5 times the minimum. Body text stays a fixed rem size.
- Space above a heading is at least twice the space below it.

## Body text

- 16px or larger, in rem. 16 to 20px reads best.
- Line height 1.45 to 1.7. Serif body text takes the higher end.
- 45 to 75 characters a line, 65ch as the target. Tables may run wider.
- Full ink, not gray, for anything people must read.
- Use `text-wrap: pretty` on prose. Never justify text on the web.
- Separate paragraphs with space or a first-line indent, never both.

## Display text

- Tighten tracking as size grows: about -0.02em at display sizes, down to -0.04em at the largest. Body tracking stays near zero.
- Leading 0.9 to 1.05 at display sizes.
- Use `text-wrap: balance` on headings.
- Every headline fits in two lines at every width. Estimate characters per line as width divided by (font size times k), where k is about 0.40 for condensed faces, 0.50 for normal sans and 0.58 for wide faces. About 32 characters is safe everywhere.
- Pull a large round initial capital left by about 0.05em so it aligns optically.

## Labels and small text

- Uppercase only for short labels, with 0.05 to 0.12em of letter spacing. Never set body copy in capitals.
- Nothing under 12px, and nothing under 11px even in dense UI.
- Do not change font weight on hover. It shifts the layout.

## Light text on dark

Light text looks heavier and tighter than dark text at the same settings. Compensate:

- Add 0.05 to 0.1 to the line height.
- Add 0.01 to 0.02em of letter spacing.
- Drop the weight one step, or use 350 where you would use 400.

## Details

- `font-variant-numeric: tabular-nums` on prices, tables, counters and anything that updates.
- The real ellipsis character, curly quotes and real apostrophes.
- Thousands separators from the locale, not hand-written.

## Loading fonts

- Self-host through Fontsource or the project's asset pipeline.
- `font-display: swap`, or `optional` where zero layout shift matters more than the face.
- A metric-matched fallback with `size-adjust` and the ascent and descent overrides, so the swap does not move text.
- Preload only the body weight used above the fold.
- Use a variable font when you need three or more weights.

Sources: Impeccable (scale ratios, measure, dark-text compensation, the font procedure, loading), taste-skill (display at four times body, the two-line arithmetic, heading spacing, no weight change on hover), Emil Kowalski (tabular numbers, the ellipsis character, size-specific tracking), Anthropic `frontend-design` (at most two families, type as an active element).
