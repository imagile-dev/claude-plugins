# Routes B and C

Route A, the bundled script, is the default. These two cover the cases it doesn't.

## B. Inject axe-core into a page a browser tool already has open

Use this when a browser tool is on the page already: Claude in Chrome (`mcp__claude-in-chrome__javascript_tool`), the built-in browser pane (`mcp__Claude_Browser__javascript_tool`), or a Docker MCP browser (`mcp__MCP_DOCKER__browser_evaluate`). It's the right route for a page behind a login the script can't reach, or for checking the state a user has clicked their way into. It audits one viewport and one scheme: whatever the tab is showing.

Paste this as the script (top-level `await` works in these tools):

```js
if (!window.axe) {
  await new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js';
    s.onload = ok;
    s.onerror = () => fail(new Error('axe-core blocked (CSP or network)'));
    document.head.appendChild(s);
  });
}
const r = await axe.run(document, {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
});
({
  engine: r.testEngine.version,
  violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.helpUrl, examples: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })),
  incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
})
```

- Return a summary, not `r` itself. A full axe result is hundreds of KB and floods the context.
- **CSP.** A page whose `script-src` doesn't allow the CDN refuses the script tag, and the promise rejects with "blocked". Don't fight the policy; use route A, where Playwright injects axe without going through the page's CSP.
- **Viewport and scheme.** Resize with the tool's own resize action (`resize_window`, `browser_resize`) and rerun for mobile and desktop. Dark mode needs the tool's color-scheme emulation if it has one (the built-in pane's `resize_window` takes `colorScheme`); otherwise switch the app's own theme control.
- **Themes.** Switch the theme the way a user would (the picker, or `localStorage.setItem(...)` then reload), confirm `document.documentElement.dataset.theme` or the visible styling changed, then run axe again.
- In Claude in Chrome the tab is the user's own browser, signed in as them. Audit, don't submit forms or click destructive controls to reach a state.

Report what this route returned the same way as the script's report, and say it was one viewport.

## C. `@axe-core/cli`

```bash
npx -y @axe-core/cli@4.14.0 http://localhost:5173/ --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --exit
```

It drives Chrome through Selenium, so it needs a ChromeDriver whose major version matches the installed Chrome. On most machines the first run stops with "session not created: This version of ChromeDriver only supports Chrome version N" and suggests `npx browser-driver-manager install chrome`, which installs a separate Chrome and driver into your home folder. Only do that if the user wants this route specifically; otherwise route A gets the same engine with no driver to match. `--exit` makes it exit 1 on any violation; it has no impact threshold, allowlist, viewport list or theme support.
