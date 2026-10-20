---
name: imagile:accessibility
description: Audit a web page, app or static site for accessibility against WCAG 2.2 A and AA (what the ADA and Section 508 expect) with Deque's axe-core, then guide the fixes and re-verify. Runs real Chromium through Playwright at mobile and desktop widths, in light and dark color schemes and across named themes, and writes a JSON plus Markdown report. Use when someone says accessibility, a11y, ADA, Section 508, WCAG, axe, axe-core, Deque, screen reader, NVDA, VoiceOver, color contrast, contrast ratio, alt text, aria, focus order, keyboard navigation, audit my site, is this accessible, test my themes for contrast, or asks to add an accessibility check to CI.
---

<!--
allowed-tools: Bash, Read, Glob, Grep, AskUserQuestion, mcp__claude-in-chrome__*, mcp__Claude_Browser__*, mcp__MCP_DOCKER__browser_*
-->

Find accessibility problems with axe-core, fix them, and run axe again to prove the fix. axe catches roughly a third to a half of WCAG failures, so every audit ends with the manual checklist too. Never report a finding axe did not return or that nobody checked by hand.

## Pick a route

| Route | Use it when | How |
|---|---|---|
| **A. The bundled script** (Playwright + `@axe-core/playwright`) | The default. A dev server on localhost, a built preview, a public URL, CI, any run that needs several viewports, schemes or themes | `node scripts/axe_audit.mjs ...` below |
| **B. Inject axe into an open page** | A browser tool is already on the page (Claude in Chrome, the built-in browser pane, a Docker MCP browser), the page needs a login the script doesn't have, or you want a quick check of the current state | [references/routes.md](references/routes.md) |
| **C. `@axe-core/cli`** | A one-off on a single URL when Chrome and a matching ChromeDriver are already set up | [references/routes.md](references/routes.md). It fails with a version-mismatch error on most machines; use A instead |

None of them touch the user's project. The script installs its pinned dependencies into a temp folder on first use (`<os tmp>/imagile-axe-audit/`, or `AXE_AUDIT_DEPS_DIR`), and Playwright's Chromium into its usual shared cache. Never add axe or Playwright to the project's `package.json` unless the user asks for that, for example when wiring it into their own test suite.

## Always test mobile and desktop

Layout changes what axe sees: a header that collapses to an icon at 375px loses its text label, reflow can hide or overlap content, and target sizes shrink. Run at least one width under 768px and one at 1024px or more, every time. The defaults are `375x812`, `768x1024` and `1440x900`, and the script warns when a `--viewports` list leaves out either side.

## Run the script

Needs Node 22.12 or later (what @axe-core/playwright 4.14 requires) and npm. The first run installs about 22 MB of packages and, if missing, Playwright's Chromium.

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/accessibility/scripts/axe_audit.mjs" http://localhost:5173/ http://localhost:5173/settings --fail-on serious
```

Pinned versions: **axe-core 4.14.0**, **@axe-core/playwright 4.14.0**, **Playwright 1.64.1**. Bump all three together in `DEPS` at the top of the script.

| Flag | Notes |
|---|---|
| `URL...` | One or more absolute URLs, or `urls` in `--config` |
| `--viewports` | Default `375x812,768x1024,1440x900` |
| `--schemes` | Default `light,dark`, through emulated `prefers-color-scheme` |
| `--best-practice` | Add axe's `best-practice` rules (region, landmark-one-main, heading-order...) to the WCAG tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` |
| `--tags`, `--disable-rules`, `--include`, `--exclude` | Narrow what axe checks |
| `--setup JSON` | Steps run before every audit (below) |
| `--config FILE` | Every option as JSON, plus `themes` |
| `--theme NAME` | Run only these themes from the config (repeatable) |
| `--allowlist FILE` | Known exceptions, each with a reason |
| `--fail-on LEVEL` | `critical`, `serious`, `moderate` or `minor`: exit 1 when a strict theme has anything at that level or worse |
| `--reduced-motion reduce` | Emulate `prefers-reduced-motion: reduce` |
| `--wait-until`, `--settle`, `--timeout` | Page readiness. Use `networkidle` for apps that fetch on load |
| `--out DIR` | Default `.claude/accessibility/<timestamp>/`: `axe-results.json` and `report.md` |

Exit codes: `0` pass, `1` violations at or above `--fail-on` in a strict theme, `2` bad arguments, config or allowlist, `3` the audit could not run (install, browser launch, or a strict page failed to load). A `3` is never a pass.

### Setup steps and themes

Setup steps are a JSON array with one key per step: `query` (add URL parameters), `localStorage` / `sessionStorage` (set before any page script runs), `attribute` (set `data-theme` or a class on an element), `click`, `select`, `waitFor`, `wait`, `scroll` (walk down the page so scroll-triggered reveals fire), `eval`, `reload`. `node axe_audit.mjs --help` lists the exact shapes.

To test themes, list them in the config. Each theme has a `name`, a `severity`, optionally a fixed `scheme`, and its own `setup`:

