# Node / TypeScript reference

The shape Toil proved out. Use it for CLIs, MCP servers and small React UIs.

## Layout

```
src/
  core/            → the machinery every feature uses (define*, execute, config, envelope)
  areas/<area>/    → one folder per feature or integration, self-contained
  registry.ts      → imports a generated index; adding an area never edits it by hand
  cli.ts, mcp/, api.ts → thin front doors over the same core
test/              → generic suites that cover every area with no per-area code
skills/<product>/  → the skill that ships to users, one file per area
docs/              → contracts, bounds, diagrams
```

- **Front doors are thin.** The CLI, the MCP server and the library API call the
  same core. A parity test proves they return identical results.
- **Areas register by existing.** A generated index (`areas.generated.ts`) or a
  directory scan, never a hand-edited list. Parallel PRs never conflict on it.
- **One command shape.** `<tool> <area> <resource> <action> [ids...] [--flags]`.
  One idea has one flag name in every area.

## Build and dependencies

- Current Node LTS, ESM, `tsup` for the bundle, `vitest` for tests.
- Zero runtime dependencies where the product goes into locked-down
  environments. Each dependency added is a review finding that needs a reason.
- Pin GitHub Actions to a full commit SHA at least 14 days old.

## Testing

- **No test touches the network.** A fake fetch throws on any request it has no
  route for.
- **Generic suites beat per-feature suites:** contract, parity, docs-in-sync,
  repo hygiene (no stray files, no empty files) and workflow wiring. A new area
  is covered the moment it exists.
- **Edge cases are tests, not comments.** Parsing, file IO and user input get a
  table of hostile inputs (empty, huge, invalid encoding, unreadable, malformed
  line in the middle) in the same PR that adds the code.

## Errors and output

- One structured envelope for every result: data, source, precision.
- Errors say what failed and what to do next. Nothing important hides behind
  `--debug`.
- Same behavior on Windows, macOS and Linux. CI runs all three.
