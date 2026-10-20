#!/usr/bin/env node
/**
 * Audit pages for accessibility with Deque's axe-core, in real Chromium through Playwright.
 *
 * Runs every URL at every viewport, color scheme and theme, writes axe-results.json
 * plus a Markdown report grouped by rule, and exits non-zero on violations at or
 * above --fail-on in a strict theme. Dependencies are pinned below and installed on
 * first use into a temp folder, never into the project being audited.
 *
 *   node axe_audit.mjs http://localhost:5173/ --fail-on serious
 *   node axe_audit.mjs --config a11y.json --allowlist a11y-allow.json --out reports/a11y
 *
 * Exit codes: 0 pass, 1 violations at or above --fail-on (strict themes, after the
 * allowlist), 2 bad arguments or config, 3 the audit could not run (dependency
 * install, browser launch, or a page in a strict theme failed to load).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

// Exact pins. Bump all three together; @axe-core/playwright depends on axe-core ~4.14.x.
const DEPS = { 'axe-core': '4.14.0', '@axe-core/playwright': '4.14.0', playwright: '1.64.1' };

const DEFAULT_VIEWPORTS = ['375x812', '768x1024', '1440x900'];
const DEFAULT_SCHEMES = ['light', 'dark'];
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const IMPACTS = ['critical', 'serious', 'moderate', 'minor'];
const RANK = { minor: 1, moderate: 2, serious: 3, critical: 4 };

class UsageError extends Error {}

// ---------------------------------------------------------------- arguments

function parse(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      config: { type: 'string' },
      viewports: { type: 'string' },
      schemes: { type: 'string' },
      'best-practice': { type: 'boolean' },
      tags: { type: 'string' },
      'disable-rules': { type: 'string' },
      include: { type: 'string', multiple: true },
      exclude: { type: 'string', multiple: true },
      setup: { type: 'string' },
      theme: { type: 'string', multiple: true },
      allowlist: { type: 'string' },
      'fail-on': { type: 'string' },
      out: { type: 'string' },
      'wait-until': { type: 'string' },
      settle: { type: 'string' },
      timeout: { type: 'string' },
      channel: { type: 'string' },
      'reduced-motion': { type: 'string' },
      headed: { type: 'boolean' },
      'max-examples': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''));
    console.log(`Flags: --config FILE  --viewports 375x812,1440x900  --schemes light,dark
       --best-practice  --tags a,b  --disable-rules a,b  --include SEL  --exclude SEL
       --setup JSON  --theme NAME (only run these themes from the config)
       --allowlist FILE  --fail-on minor|moderate|serious|critical  --out DIR
       --wait-until load|domcontentloaded|networkidle  --settle MS  --timeout MS
       --reduced-motion reduce|no-preference  --channel chrome|msedge  --headed  --max-examples N
Setup steps (JSON array, in --setup, a config "setup", or a theme's "setup"), one key each:
  {"query":{"theme":"dark"}}  {"localStorage":{"k":"v"}}  {"sessionStorage":{"k":"v"}}
  {"attribute":{"selector":"html","name":"data-theme","value":"dark"}}  {"click":"#theme-toggle"}
  {"select":{"selector":"#theme","value":"dark"}}  {"waitFor":"main"}  {"wait":300}
  {"scroll":"bottom"}  {"eval":"document.body.classList.add('x')"}  {"reload":true}`);
    process.exit(0);
  }

  let cfg = {};
  if (values.config) cfg = readJson(values.config, 'config');
  const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const urls = positionals.length ? positionals : cfg.urls ?? [];
  if (!urls.length) throw new UsageError('No URLs. Pass them as arguments or as "urls" in --config.');
  for (const u of urls) {
    try { new URL(u); } catch { throw new UsageError(`Not a URL: ${u} (include the scheme, e.g. http://localhost:5173/)`); }
  }

  const viewports = (values.viewports ? list(values.viewports) : cfg.viewports ?? DEFAULT_VIEWPORTS).map((v) => {
    const m = /^(\d+)x(\d+)$/.exec(String(v));
    if (!m) throw new UsageError(`Viewport "${v}" is not WIDTHxHEIGHT`);
    return { width: +m[1], height: +m[2], label: `${m[1]}x${m[2]}` };
  });

  if (!viewports.some((v) => v.width < 768) || !viewports.some((v) => v.width >= 1024)) {
    console.error('axe_audit: warning: the viewports do not cover both mobile (under 768px wide) and desktop (1024px and up). Test both.');
  }

  const schemes = values.schemes ? list(values.schemes) : cfg.schemes ?? DEFAULT_SCHEMES;
  for (const s of schemes) if (!['light', 'dark', 'no-preference'].includes(s)) throw new UsageError(`Scheme "${s}" must be light, dark or no-preference`);

  const bestPractice = values['best-practice'] ?? cfg.bestPractice ?? false;
  const tags = values.tags ? list(values.tags) : cfg.tags ?? [...WCAG_TAGS, ...(bestPractice ? ['best-practice'] : [])];

  const failOn = values['fail-on'] ?? cfg.failOn ?? null;
  if (failOn && !RANK[failOn]) throw new UsageError(`--fail-on must be one of ${IMPACTS.join(', ')}`);

  const globalSetup = values.setup ? parseJsonArg(values.setup, '--setup') : cfg.setup ?? [];
  let themes = (cfg.themes ?? [{ name: 'default', severity: 'strict' }]).map(normalizeTheme);
  if (values.theme?.length) {
    const unknown = values.theme.filter((t) => !themes.some((x) => x.name === t));
    if (unknown.length) throw new UsageError(`--theme ${unknown.join(', ')} not in config (have: ${themes.map((t) => t.name).join(', ')})`);
    themes = themes.filter((t) => values.theme.includes(t.name));
  }
  for (const s of [globalSetup, ...themes.map((t) => t.setup)]) validateSteps(s);

  const allowlistFile = values.allowlist ?? cfg.allowlist;
  const allowlist = allowlistFile ? loadAllowlist(allowlistFile) : [];

  const waitUntil = values['wait-until'] ?? cfg.waitUntil ?? 'load';
  if (!['load', 'domcontentloaded', 'networkidle'].includes(waitUntil)) throw new UsageError('--wait-until must be load, domcontentloaded or networkidle');

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(2, 13);
  return {
    urls, viewports, schemes, tags, failOn, globalSetup, themes, allowlist, waitUntil,
    disableRules: values['disable-rules'] ? list(values['disable-rules']) : cfg.disableRules ?? [],
    include: values.include ?? cfg.include ?? [],
    exclude: values.exclude ?? cfg.exclude ?? [],
    out: path.resolve(values.out ?? cfg.out ?? path.join('.claude', 'accessibility', stamp)),
    settle: num(values.settle ?? cfg.settle ?? 500, '--settle'),
    timeout: num(values.timeout ?? cfg.timeout ?? 30000, '--timeout'),
    channel: values.channel ?? cfg.channel,
    reducedMotion: reducedMotion(values['reduced-motion'] ?? cfg.reducedMotion ?? 'no-preference'),
    headed: values.headed ?? false,
    maxExamples: num(values['max-examples'] ?? cfg.maxExamples ?? 3, '--max-examples'),
  };
}

function reducedMotion(v) {
  if (!['reduce', 'no-preference'].includes(v)) throw new UsageError('--reduced-motion must be reduce or no-preference');
  return v;
}

function num(v, flag) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new UsageError(`${flag} must be a non-negative number`);
  return n;
}

function readJson(file, what) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch (e) { throw new UsageError(`Cannot read ${what} ${file}: ${e.message}`); }
}

function parseJsonArg(s, flag) {
  try { return JSON.parse(s); } catch (e) { throw new UsageError(`${flag} is not valid JSON: ${e.message}`); }
}

function normalizeTheme(t) {
  if (!t || typeof t.name !== 'string') throw new UsageError('Each theme needs a "name"');
  const severity = t.severity ?? 'strict';
  if (!['strict', 'report'].includes(severity)) throw new UsageError(`Theme ${t.name}: severity must be "strict" or "report"`);
  const schemes = t.schemes ?? (t.scheme ? [t.scheme] : null);
  return { name: t.name, severity, schemes, setup: t.setup ?? [] };
}

const STEP_KINDS = ['localStorage', 'sessionStorage', 'query', 'attribute', 'click', 'select', 'waitFor', 'wait', 'scroll', 'eval', 'reload'];

function validateSteps(steps) {
  if (!Array.isArray(steps)) throw new UsageError('setup must be an array of steps');
  for (const s of steps) {
    const keys = Object.keys(s ?? {});
    if (keys.length !== 1 || !STEP_KINDS.includes(keys[0])) {
      throw new UsageError(`Setup step ${JSON.stringify(s)} must have exactly one of: ${STEP_KINDS.join(', ')}`);
    }
  }
}

function loadAllowlist(file) {
  const raw = readJson(file, 'allowlist');
  const entries = Array.isArray(raw) ? raw : raw.entries;
  if (!Array.isArray(entries)) throw new UsageError(`Allowlist ${file} must be an array (or {"entries": [...]})`);
  return entries.map((e, i) => {
    if (!e.rule) throw new UsageError(`Allowlist entry ${i} has no "rule"`);
    if (!e.reason || !String(e.reason).trim()) throw new UsageError(`Allowlist entry ${i} (${e.rule}) has no "reason". Every exception says why.`);
    return { ...e, hits: 0 };
  });
}

// ---------------------------------------------------------------- dependencies

function loadDeps() {
  const key = Object.entries(DEPS).map(([n, v]) => `${n.replace(/[@/]/g, '')}-${v}`).join('_');
  const dir = process.env.AXE_AUDIT_DEPS_DIR || path.join(os.tmpdir(), 'imagile-axe-audit', key);
  const marker = path.join(dir, 'node_modules', '@axe-core', 'playwright', 'package.json');
  if (!existsSync(marker)) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ private: true, name: 'axe-audit-deps' }));
    console.error(`Installing ${Object.entries(DEPS).map(([n, v]) => `${n}@${v}`).join(' ')} into ${dir} (first run only)`);
    // One fixed command string (no user input in it); a shell is needed to find npm.cmd on Windows.
    const cmd = `npm install --no-audit --no-fund --save-exact ${Object.entries(DEPS).map(([n, v]) => `${n}@${v}`).join(' ')}`;
    const r = spawnSync(cmd, { cwd: dir, stdio: ['ignore', 'inherit', 'inherit'], shell: true });
    if (r.status !== 0 || !existsSync(marker)) throw new Error(`npm install failed in ${dir}. Is npm on PATH and the registry reachable?`);
  }
  const req = createRequire(path.join(dir, 'package.json'));
  return { dir, playwright: req('playwright'), AxeBuilder: req('@axe-core/playwright').default ?? req('@axe-core/playwright').AxeBuilder };
}

async function launch(deps, opts) {
  const go = () => deps.playwright.chromium.launch({ headless: !opts.headed, channel: opts.channel });
  try {
    return await go();
  } catch (e) {
    if (opts.channel || !/Executable doesn't exist|playwright install/i.test(e.message)) throw e;
    console.error('Chromium for this Playwright version is missing; installing it (first run only).');
    const cli = path.join(deps.dir, 'node_modules', 'playwright', 'cli.js');
    const r = spawnSync(process.execPath, [cli, 'install', 'chromium'], { stdio: ['ignore', 'inherit', 'inherit'] });
    if (r.status !== 0) throw new Error('playwright install chromium failed. Or pass --channel chrome to use an installed Chrome.');
    return go();
  }
}

// ---------------------------------------------------------------- running

function withQuery(url, steps) {
  const u = new URL(url);
  for (const s of steps) if (s.query) for (const [k, v] of Object.entries(s.query)) u.searchParams.set(k, String(v));
  return u.toString();
}

async function prepareContext(context, steps) {
  const storage = { localStorage: {}, sessionStorage: {} };
  for (const s of steps) {
    for (const kind of ['localStorage', 'sessionStorage']) {
      if (s[kind]) for (const [k, v] of Object.entries(s[kind])) storage[kind][k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
  }
  if (Object.keys(storage.localStorage).length || Object.keys(storage.sessionStorage).length) {
    await context.addInitScript((st) => {
      try {
        for (const [k, v] of Object.entries(st.localStorage)) localStorage.setItem(k, v);
        for (const [k, v] of Object.entries(st.sessionStorage)) sessionStorage.setItem(k, v);
      } catch { /* storage refused (opaque origin); the step is a no-op */ }
    }, storage);
  }
}

