# Decks

A slide supports a speaker. It is not a document. If the slide makes sense without the speaker, it holds too much text.

## Structure

- One idea per slide. When a slide has two ideas, split it.
- A short headline, eight words or fewer, that states the point rather than the topic. "Reviews take three days" beats "Review process".
- Talking points go in the speaker notes, not in bullets on the slide.
- Give the talk an arc. A familiar story shape, such as an origin story, a quest or a before and after, helps an audience follow without a bulleted agenda.
- A number that matters gets its own slide: one big figure and a short label.

## Imagery

- Lead with big imagery: full-bleed photos and illustrations, real screenshots, diagrams.
- Mix real images, licensed and credited, with generated art from one `style.md`, so the deck looks like one piece.
- Text over a full-bleed image needs a scrim. Bake a gradient fade into the image on the side where the headline sits, so the text reads at any projector contrast.
- Generate background art with negative space on one side for the headline and no text in the image.
- Frame screenshots consistently: the same radius, the same shadow, the same scale.

## Visual system

- Pick a palette, two type families and one repeating motif, such as a kicker style or a pill shape, and hold them across every slide.
- Dark slides suit projectors and dim rooms. Light slides suit bright rooms and printed handouts. Decide from the room, the scene sentence again.
- Body text on a slide is 24pt or larger. Headlines are 40pt or larger.
- Test a slide at the back of the room: shrink the screenshot to a quarter size and check it still reads.

## Build

- An HTML deck, or a `.pptx` built with a library such as `pptxgenjs`, both work. Keep the source and the images in the repo so the deck can be rebuilt.
- Keep the image prompts in `.claude/image-generation/` so any slide can be regenerated.
- Export a PDF for sharing, and check that speaker notes survive the export when they need to.

Sources: Imagile's own talk practice (one idea per slide, imagery first, notes over bullets, baked fades, story arcs), Anthropic `frontend-design` (one memorable element, restraint around it).
