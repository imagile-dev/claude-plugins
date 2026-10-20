---
name: design
description: Design, refine or critique web UI, landing pages, decks and image sets so they read as chosen, not generated. Use for a new page, a redesign, a design review, polish, motion or a brief.
---

# Design

Make interfaces that read as chosen, not generated. Every default is a decision someone skipped. This skill makes each decision on purpose: a brief first, a build to a quality floor, then a critique of real screenshots.

Two failure modes, and the first is worse:

1. **Generic.** The page could belong to any product in its category. It wears the current AI defaults, or it is so plain that nobody remembers it.
2. **Noisy.** Every element performs. Motion, gradients and ornament compete, and nothing reads first.

The cure for both is one strong idea, expressed in one place, inside a disciplined system. Restraint is not the goal. Intention is.

## 1. Pick the mode

| Mode | Use it when | Do |
|------|-------------|----|
| **Build** | A new page, screen, component, deck or image set | Sections 2 to 5 |
| **Refine** | "Make it bolder, quieter, simpler, more colorful, more alive" | Section 6 |
| **Critique** | "Review this", "does this look right", a score | [references/critique.md](references/critique.md) |
| **Polish** | Before you ship anything visual | Section 7 |

Refine never redesigns. It keeps the identity, the copy and everything outside the request. If the request needs a redesign, say so and stop. Never split the difference between the two.

## 2. Load context first

1. Read `DESIGN.md` at the repo root, the repo's `CLAUDE.md`, the existing tokens (`global.css`, `tailwind.config.*`, theme files) and `.claude/image-generation/style.md`.
2. **The brief wins.** When `DESIGN.md` or the user pins a look, follow it exactly, even when the look is on the tells list. The rules below govern only the choices nobody has made yet.
3. With no `DESIGN.md`, explore the repo, then ask at most three questions about durable facts: who uses it, what it must achieve, and what proof exists. Never ask someone to pick an aesthetic in the abstract. Show two or three options instead.
4. Write what you learn to `DESIGN.md` from [references/design-md.md](references/design-md.md). The next session should not have to ask again.
5. **A correction is a standing rule.** When the user corrects a visual choice, add one line to "Standing rules" in `DESIGN.md` in the same turn.
6. **Use only the evidence on hand.** Never invent testimonials, customer logos, user counts, metrics or quotes. Mark placeholder data and list it for the user to confirm.

## 3. Write the brief (Build mode)

Post a short brief in chat before you write code. It takes a minute and prevents the generic result.

1. **Design read.** One line: "Reading this as a [surface] for [audience], in [mode] mode, leaning toward [direction]."
2. **Surface mode.** Pick one per surface, not per product. A developer tool's landing page is still Persuade.

   | Mode | Surfaces | Expression | Variance / Motion / Density |
   |------|----------|------------|-----------------------------|
   | **Persuade** | Landing, pricing, launch, portfolio home | One big idea, real imagery, a color field | 7 / 6 / 3 |
   | **Operate** | App, dashboard, settings, admin | The system is the design. No spectacle | 3 / 2 / 7 |
   | **Read** | Docs, articles, lessons | Type carries the page | 3 / 2 / 5 |
   | **Experience** | Games, playful learning, kids, events | Characters, ambient motion, humor | 8 / 8 / 4 |

   The three dials run from 1 to 10. Variance is symmetry to bold asymmetry. Motion is static to cinematic. Density is gallery to cockpit. Read vibe words into them: "minimal" lowers variance and density, "flashy" or "lively" raises motion, "dense" or "pro" raises density. Record the dials in `DESIGN.md`.
3. **Scene sentence.** Who uses it, where, and in what light. "A night-shift nurse checking a schedule on a phone in a dim break room" decides dark or light. A category label like "dev tool means dark" does not.
4. **Idea sentence.** "[Something only this subject has] becomes [a visual device]." Then run the **competitor test**: swap in a competitor's name. If the sentence still works, the idea is generic. Rewrite it.
5. **Tokens.** Four to six named colors and a color strategy ([references/color.md](references/color.md)). Type families and their roles ([references/typography.md](references/typography.md)). A layout concept as a sentence plus an ASCII wireframe. The motion level.
6. **Argument (Persuade only).** One claim per section, each with its proof. Delete any section that has no claim. Do not default to hero, logo strip, three features, CTA.
7. **Check it against the tells.** For every axis the brief leaves free, read [references/tells.md](references/tells.md). Ask whether the theme can be guessed from the category alone, then whether the look can be guessed from the category plus "not the usual look". If either answer is yes, revise that part and say what changed.

## 4. Build to the floor

Spend boldness in one place. Let one element be the memorable thing, keep everything around it quiet, and cut decoration that does not serve the idea. When you strip a tell, fill the space with something real: scale, imagery, content or a color field. Removal alone leaves a thin, empty page.

The floor holds on every surface without being announced:

- **Tokens, not literals.** Colors, type, space, radius and motion live as tokens on `:root`. Light and dark come from `prefers-color-scheme`, overridable with `data-theme`. A toggle, when present, wins.
- **Contrast.** 4.5:1 for text, 3:1 for large text, icons, controls and focus rings. Never gray text on a colored ground.
- **Type.** At most two families. Five sizes or fewer. Body 16px or larger at 45 to 75 characters a line. Headings fit in two lines at every width.
- **Mobile first.** Works from 320px with a 16px gutter and no sideways scroll. Tap targets are 44px. Inputs are 16px so iOS does not zoom. Never disable zoom.
- **States.** Every control has default, hover, focus-visible, active, disabled, loading, error and success. Every async region has loading, empty and error.
- **Stability.** No layout shift. Animated or async panels hold a fixed height. Cards in a grid share a height with the footer pinned.
- **Never tilt anything clickable.** Tilt is for decorative stamps and stickers only.
- **Motion.** Purposeful, interruptible, `transform` and `opacity` only, and gentler under `prefers-reduced-motion`. Content is visible without JavaScript.
- **Imagery.** Real or generated art in one cohesive style. Character and decorative art ships as a transparent cutout, never a dark box. No text baked into images.
- **Copy.** Short, specific, and written from the user's side. Visuals beat paragraphs.

Detail lives in the references. Read only what the task needs:

| File | Covers |
|------|--------|
| [references/typography.md](references/typography.md) | Choosing faces, the scale, measure, display type, loading |
| [references/color.md](references/color.md) | Color strategy, OKLCH tokens, dark mode, contrast |
| [references/layout.md](references/layout.md) | Space, frame, grids, hierarchy, responsive and touch |
| [references/motion.md](references/motion.md) | Whether to animate, easing, durations, performance, reduced motion |
| [references/interaction.md](references/interaction.md) | States, forms, worst-case data, perceived speed |
| [references/copy.md](references/copy.md) | UX writing, errors, empty states, honest content |
| [references/imagery.md](references/imagery.md) | Art direction, generated art, photos, icons |
| [references/decks.md](references/decks.md) | Slide decks and talks |
| [references/tells.md](references/tells.md) | The dated list of generated-design defaults |

## 5. Look at it

Code review is not a design review. Render it and look.

1. Run the page and capture screenshots at 375px and 1440px, plus 768px for layouts that change there. Capture light and dark when both exist. Use `playwright-cli`, the browser pane or any browser tool the session has.
2. Squint at each screenshot. The primary element, the secondary element and the groups should still read in that order.
3. Hunt for collisions: overlap, clipped banners, text that wraps where it should not, misaligned icons, uneven grids, a 3 plus 1 row where 2 by 2 belongs.
4. Critique with [references/critique.md](references/critique.md), fix in its fix order, and capture again. Stop after three rounds and report what is left.
5. For games and interactive pieces, play them. A subagent playtest at mobile width finds what reading the code never will.
6. Leave the dev server running and give the user the URL. Put the final screenshots in the PR: mobile and desktop, light and dark.

When the direction is open, such as a font, a logo or a palette, build two or three small mockups side by side and let the user pick. Then build the winner.

## 6. Refine

Every refinement follows one method: assess the current state, write a one-sentence thesis, apply it in the existing system's vocabulary, capture screenshots, then polish.

| Request | What to do |
|---------|------------|
| **Bolder** | Raise the target to its neighbors' level of confidence: scale, weight, color commitment, imagery. Then quiet what surrounds it |
| **Quieter** | Remove one accessory at a time. Lower the motion dial. Merge colors to fewer roles |
| **Simpler** | Cut sections that make no claim. Cut words by half. Turn paragraphs into one visual |
| **More color** | Move one step up the color strategy ladder. Never add a second accent hue first |
| **Typography** | Rebuild the scale and pairing from [references/typography.md](references/typography.md) |
| **Layout** | Fix the frame, the left edges and the rhythm from [references/layout.md](references/layout.md) |
| **Animate** | Pass the frequency gate in [references/motion.md](references/motion.md) first. Then add one orchestrated moment |
| **Clearer copy** | Apply [references/copy.md](references/copy.md) |
| **Responsive** | Rework for 375px first: single column, real tap targets, nothing clipped |
| **Harden** | Feed worst-case data and add the missing states from [references/interaction.md](references/interaction.md) |

## 7. Ship checklist

Run this before you call any visual work done:

- [ ] `DESIGN.md` reflects the decisions made and any corrections given
- [ ] Screenshots at 375px and desktop, light and dark, show no collisions or clipping
- [ ] Nothing on [references/tells.md](references/tells.md) appears unless the brief pinned it
- [ ] Every control has its states, and every async region has loading, empty and error
- [ ] Worst-case data renders: long names, zero and one items, huge numbers
- [ ] Keyboard reaches everything, focus is visible, and reduced motion is respected
- [ ] The `accessibility` skill reports zero serious violations on the main themes
- [ ] Images are cohesive, cut out where they should be, and optimized with `web-optimize`
- [ ] Copy is cut to what the user needs, with no invented proof
- [ ] The dev server is running and the PR has the screenshots

## Related skills

- `accessibility` audits WCAG 2.2 AA with axe-core across widths, schemes and themes.
- `image-generation` makes art from a palette-locked `style.md`. `background-removal` cuts it out. `web-optimize` ships it.
- `architecture` holds the stack defaults for sites in its [web reference](../architecture/references/web.md).

## Credits

This skill paraphrases and combines ideas from Anthropic's `frontend-design` skill (Apache-2.0), Paul Bakaus's Impeccable (Apache-2.0), Emil Kowalski's design engineering skills (MIT) and Leonxlnx's taste-skill (MIT). No text is copied. Each reference file names the source of its rules.