async function runSteps(page, steps, opts) {
  for (const s of steps) {
    if (s.attribute) {
      const { selector = 'html', name, value } = s.attribute;
      await page.locator(selector).first().evaluate((el, [n, v]) => (v === null ? el.removeAttribute(n) : el.setAttribute(n, v)), [name, value ?? '']);
    } else if (s.click) {
      await page.locator(typeof s.click === 'string' ? s.click : s.click.selector).first().click({ timeout: opts.timeout });
    } else if (s.select) {
      await page.locator(s.select.selector).first().selectOption(s.select.value, { timeout: opts.timeout });
    } else if (s.waitFor) {
      await page.locator(s.waitFor).first().waitFor({ timeout: opts.timeout });
    } else if (s.wait) {
      await page.waitForTimeout(Number(s.wait));
    } else if (s.scroll) {
      // Walk down a viewport at a time so scroll-triggered reveals fire, then return to the top.
      await page.evaluate(async () => {
        const step = Math.max(200, Math.floor(innerHeight * 0.8));
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
    } else if (s.eval) {
      await page.evaluate(s.eval);
    } else if (s.reload) {
      await page.reload({ waitUntil: opts.waitUntil, timeout: opts.timeout });
    }
  }
}

function slim(nodes) {
  return nodes.map((n) => ({
    target: n.target.map((t) => (Array.isArray(t) ? t.join(' >>> ') : t)).join(' '),
    html: n.html?.slice(0, 300),
    failureSummary: n.failureSummary,
  }));
}

async function auditOne(deps, browser, opts, { url, theme, scheme, viewport }) {
  const run = { url, theme: theme.name, severity: theme.severity, scheme, viewport: viewport.label };
  const steps = [...opts.globalSetup, ...theme.setup];
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: scheme, reducedMotion: opts.reducedMotion });
  try {
    await prepareContext(context, steps);
    const page = await context.newPage();
    await page.goto(withQuery(url, steps), { waitUntil: opts.waitUntil, timeout: opts.timeout });
    await runSteps(page, steps, opts);
    await page.evaluate(() => document.fonts?.ready);
    if (opts.settle) await page.waitForTimeout(opts.settle);

    let builder = new deps.AxeBuilder({ page }).withTags(opts.tags);
    if (opts.disableRules.length) builder = builder.disableRules(opts.disableRules);
    for (const sel of opts.include) builder = builder.include(sel);
    for (const sel of opts.exclude) builder = builder.exclude(sel);
    const res = await builder.analyze();

    run.engine = res.testEngine?.version;
    run.passes = res.passes.length;
    run.violations = res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, tags: v.tags, nodes: slim(v.nodes) }));
    run.incomplete = res.incomplete.map((v) => ({ id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, nodes: slim(v.nodes) }));
  } catch (e) {
    run.error = e.message.split('\n')[0];
  } finally {
    await context.close();
  }
  return run;
}

