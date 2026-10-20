# Accessibility in CI

## GitHub Actions: audit a built preview

Build the site, serve the built output, run the audit, upload the report, and fail on serious or critical violations in strict themes. The script is copied into the repo (for example `scripts/a11y/axe_audit.mjs`) so CI doesn't depend on the plugin being installed; its dependencies still install into the runner's temp folder, not into `package.json`.

```yaml
name: accessibility
on: [pull_request]
permissions:
  contents: read
jobs:
  axe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      # Any static server works; this one serves dist/ on 4173. For Vite: `npx vite preview --port 4173 --strictPort`.
      - name: Serve the build
        run: |
          npx --yes http-server@14.1.1 dist -p 4173 -s &
          npx --yes wait-on@8.0.3 http://127.0.0.1:4173/
      - name: Install Chromium
        run: npx --yes playwright@1.64.1 install --with-deps chromium
      - name: axe
        run: >
          node scripts/a11y/axe_audit.mjs
          --config a11y.config.json
          --allowlist a11y-allowlist.json
          --fail-on serious
          --out a11y-report
      - name: Report in the job summary
        if: always()
        run: cat a11y-report/report.md >> "$GITHUB_STEP_SUMMARY"
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: a11y-report
          path: a11y-report/
```

- `a11y.config.json` holds the URLs (pointing at `http://127.0.0.1:4173`), and the themes with their severities. Keep the default viewports, or at least one mobile and one desktop width.
- Pin the action versions to commit SHAs if the repo does that for its other workflows.
- Exit `3` (the page didn't load) fails the job, as it should: an audit that didn't run is not a pass.
- Start at `--fail-on critical` on a codebase with a backlog, and tighten to `serious` once it's clean. Allowlist entries need a reason and should name an owner or ticket.

## vitest with jsdom

`axe-core` runs in jsdom, and a component test is a cheap way to keep names, labels, roles and ARIA attributes right:

```ts
import axe from 'axe-core';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';

test('settings form has no axe violations', async () => {
  const { container } = render(<SettingsForm />);
  const results = await axe.run(container, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    rules: { 'color-contrast': { enabled: false } }, // jsdom has no layout or computed colors
  });
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
});
```

jsdom does no layout and no real CSS cascade, so it **cannot check** contrast, target size, reflow, overlap, visibility at a breakpoint, or anything that depends on a theme's stylesheet. Those need real Chromium: keep the Playwright run above in CI as well, not instead. Adding `axe-core` as a dev dependency is the user's call; ask before adding it.
