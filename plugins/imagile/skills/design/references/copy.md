# Copy

Words in a design exist to make it easier to understand and use. They are design content, not decoration. Write less than you think, then cut it again.

## Cut first

- Lead with the important thing. The first line of a section says what matters most.
- Prefer a visual to a paragraph: a diagram, an image, an animation or a single number.
- Never repeat the heading in the first sentence below it.
- Never repeat a point another section already made. Repetition is the most common reason a page feels long.
- One element does one job. A heading names, a subhead explains, a button acts.

## Name things from the user's side

- Name things by what users understand, not by how the system is built. People manage notifications, not webhook config.
- No internal codes, IDs or jargon on screen, such as `SVC-01` or "parser". Spell out an abbreviation the first time it appears.
- Pick one term per concept and keep it everywhere: Delete, Settings, Sign in, Create.
- Use sentence case for headings, buttons and labels.

## Actions

- A button is a verb and an object: "Save changes", "Delete 5 items", "Keep editing". Never "OK", "Submit" or "Yes".
- An action keeps its name through the flow. The "Publish" button produces a "Published" toast.
- "Delete" means permanent. "Remove" means recoverable.
- Link text makes sense on its own. Never "click here".

## Errors, empty and loading

- An error says what happened, why, and how to fix it. It speaks in the interface's voice, never blames the user, and never apologizes or jokes.
- An empty screen tells the user what to do next. See `interaction.md` for the kinds.
- Loading text names the real operation, such as "Importing 240 contacts". Never fake progress.

## Honest content

- Use only proof that exists. No invented testimonials, logos, customer counts, metrics or awards.
- Sample data looks organic and is marked as sample data. List it for the user to confirm or replace.
- Totals and percentages add up from the parts shown.

## Tone

- Plain verbs, active voice, no filler.
- Match the tone to the brand and the audience. A playful surface can be funny in its headings and empty states. Errors and anything about money, health or data loss stay plain.
- Humor works best deadpan and specific. One good line beats three attempts.

## Tells to cut

- Elevate, seamless, unleash, empower, supercharge, streamline, world-class, cutting-edge
- "Not just X, it's Y" and "No X. Just Y."
- Tricolons that exist for rhythm
- "Get started" and "Learn more" when a specific action fits
- Dramatic one-word fragments and colon reveals
- A dash in every other sentence

## Translation

- Plan for text about 30% longer in German, 20% in French and up to 40% in Finnish.
- Write whole sentences as single strings. Never build a sentence from fragments.
- Keep numbers and names out of the middle of translated strings where you can.

## Alt text

Alt text carries the information the image carries. A decorative image gets an empty `alt`. A chart's alt text states its conclusion.

Sources: Anthropic `frontend-design` (words as design content, user-side naming, consistent action names, errors and empty states), Impeccable (verb and object buttons, delete versus remove, the error formula, terminology, translation budgets, link and alt text), taste-skill (content honesty, copy tells).