function applyAllowlist(runs, allowlist) {
  for (const run of runs) {
    run.allowed = [];
    for (const v of run.violations ?? []) {
      const keep = [];
      for (const node of v.nodes) {
        const entry = allowlist.find((e) => e.rule === v.id
          && (!e.target || node.target.includes(e.target))
          && (!e.html || (node.html ?? '').includes(e.html))
          && (!e.url || run.url.includes(e.url))
          && (!e.theme || e.theme === run.theme));
        if (entry) {
          entry.hits++;
          run.allowed.push({ id: v.id, impact: v.impact, target: node.target, reason: entry.reason });
        } else keep.push(node);
      }
      v.nodes = keep;
    }
    if (run.violations) run.violations = run.violations.filter((v) => v.nodes.length);
  }
}

// ---------------------------------------------------------------- reporting

function firstReason(summary) {
  return (summary ?? '').split('\n').map((l) => l.trim()).filter((l) => l && !/^Fix (any|all) of the following:$/.test(l))[0] ?? '';
}

const runLabel = (r) => `${r.theme === 'default' ? '' : `${r.theme} `}${r.scheme} ${r.viewport}`;
const md = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function summarize(runs, opts) {
  const byTheme = new Map();
  for (const r of runs) {
    const t = byTheme.get(r.theme) ?? { severity: r.severity, runs: 0, errors: 0, counts: { critical: 0, serious: 0, moderate: 0, minor: 0 }, review: 0, allowed: 0, failing: 0 };
    t.runs++;
    if (r.error) t.errors++;
    for (const v of r.violations ?? []) {
      const impact = v.impact ?? 'minor';
      t.counts[impact] += v.nodes.length;
      if (opts.failOn && RANK[impact] >= RANK[opts.failOn]) t.failing += v.nodes.length;
    }
    t.review += (r.incomplete ?? []).reduce((n, v) => n + v.nodes.length, 0);
    t.allowed += r.allowed?.length ?? 0;
    byTheme.set(r.theme, t);
  }
  return byTheme;
}

