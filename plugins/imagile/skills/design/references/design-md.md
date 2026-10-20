# DESIGN.md template

Copy this to `DESIGN.md` at the repo root and fill it in. Keep it short. It records decisions, so future sessions follow them instead of asking again. Delete any section that does not apply.

```markdown
# Design

## Product

[Who uses it, and what it must help them do. Two or three sentences.]

**Scene:** [Who, where, in what light. One sentence. It decides light or dark.]

## Evidence on hand

[Real proof that exists and may be shown: customers who agreed to be named, real metrics with their source, quotes with permission. Anything not listed here must not appear on a page.]

## Surfaces

| Surface | Mode | Variance / Motion / Density |
|---------|------|-----------------------------|
| Home | Persuade | 7 / 6 / 3 |
| App | Operate | 3 / 2 / 7 |

## Direction

**Idea:** [Something only this subject has] becomes [a visual device].

**Color strategy:** [Restrained | Committed | Full palette | Drenched]

**Not this:** [Anti-references: products, looks or moods this must not resemble.]

## Tokens

| Role | Name | Light | Dark |
|------|------|-------|------|
| bg | | | |
| surface | | | |
| ink | | | |
| muted | | | |
| accent | | | |

**Type:** [Display face and weight] for headings, [body face] for text. Scale: [sizes].

**Shape:** radius [values], spacing base 4px, content width [value].

**Motion:** `--ease-out` [curve], durations [values]. [What animates and what never does.]

## Imagery

Art direction lives in `.claude/image-generation/style.md`. [The named medium in one line.]

## Standing rules

[One line per correction the user has given, newest first. These override the defaults in the design skill.]

- [yyyy-mm-dd] Never tilt clickable cards.
```

## Notes

- The tokens table mirrors the CSS custom properties. When one changes, change the other in the same commit.
- The standing rules are the most valuable part. Every correction lands here the same turn it is given.
- If the repo already has a brand or style document, link to it from here rather than copying it.

Sources: Impeccable (product context as durable facts, evidence on hand, a separate design file for tokens), taste-skill (the dials), Imagile practice (standing rules from corrections).
