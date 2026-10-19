# What axe can't catch: the manual pass

axe checks what is in the DOM at one moment. It can't tell whether focus order makes sense, whether an error is announced, or whether the page survives 400% zoom. Work through this list on the main flows (sign in, the primary task, a form, a dialog), at a mobile width and a desktop width. For each item record **checked: pass**, **checked: fail (what)**, or **not checked**. Never mark an item as passing because axe passed.

Playwright (or a browser tool) can do most of these: press Tab and read `document.activeElement`, set the viewport, emulate reduced motion, inject CSS.

## Keyboard and focus

- [ ] **Keyboard-only walkthrough.** Put the mouse away. Every control is reachable with Tab and Shift+Tab, activates with Enter or Space (arrow keys inside menus, tabs, radio groups, grids), and nothing traps focus except an open modal. (2.1.1, 2.1.2)
- [ ] **Focus order** follows the reading order; no jumps into hidden off-canvas menus. (2.4.3)
- [ ] **Visible focus** on every focusable element, in every theme. A custom `outline: none` with no replacement fails. The indicator is at least 3:1 against what it sits on. (2.4.7, 2.4.11, 1.4.11)
- [ ] **Focus not obscured** by sticky headers, cookie banners or chat docks. (2.4.11)
- [ ] **Skip link** as the first Tab stop, visible when focused, moving focus to `<main>`. (2.4.1)
- [ ] **Dialogs** move focus in on open, keep it inside, close on Escape, and return focus to the control that opened them.

## Structure and names

- [ ] **Landmarks:** one `<main>`, a `<header>`/`<nav>`/`<footer>` where they exist, multiple `<nav>`s told apart with `aria-label`.
- [ ] **Heading outline** reads as a table of contents: one `h1`, no skipped levels used for styling. (1.3.1, 2.4.6)
- [ ] **Icon-only buttons and links** have a name that says what they do ("Close", "Open GitHub repository"), checked at mobile widths where labels often collapse to icons. (4.1.2, 2.4.4)
- [ ] **Visible label is part of the accessible name**, so voice control users can say what they see. (2.5.3)
- [ ] **Page `<title>`** names the page and changes on client-side navigation. (2.4.2)

## Forms

- [ ] Every input has a visible `<label>`; placeholder text is not the label. (3.3.2)
- [ ] **Errors** name the field and the fix in text, are tied to it with `aria-describedby` (and `aria-invalid="true"`), and are announced or focused on submit. Color is not the only signal. (3.3.1, 3.3.3, 1.4.1)
- [ ] Required fields say so in text, not only with an asterisk's color.
- [ ] `autocomplete` on personal-data fields (name, email, address). (1.3.5)

## Visual

- [ ] **Contrast axe marked "incomplete":** text over images, gradients, video, textures or overlays. Sample the worst spot behind the text with a contrast checker. 4.5:1 for body text, 3:1 for large text (24px, or 18.66px bold) and for UI component boundaries and icons. (1.4.3, 1.4.11)
- [ ] **Hover and focus states** keep contrast (axe sees the resting state only).
- [ ] **Reflow at 320 CSS px:** a 1280px-wide window at 400% zoom, or a 320px viewport. No horizontal scroll for text content, nothing cut off or overlapping. Data tables, maps and code blocks may scroll in their own region. Ties in with any overflow checks the project already has. (1.4.10)
- [ ] **200% text zoom** without loss of content. (1.4.4)
- [ ] **Text spacing (1.4.12):** inject the bookmarklet CSS and look for clipped or overlapping text:
  ```css
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
  ```
- [ ] **Target size:** pointer targets at least 24 by 24 CSS px, or spaced so a 24px circle around each doesn't overlap another. axe's `target-size` catches some; check dense toolbars, pagination and inline icon buttons at mobile widths. (2.5.8)
- [ ] **Orientation:** works in portrait and landscape. (1.3.4)

## Motion and time

- [ ] **`prefers-reduced-motion: reduce`** stops parallax, auto-playing carousels, large transitions and scroll-reveal animations, and content is still visible without them. Run the script with `--reduced-motion reduce`. (2.3.3)
- [ ] Anything that moves, blinks or auto-updates for more than 5 seconds can be paused. (2.2.2)
- [ ] Nothing flashes more than three times a second. (2.3.1)

## Dynamic content

- [ ] **Live regions** announce async status: "Saved", "3 results", sync progress, toasts. Use `role="status"` (polite) or `role="alert"` (assertive), and put the region in the DOM before its text changes. (4.1.3)
- [ ] Loading states are announced, and focus isn't lost when content re-renders.

## Screen reader smoke (10 minutes)

Not a full audit; a check that the main flow is usable.

- **Windows, NVDA** (free, nvaccess.org) with Chrome or Firefox. Insert+Space toggles browse and focus mode; H and Shift+H move by heading, D by landmark, Tab by control, Insert+F7 lists links and headings.
- **macOS, VoiceOver** with Safari. Cmd+F5 turns it on; VO is Ctrl+Option. VO+U opens the rotor (headings, landmarks, form controls); VO+Right Arrow reads the next item.

Check: the page title is read on load, headings and landmarks list sensibly, every control is announced with name, role and state ("Dark mode, switch, off"), the main form can be completed and its errors are heard, and dialogs and status messages are announced.