function groupRules(runs, key) {
  const rules = new Map();
  for (const r of runs) {
    for (const v of r[key] ?? []) {
      const g = rules.get(v.id) ?? { id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, nodes: 0, targets: new Map(), where: new Map(), themes: new Set(), reasons: new Map(), perTheme: new Map() };
      if (RANK[v.impact] > RANK[g.impact] || !g.impact) g.impact = v.impact;
      g.nodes += v.nodes.length;
      g.themes.add(r.theme);
      g.perTheme.set(r.theme, (g.perTheme.get(r.theme) ?? 0) + v.nodes.length);
      for (const n of v.nodes) { const why = firstReason(n.failureSummary).replace(/[\d.]+/g, 'N'); if (why) g.reasons.set(why, (g.reasons.get(why) ?? 0) + 1); }
      const w = `${new URL(r.url).pathname}${new URL(r.url).hash} @ ${runLabel(r)}${r.severity === 'report' ? ' (report-only)' : ''}`;
      g.where.set(w, (g.where.get(w) ?? 0) + v.nodes.length);
      for (const n of v.nodes) if (!g.targets.has(n.target)) g.targets.set(n.target, n.failureSummary);
      rules.set(v.id, g);
    }
  }
  return [...rules.values()].sort((a, b) => (RANK[b.impact] ?? 0) - (RANK[a.impact] ?? 0) || b.nodes - a.nodes);
}

