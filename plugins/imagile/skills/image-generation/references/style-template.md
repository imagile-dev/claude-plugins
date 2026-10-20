# Image style guide

Everything in this file is appended to every image prompt verbatim, so write it
as instructions to an image model — concrete, visual, and short. Delete the
sections that don't apply rather than leaving them vague.

## Palette

Name each color and give hex plus RGB — image models anchor better on named
colors with two notations than on hex alone.

| Role | Name | Hex | RGB |
|------|------|-----|-----|
| Primary | Imagile Blue | `#1B4FD8` | rgb(27, 79, 216) |
| Accent | Signal Orange | `#FF6B2C` | rgb(255, 107, 44) |
| Ink | Near Black | `#0B1220` | rgb(11, 18, 32) |
| Surface | Off White | `#F7F8FA` | rgb(247, 248, 250) |
| Muted | Slate | `#64748B` | rgb(100, 116, 139) |

Use Primary for the dominant subject, Accent sparingly for emphasis (under 10%
of the frame), Ink for outlines and text, Surface for backgrounds.

## Illustration style

- Flat vector, geometric shapes, no gradients unless asked
- Consistent 2px-equivalent stroke weight, rounded caps and joins
- No drop shadows, no bevels, no 3D perspective
- Generous negative space; subject centered with even margins

## Composition

- Square assets: subject fills roughly 70% of the frame
- Banners: subject weighted left, clear space on the right for overlaid text

## Never

- Photorealism, stock-photo people, lens flares
- Text baked into the image (add real text in the layout layer instead)
- Off-palette colors, especially pure `#FFFFFF` or `#000000`