```json
{
  "urls": ["http://127.0.0.1:4173/#/", "http://127.0.0.1:4173/#/settings"],
  "failOn": "serious",
  "themes": [
    { "name": "plain-light", "severity": "strict", "scheme": "light", "setup": [{ "query": { "theme": "plain", "scheme": "light" } }] },
    { "name": "plain-dark",  "severity": "strict", "scheme": "dark",  "setup": [{ "localStorage": { "app.theme": "{\"theme\":\"plain\",\"scheme\":\"dark\"}" } }] },
    { "name": "retro",       "severity": "report", "scheme": "dark",  "setup": [{ "click": "#theme-picker" }, { "click": "text=Retro" }] }
  ]
}
```

- **`strict`** themes are the accessibility baseline. Their violations count toward `--fail-on` and their page errors exit `3`.
- **`report`** themes are decorative variants. Their findings appear in the report, in the summary table and per rule marked "report-only", but never fail the run.

Ask the user which themes are the baseline when it isn't obvious; don't guess that every theme is decorative. Prefer the app's own switch (URL parameter, storage key) over setting `data-theme` by hand, which the app's script may overwrite after load. Check a theme actually applied before trusting a clean result: a typo in a storage key audits the default theme under another name. [examples/themes.json](examples/themes.json) runs against the bundled fixture.

### Allowlist

```json
[
  { "rule": "color-contrast", "html": "class=\"brand-wordmark\"", "reason": "Logotype; WCAG 1.4.3 exempts text in logos. Owner: design, A11Y-123." },
  { "rule": "region", "url": "/embed/", "theme": "retro", "reason": "Third-party embed, tracked upstream." }
]
```

`rule` and `reason` are required. `target` (substring of axe's selector), `html` (substring of the element's HTML), `url` (substring) and `theme` (exact) narrow the match; an entry with only `rule` excuses that rule everywhere, so scope it. Allowed nodes are listed with their reason, and entries that matched nothing are reported as stale.

### Pitfalls the script can't fix for you

- **Scroll-reveal and entrance animations** leave content transparent until scrolled into view, so axe reports contrast of 1.01:1 on text nobody sees that way. Add `{"scroll":"bottom"}` to `--setup`, or run with `--reduced-motion reduce` if the site honours it. That second run is worth doing anyway: it is how many users see the page.
- **Overlays and textures** (scanlines, noise, gradients, background images) push contrast into axe's "incomplete" list rather than failing it. The report groups those by reason; check them by hand.
- **Hash-routed apps:** a query parameter is added before the `#`, which is what most apps read.

## After axe: the manual pass

Work through [references/manual-checklist.md](references/manual-checklist.md): keyboard-only walkthrough, visible focus, skip link, landmarks and headings, names, form errors, reduced motion, reflow at 320 CSS px and 400% zoom (1.4.10), text spacing (1.4.12), target size (2.5.8), contrast that axe marked incomplete, live regions, and a short NVDA or VoiceOver smoke. Say which items you checked and how; mark the rest "not checked".

## Fixing

[references/fixes.md](references/fixes.md) has minimal patterns for the common rules: color-contrast, label, button-name, link-name, image-alt, aria-* misuse, landmark-one-main, region, nested-interactive and scrollable-region-focusable. Native HTML first, ARIA only to fill a gap, and React Aria (or the framework's equivalent) for complex widgets rather than hand-rolled roles. After a fix, rerun the same command and compare counts.

## CI

[references/ci.md](references/ci.md) has a GitHub Actions job that builds, serves a preview and runs the script with `--fail-on serious`, plus a note on vitest with jsdom: fine for structure and names, blind to contrast and layout, so keep a real-Chromium run.

## Reporting back

Lead with the summary table from `report.md`, one row per theme (or one row when there are no themes), then:

1. **Top fixes**, at most five, ordered by impact then count, each naming the rule, an example selector, which themes and widths it appears at, and the fix.
2. **Needs review:** the axe "incomplete" rules and their main reason, as a count, not a list of nodes.
3. **Manual checks:** what was checked by hand and the result, and what was not checked.
4. The report path, and the exact command so the user can rerun it.

Counts are axe nodes summed over runs: one element at three widths counts three times. Say so if the number looks alarming. Don't call a page "accessible" or "compliant" from an axe pass alone; say "no axe violations at these tags, at these widths".

## Self-healing

If the script misbehaves (an axe or Playwright API change, a new rule tag, a report that miscounts), fix `scripts/axe_audit.mjs` and this SKILL.md directly, and rerun the fixture to confirm it still reports the violations its comment lists:

```bash
python -m http.server 8123 --bind 127.0.0.1 --directory "${CLAUDE_PLUGIN_ROOT}/skills/accessibility/examples" &
node "${CLAUDE_PLUGIN_ROOT}/skills/accessibility/scripts/axe_audit.mjs" --config "${CLAUDE_PLUGIN_ROOT}/skills/accessibility/examples/themes.json" --out "$(mktemp -d)"
```

Expected: exit 1, with image-alt, button-name, label and link-name in every theme and color-contrast in the two report-only neon themes only.