function renderMarkdown(runs, opts, byTheme, verdict) {
  const engine = runs.find((r) => r.engine)?.engine ?? DEPS['axe-core'];
  const L = [];
  L.push(`# Accessibility audit`, '');
  L.push(`- **Result:** ${verdict.text}`);
  L.push(`- **Engine:** axe-core ${engine} via @axe-core/playwright ${DEPS['@axe-core/playwright']}, Playwright ${DEPS.playwright} (Chromium)`);
  L.push(`- **Tags:** ${opts.tags.join(', ')}`);
  L.push(`- **URLs:** ${opts.urls.map((u) => `<${u}>`).join(', ')}`);
  L.push(`- **Viewports:** ${opts.viewports.map((v) => v.label).join(', ')}`);
  L.push(`- **Fail on:** ${opts.failOn ? `${opts.failOn} or worse, strict themes only` : 'not set (report only)'}`);
  L.push(`- **Runs:** ${runs.length}`, '');
  L.push('Counts are affected elements (axe nodes), summed over every run. The same element at three viewports counts three times.', '');

  L.push('## Summary by theme', '');
  L.push('| Theme | Severity | Runs | Critical | Serious | Moderate | Minor | Needs review | Allowed | Result |');
  L.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const [name, t] of byTheme) {
    const result = t.errors ? `${t.errors} run(s) errored` : t.severity === 'report' ? 'report-only' : t.failing ? 'FAIL' : 'pass';
    L.push(`| ${name} | ${t.severity} | ${t.runs} | ${t.counts.critical} | ${t.counts.serious} | ${t.counts.moderate} | ${t.counts.minor} | ${t.review} | ${t.allowed} | ${result} |`);
  }
  L.push('');

  const violations = groupRules(runs, 'violations');
  L.push('## Violations by rule', '');
  if (!violations.length) L.push('None returned by axe for the tags above.', '');
  for (const g of violations) {
    L.push(`### ${g.id} (${g.impact}, ${g.nodes} node${g.nodes === 1 ? '' : 's'})`, '');
    L.push(`${g.help}. [Rule help](${g.helpUrl})`, '');
    L.push(`Themes: ${[...g.themes].join(', ')}`, '');
    L.push('Example selectors:', '');
    for (const [target, summary] of [...g.targets].slice(0, opts.maxExamples)) {
      const first = firstReason(summary);
      L.push(`- \`${target}\`${first ? `: ${first}` : ''}`);
    }
    if (g.targets.size > opts.maxExamples) L.push(`- ...and ${g.targets.size - opts.maxExamples} more distinct selector(s) in axe-results.json`);
    L.push('', '<details><summary>Where</summary>', '');
    for (const [w, n] of g.where) L.push(`- ${w}: ${n}`);
    L.push('', '</details>', '');
  }

  const incomplete = groupRules(runs, 'incomplete');
  L.push('## Needs manual review (axe "incomplete")', '');
  L.push('axe could not decide these, commonly contrast over images, gradients or overlapping elements. Check each by hand; they are not counted as failures.', '');
  if (!incomplete.length) L.push('None.', '');
  else {
    L.push('| Rule | Nodes | By theme | Example | Help |', '|---|---|---|---|---|');
    for (const g of incomplete) {
      L.push(`| ${g.id} | ${g.nodes} | ${[...g.perTheme].map(([t, n]) => `${t} ${n}`).join(', ')} | \`${md([...g.targets.keys()][0])}\` | [${md(g.help)}](${g.helpUrl}) |`);
    }
    L.push('', 'Why axe could not decide, most common first:', '');
    for (const g of incomplete) {
      for (const [why, n] of [...g.reasons].sort((a, b) => b[1] - a[1]).slice(0, 5)) L.push(`- ${g.id}: ${md(why)} (${n})`);
    }
    L.push('');
  }

  const allowed = runs.flatMap((r) => r.allowed ?? []);
  if (opts.allowlist.length) {
    L.push('## Allowed exceptions', '');
    if (!allowed.length) L.push('No violation matched the allowlist.', '');
    else {
      const agg = new Map();
      for (const a of allowed) { const k = `${a.id}|${a.reason}`; agg.set(k, { ...a, n: (agg.get(k)?.n ?? 0) + 1 }); }
      L.push('| Rule | Nodes | Reason |', '|---|---|---|');
      for (const a of agg.values()) L.push(`| ${a.id} | ${a.n} | ${md(a.reason)} |`);
      L.push('');
    }
    const stale = opts.allowlist.filter((e) => !e.hits);
    if (stale.length) {
      L.push('### Stale allowlist entries', '', 'These matched nothing in this run. Remove them once the exception is gone for good.', '');
      for (const e of stale) L.push(`- \`${e.rule}\`${e.target ? ` target \`${e.target}\`` : ''}${e.html ? ` html \`${e.html}\`` : ''}: ${e.reason}`);
      L.push('');
    }
  }

  const errored = runs.filter((r) => r.error);
  if (errored.length) {
    L.push('## Run errors', '');
    for (const r of errored) L.push(`- ${r.url} @ ${runLabel(r)}: ${r.error}`);
    L.push('');
  }
  L.push('axe finds roughly a third to a half of WCAG issues. Keyboard, focus, reflow, motion and screen reader checks still need a person; see the skill\'s manual checklist.', '');
  return L.join('\n');
}

// ---------------------------------------------------------------- main

async function main() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) {
    console.error(`axe_audit: Node ${process.versions.node} is too old; @axe-core/playwright ${DEPS['@axe-core/playwright']} needs Node 22.12 or later.`);
    process.exit(2);
  }
  let opts;
  try {
    opts = parse(process.argv.slice(2));
  } catch (e) {
    if (e instanceof UsageError || e.code?.startsWith?.('ERR_PARSE_ARGS')) { console.error(`axe_audit: ${e.message}`); process.exit(2); }
    throw e;
  }

  let deps, browser;
  try {
    deps = loadDeps();
    browser = await launch(deps, opts);
  } catch (e) {
    console.error(`axe_audit: ${e.message}`);
    process.exit(3);
  }

  const runs = [];
  try {
    for (const theme of opts.themes) {
      for (const scheme of theme.schemes ?? opts.schemes) {
        for (const viewport of opts.viewports) {
          for (const url of opts.urls) {
            const run = await auditOne(deps, browser, opts, { url, theme, scheme, viewport });
            const n = (run.violations ?? []).reduce((a, v) => a + v.nodes.length, 0);
            console.error(`${run.error ? 'ERROR' : n ? `${String(n).padStart(4)} ` : '   0 '} ${url} @ ${runLabel(run)}${run.error ? `: ${run.error}` : ''}`);
            runs.push(run);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  applyAllowlist(runs, opts.allowlist);
  const byTheme = summarize(runs, opts);
  const strictErrors = runs.filter((r) => r.error && r.severity === 'strict').length;
  const failing = [...byTheme.values()].filter((t) => t.severity === 'strict').reduce((n, t) => n + t.failing, 0);
  const verdict = strictErrors ? { code: 3, text: `ERROR: ${strictErrors} strict run(s) could not be audited` }
    : failing ? { code: 1, text: `FAIL: ${failing} node(s) at ${opts.failOn} or worse in strict themes` }
    : { code: 0, text: opts.failOn ? `PASS: nothing at ${opts.failOn} or worse in strict themes` : 'REPORT: no --fail-on threshold set' };

  mkdirSync(opts.out, { recursive: true });
  const json = {
    generatedAt: new Date().toISOString(),
    versions: DEPS,
    options: { ...opts, allowlist: opts.allowlist.map(({ hits, ...e }) => ({ ...e, hits })) },
    verdict,
    themes: Object.fromEntries(byTheme),
    runs,
  };
  writeFileSync(path.join(opts.out, 'axe-results.json'), JSON.stringify(json, null, 2));
  writeFileSync(path.join(opts.out, 'report.md'), renderMarkdown(runs, opts, byTheme, verdict));

  console.error('');
  for (const [name, t] of byTheme) {
    console.error(`${name.padEnd(16)} ${t.severity.padEnd(7)} critical ${t.counts.critical}  serious ${t.counts.serious}  moderate ${t.counts.moderate}  minor ${t.counts.minor}  review ${t.review}${t.allowed ? `  allowed ${t.allowed}` : ''}${t.errors ? `  errors ${t.errors}` : ''}`);
  }
  console.error(`\n${verdict.text}`);
  console.error(`Report: ${path.join(opts.out, 'report.md')}`);
  process.exit(verdict.code);
}

main().catch((e) => { console.error(`axe_audit: ${e.stack ?? e.message}`); process.exit(3); });
