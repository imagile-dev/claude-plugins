# Motion

Animation is a decision, and "no animation" is often the right one. Motion that answers a person's action is welcome when it shows what changed. Motion nobody asked for should be rare and deliberate.

## Should it animate?

Gate by how often people see it:

| How often | Decision |
|-----------|----------|
| Hundreds of times a day: keyboard shortcuts, a command palette, toggles | No animation |
| Tens of times a day: hover, list navigation, tabs | None, or barely perceptible |
| Occasionally: modals, drawers, toasts, menus | Standard animation |
| Rarely: first run, a milestone, a celebration, a page load | Room for delight |

- Never animate an action started from the keyboard.
- Name the purpose before you add it: feedback, spatial continuity, a state change, softening a jarring jump, explaining a process, or delight on a rare moment. "It looks nice" is not a purpose.
- Data people are reading or acting on does not move for style.
- Match the surface mode. Operate surfaces get feedback motion only. Persuade gets one orchestrated moment. Experience surfaces may carry ambient motion.

## Easing

Use named tokens. Never invent a curve, and never use the browser's weak built-in keywords for UI.

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | The default. Anything entering, exiting or responding |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Larger reveals and page-level entrances |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Something already on screen moving or morphing |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets and drawers, close to the native iOS feel |

- Never use `ease-in` on UI. It delays the very moment the person is watching.
- Use `linear` only for constant motion such as a progress bar or a spinner.
- No bounce and no elastic easing.

## Duration

| Element | Duration |
|---------|----------|
| Press and micro feedback | 100 to 160ms |
| Tooltips, small popovers | 125 to 200ms |
| Dropdowns, menus, tabs | 150 to 250ms |
| Modals, drawers | 200 to 300ms |
| One authored entrance or reveal | 500 to 800ms |

- UI motion stays under 300ms. A 180ms dropdown beats a 400ms one.
- Exits run about 75 to 80% of the entrance duration.
- Longer travel takes a little longer. Time where the user decides, and be fast where the system responds.
- A whole load sequence finishes within about 1.2 seconds.

## Physical feel

- Pressable elements scale to about 0.97 on `:active`, over about 150ms.
- Never enter from `scale(0)`. Start at 0.95 with `opacity: 0`.
- Popovers and menus scale from their trigger with `transform-origin`. Modals stay centered.
- Exit the way you entered. A toast that rises from the bottom leaves through the bottom.
- Springs are for gestures and drag with momentum. Keep bounce between 0.1 and 0.3, or none.

## Interruptible

- Use CSS transitions for anything that can retrigger, such as toggles, toasts and hovers. A transition continues from where it is. A keyframe animation restarts from zero.
- Use `@starting-style` for entry transitions, with a `data-mounted` attribute as the fallback.
- Never block interaction while an entrance plays.

## Reveals and staggers

- Pick one orchestrated moment per page, such as the load sequence or one reveal. Scattered effects read as generated.
- Stagger items 30 to 80ms apart, with the whole stagger under about 500ms.
- Scroll reveals run once, rise 16 to 32px, and order heading, then text, then image.
- Content is visible by default. Hide reveal targets only under a JavaScript class and `prefers-reduced-motion: no-preference`, so a failed script never hides the page.

## Ambient and looping motion

Experience surfaces such as games, learning pieces and playful sites may carry ambient motion: parallax, light particles, looping demonstrations.

- A looping demonstration shows a progress or time indicator, and labels what it shows.
- Loops pause when off screen and when the tab is hidden.
- Animated panels hold a fixed height.
- Check that directional motion runs the right way. Arrows and flows going backwards are a common bug.
- Reduced motion turns ambient motion off entirely.

## Performance

- Animate `transform` and `opacity`. Bounded `filter`, `clip-path` and `mask` are acceptable when they stay smooth.
- Never `transition: all`.
- The frame budget is 16.7ms at 60Hz and about 8ms at 120Hz. Smooth on a fast laptop proves nothing.
- Animate `filter: drop-shadow()` rather than `box-shadow`.
- Keep animated blur under 20px. 2 to 5px is enough to soften a crossfade.
- Never set framework state on every frame. Write to the element's style directly.
- Do not drive many child transforms through one inherited CSS variable. It recalculates style for every child.
- Prefer CSS or the Web Animations API over `requestAnimationFrame` on a busy page.
- Add `will-change` only after you see a problem, and only for the duration of the animation.
- Name the cause of jank before you change code.

## Reduced motion

`prefers-reduced-motion: reduce` means fewer and gentler animations, not zero. Keep opacity and color changes, drop movement and scale, and replace a slide with a short crossfade. Ambient and looping motion stops.

## Perceived speed

- Under 80ms feels instant.
- After the first tooltip opens, neighboring tooltips open with no delay and no animation.
- Skeletons beat spinners for content. A faster spinner makes the same wait feel shorter.
- Give feedback on `pointerdown`, not on release.
- Use optimistic UI for low-stakes actions only.

## Debugging

- Watch motion at two to five times slower, or frame by frame.
- Test gestures on a real phone.
- Look again the next day. Fresh eyes catch timing that felt fine at the end of a session.

Sources: Emil Kowalski (the frequency gate, keyboard rule, purpose list, curves, durations, press scale, transform origin, interruptibility, performance, reduced motion as gentler, perceived speed, debugging), Impeccable (exit ratio, capped stagger, visible-by-default content, expo curve), taste-skill (reveal order and rise, the 1.2 second load budget, banned motion), Anthropic `frontend-design` (one orchestrated moment).
