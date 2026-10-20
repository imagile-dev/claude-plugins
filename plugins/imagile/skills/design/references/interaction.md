# Interaction

## States

Every interactive element has eight states, and each one is designed, not left to the browser:

default, hover, focus, active, disabled, loading, error, success

- Design hover and focus separately. Keyboard users never see hover.
- Use `:focus-visible` for the ring. Never remove an outline without a replacement that meets 3:1 contrast.
- Every async region has loading, empty and error states. Use a skeleton for loading content, and a spinner only for a short action.
- A disabled control says why when it can, in a tooltip or a line of help text.

## Forms

- The label sits above the input. A placeholder is never the label.
- The error sits below the field, tied to it with `aria-describedby`.
- Validate on blur, not on every keystroke. Revalidate on change once a field has shown an error.
- Mark the optional fields, not the required ones, when most fields are required.
- Keep the user's input after an error. Never clear a form.

## Decisions

- Prefer undo over a confirmation dialog. Confirm only what cannot be undone.
- A modal is the last option, not the first. Try inline expansion, a popover or a new page first.
- Use the Popover API or anchor positioning, not `position: absolute` inside a clipped container.
- Offer at most four options at any decision point. Hide the rest behind progressive disclosure.
- One intent has one label. "Contact us", "Let's talk" and "Get in touch" are the same intent, so pick one.
- Button text never wraps on desktop.

## Worst-case data

Before you call a component done, feed it the data that breaks layouts:

- A long hyphenated name with diacritics, a one-letter name, an empty name
- A long email address and a long unbroken URL
- Zero items, one item, and thousands of items, with correct plurals for each
- Large numbers with locale thousands separators, negative numbers, and live counters in `tabular-nums`
- Right-to-left text and emoji in names
- Translations about 30% longer than English

Build a dev-only toggle that swaps in this data when the component is shared or long-lived. Report what breaks before you fix it.

## Empty states

An empty state is an invitation to act. Tell apart the kinds, because each needs different words:

- First use: explain the value and give the first action.
- No results: show what was searched and how to widen it.
- Filtered out: show the active filters and a way to clear them.
- No permission: say who can grant access.
- Failure: say what failed and how to retry.

## Perceived speed

- Respond on `pointerdown`.
- Show the result of a low-stakes action immediately and reconcile in the background.
- Keep the previous content visible while new content loads, instead of blanking the page.
- See `motion.md` for timing.

## Personality in interaction

Interaction can carry personality without costing clarity. A playful surface can have a character that reacts, a sound, or a small celebration on a rare milestone. Speech bubbles point at the speaker. Clickable things look clickable and never move away from the cursor.

Sources: Impeccable (the eight states, undo over confirm, modal last, Popover API, four options), taste-skill (label above and error below, one label per intent, unwrapped buttons, skeletons), Emil Kowalski (worst-case data and the demo-data toggle, pointerdown feedback), Anthropic `frontend-design` (empty states as invitations).
