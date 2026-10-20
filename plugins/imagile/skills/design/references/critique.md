# Critique

Judge the rendered page, never the code alone. Form your own view before you read any tool output, so the tools check you rather than lead you.

## Capture

Screenshot every surface under review at 375px and 1440px, plus 768px where the layout changes. Capture light and dark, and every named theme. Keep the files, because the PR needs them.

## Passes

Run these in order. Each takes a minute.

1. **One second, then five.** What do you see first, and what do you understand after five seconds? If the answer is not the page's main point, hierarchy is the first fix.
2. **Squint.** Blur the screenshot. Primary, secondary and groups should still read in order.
3. **Cover the logo.** Could this page belong to a competitor? If yes, the idea is missing.
4. **Count the left edges.** More than three text edges reads as disorder.
5. **Frame.** Equal outer margins, no huddled sections, no blank stretches over half a screen.
6. **Type.** Scale, measure, two-line headlines, contrast, no orphaned single words.
7. **Color.** Strategy holds, accent proportion holds, every theme passes contrast.
8. **Imagery.** One hand drew all of it. Cutouts are clean. Nothing is clipped.
9. **Sameness.** Describe each section's layout in one word. Repeated words mean repeated layouts.
10. **Phone.** At 375px: one column, real tap targets, nothing clipped, no sideways scroll.
11. **Collisions.** Overlaps, clipped banners, wrapped labels and buttons, misaligned icons, uneven grids.
12. **Tells.** Check [tells.md](tells.md). Each tell found is a finding unless the brief pinned it.
13. **Copy.** Cut by half? Jargon? Repetition? Invented proof?
14. **States.** Loading, empty, error and worst-case data, where the surface has them.

## Score

Score the ten Nielsen heuristics from 0 to 4 each, for a total out of 40:

1. Visibility of system status
2. Match between the system and the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose and recover from errors
10. Help and documentation

| Total | Band |
|-------|------|
| 36 to 40 | Excellent |
| 28 to 35 | Good |
| 20 to 27 | Acceptable |
| 12 to 19 | Poor |
| 0 to 11 | Critical |

- Most real interfaces score 20 to 32. A score above 35 needs evidence for every point.
- On Persuade and Experience pages, heuristics 7 and 10 may be marked n/a. Rescale the total to the remaining maximum.
- **Tell cap.** Any visible tell that the brief did not pin caps the band at Acceptable, whatever the total.

## Severity

| Level | Meaning |
|-------|---------|
| **P0** | Blocks the task, or breaks the page at a common width |
| **P1** | A major problem or a WCAG AA failure. Would a user contact support? Then it is P1 or worse |
| **P2** | A minor problem that costs time or trust |
| **P3** | Polish |

## Personas

Walk the main task as two or three of these, chosen by the surface:

| Persona | Watch for | Use for |
|---------|-----------|---------|
| Power user | Missing shortcuts, slow repeated actions, animation in the way | Operate |
| First-timer | Jargon, unclear first step, missing empty states | Persuade, Operate |
| Assistive tech user | Focus order, labels, contrast, motion | Every surface |
| Stress tester | Long names, zero and huge counts, slow network | Operate |
| Distracted phone user | Tap targets, thumb reach, lost state after interruption | Every surface |

## Cognitive load

Count the failures. Zero or one is low, two or three is moderate, four or more is critical.

- More than four options at one decision point
- A step that asks the user to remember something from an earlier screen
- Two elements competing to be first
- An unfamiliar term with no explanation
- Visual grouping that contradicts the logical grouping
- An action whose result is not visible
- Inconsistent names for the same thing
- A wall of text where a visual would do

## Fix order

Fix in this order, because each level changes the ones below it:

idea, hierarchy, composition, type, imagery, color, detail, motion

Capture again after each round. Stop after three rounds and report what is left.

## Output

```
## Design critique: [surface]

**Mode:** [Persuade | Operate | Read | Experience]
**Score:** [n]/40, [band] [, capped by a tell]
**Screens:** [list of screenshot paths]

### What works
- [Specific strengths worth keeping]

### Findings
| Sev | Where | Finding | Fix |
|-----|-------|---------|-----|
| P1 | Hero at 375px | Headline wraps to four lines | Cut to 28 characters or drop a size step |

### Next
[The one change that would move the score most.]
```

Sources: Impeccable (Nielsen scoring, the bands and the 20 to 32 anchor, n/a rescaling, severity with the support tie-breaker, personas, the cognitive-load checklist, judging before reading tool output), taste-skill (the passes, the tell cap, the fix order, three rounds at most).
