# Fix patterns for the common axe rules

Native HTML first. A `<button>` gets keyboard support, focus, a role and a name for free; a `<div role="button">` needs all of that wired by hand and usually misses some. Use ARIA to fill a gap HTML can't, and for complex widgets (combobox, menu, grid, tree, date picker, drag and drop) use a tested library such as React Aria (`react-aria-components`) rather than writing the roles and keyboard handling yourself.

After each fix, rerun the same audit command and compare the rule's count.

## color-contrast (1.4.3)

Text needs 4.5:1 against its background, large text (24px, or 18.66px bold) 3:1. axe's failure summary gives the measured ratio and both colors.

```css
/* Before: #857a6c on #1f1a15 is 4.1:1 */
.meta { color: #857a6c; }
/* After: lighten the token until it clears 4.5:1, and fix it at the token, not per component */
:root { --color-ink-muted: #9a8f80; }
.meta { color: var(--color-ink-muted); }
```

- Fix the design token, then rerun every theme: one muted token usually fails in several places.
- Opacity counts. `opacity: .6` on text, or a translucent overlay, lowers the effective contrast.
- `aria-hidden` text still has to meet contrast if it's visible.
- Logotypes and disabled controls are exempt; say which in the allowlist reason.

## label (1.3.1, 4.1.2)

```html
<!-- Before: placeholder is not a label -->
<input type="email" placeholder="Email">
<!-- After -->
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email">
```

If the design has no visible label (a search box with a button), `aria-label="Search"` names it, but a visible label is better for everyone.

## button-name (4.1.2)

```html
<!-- Before -->
<button><svg>...</svg></button>
<!-- After: text for assistive tech, the icon hidden from it -->
<button type="button" aria-label="Close dialog"><svg aria-hidden="true" focusable="false">...</svg></button>
<!-- Or visually hidden text, which translates with the page -->
<button type="button"><svg aria-hidden="true">...</svg><span class="sr-only">Close dialog</span></button>
```

```css
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

## link-name (2.4.4, 4.1.2)

The same fix as button-name. Check mobile widths especially: a header link that shows "GitHub" on desktop often hides that text with `display: none` at small widths, which removes its name too. Hide it with `.sr-only` instead, or add `aria-label`.

```html
<a href="https://github.com/org/repo" class="btn">
  <svg aria-hidden="true">...</svg><span class="label">GitHub</span>
</a>
```
```css
@media (max-width: 640px) { .btn .label { /* not display:none */ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; } }
```

Links that differ from surrounding text only by color fail `link-in-text-block`: underline them.

## image-alt (1.1.1)

```html
<img src="chart.png" alt="Sign-ups doubled from March to June">  <!-- informative: say what it shows -->
<img src="divider.png" alt="">                                   <!-- decorative: empty alt, not missing -->
<svg role="img" aria-label="Company logo">...</svg>               <!-- meaningful inline SVG -->
```

## aria-* misuse (aria-allowed-attr, aria-required-attr, aria-valid-attr-value, aria-hidden-focus, aria-prohibited-attr)

- `aria-label` on a `<div>` or `<span>` with no role is ignored (aria-prohibited-attr). Give it a role that takes a name, or put the label on the real control.
- A role needs its required attributes: `role="checkbox"` needs `aria-checked`, `role="slider"` needs `aria-valuenow`. Or use `<input type="checkbox">` / `<input type="range">`.
- `aria-hidden="true"` must not contain anything focusable (aria-hidden-focus). Use `inert` on the container, or remove the focusable children from the tab order.
- IDs referenced by `aria-labelledby` / `aria-describedby` / `aria-controls` must exist and be unique.

## landmark-one-main and region (best-practice)

```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header>...</header>
  <nav aria-label="Primary">...</nav>
  <main id="main" tabindex="-1">...</main>
  <footer>...</footer>
</body>
```

`region` means some content sits outside every landmark: move it inside one, usually `<main>`, or into the header or footer. A toast container can be a `role="status"` region.

## nested-interactive (4.1.2)

An interactive element inside another (a button inside a link, a link inside a `role="button"` card) is announced unreliably and can't be operated on its own.

```html
<!-- Before: whole card is a link, with a button inside -->
<a href="/item/1" class="card">Title <button>Star</button></a>
<!-- After: one link on the title, stretched over the card with CSS; the button sits beside it -->
<article class="card">
  <h3><a href="/item/1" class="card__link">Title</a></h3>
  <button type="button" aria-pressed="false">Star</button>
</article>
```
```css
.card { position: relative; }
.card__link::after { content: ""; position: absolute; inset: 0; }
.card button { position: relative; z-index: 1; }
```

## scrollable-region-focusable (2.1.1)

A region that scrolls (a code block, a terminal, a wide table) must be reachable by keyboard so it can be scrolled with arrow keys.

```html
<pre tabindex="0" role="region" aria-label="Install command output"><code>...</code></pre>
```

Give it a name so the focus stop makes sense when announced. If it only overflows by a few pixels, fix the overflow instead.

## target-size (2.5.8)

Pointer targets at least 24 by 24 CSS px, or enough spacing around smaller ones.

```css
.icon-button { min-width: 24px; min-height: 24px; } /* 44px is the comfortable size for touch */
```
