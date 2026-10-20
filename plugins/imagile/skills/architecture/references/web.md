# TypeScript, Node and web conventions

## Node tools and libraries

- TypeScript on the current Node LTS. ESM.
- Validate input with zod at the edge.
- Prefer zero runtime dependencies. Bundle what you need (esbuild or tsup). No native addons, no `postinstall`, no downloaded binaries.
- Never spawn through a shell. Build paths with `node:path` and `os.homedir()`.
- Run CI on Windows, macOS and Linux. A feature that works on one OS only is not done.
- Tests use Vitest and never touch the network. Inject `fetch` and fail on any request without a route.
- One core, many front doors: a CLI, an MCP server and a library API call one `execute()`, and a test proves they agree.
- Features register by existing: a generated index or a directory scan, never a hand-edited shared list. Parallel PRs then never conflict on one file.
- Code that parses input or reads files gets a table of hostile inputs as tests in the same PR: empty, huge, invalid encoding, unreadable, one bad line among good ones.
- Output for agents is one JSON envelope per command: `{ ok, data, error, meta }`. Errors carry a code and a fix.

## Static sites

- Astro on GitHub Pages. Docs pages render from one source, not hand-copied prose.
- Mobile first from 320px: 16px gutter, no sideways scroll, 44px tap targets, `min-width: 0` on flex and grid children.
- Light and dark from `prefers-color-scheme`, overridable with `data-theme`. Define colors as tokens.
- Respect `prefers-reduced-motion`.
- At most two type families. Cards in a grid share a height. Never tilt anything clickable.
- Images ship as AVIF or WebP with a fallback (the `web-optimize` skill). Decorative art is a transparent cutout.
- Accessibility target is WCAG 2.2 AA with zero axe violations on the main themes (the `accessibility` skill).
- Visual design (type, color, layout, motion, imagery, critique) follows the `design` skill.
- Status labels are honest: "alpha", "planned" and "verified" mean what they say.

## Public endpoints

Anything public that takes input gets abuse controls: Turnstile or similar, a rate limit, a daily cap on anything that costs money or runs an agent, and redaction before the input reaches a public issue.
