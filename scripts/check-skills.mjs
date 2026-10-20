#!/usr/bin/env node
// Repo policy for skills and manifests, on top of the official checks.
// skills-ref validates the Agent Skills spec and `claude plugin validate --strict`
// validates Claude Code's manifests. This script holds the house rules neither
// knows about: short frontmatter, every plugin listed, links that resolve.
// Usage: node scripts/check-skills.mjs [--base <git-ref>]
// Every rule below was once a review comment. This file is where they retire.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const MAX_DESCRIPTION = 200;
const MAX_SKILL_LINES = 500;
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+$/;

const errors = [];
const fail = (file, message) => errors.push(`${relative(root, file).split(sep).join('/')}: ${message}`);
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const dirs = (dir) => (existsSync(dir) ? readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory()) : []);

// Frontmatter is held to a strict subset of YAML: exactly `name` and `description`,
// one line each, unquoted. skills-ref parses the YAML itself; this keeps it short.
function checkFrontmatter(file, skillDir) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return fail(file, 'must start with a `---` frontmatter block on line 1');
  const lines = match[1].split('\n');
  const keys = lines.map((l) => /^([A-Za-z_-]+):/.exec(l)?.[1]);
  if (lines.length !== 2 || keys[0] !== 'name' || keys[1] !== 'description') {
    fail(file, `frontmatter must be exactly two lines, \`name\` then \`description\` (found: ${keys.map((k) => k ?? '?').join(', ')})`);
  }
  const value = (key) => lines.find((l) => l.startsWith(`${key}:`))?.slice(key.length + 1).trim() ?? '';
  const name = value('name');
  const description = value('description');
  if (name !== skillDir) fail(file, `name \`${name}\` must equal the folder name \`${skillDir}\``);
  if (!NAME.test(name) || name.length > 64) fail(file, `name \`${name}\` must be lowercase letters, digits and single hyphens, 64 chars max`);
  if (!description) fail(file, 'description is empty');
  if (description.length > MAX_DESCRIPTION) fail(file, `description is ${description.length} chars; keep it to ${MAX_DESCRIPTION}`);
  if (/^["'|>]/.test(description)) fail(file, 'description must be a plain one-line value, not quoted or a block scalar');
  if (/: |\s#/.test(description)) fail(file, 'description contains `: ` or ` #`, which YAML reads as a mapping or a comment; reword it');
  if (/—|–/.test(description)) fail(file, 'description contains an em or en dash; use a comma, colon or new sentence');

  const body = text.slice(match[0].length);
  const total = text.split('\n').length;
  if (total > MAX_SKILL_LINES) fail(file, `${total} lines; move detail into references/ (limit ${MAX_SKILL_LINES})`);
  for (const [, target] of body.matchAll(/\]\(((?!https?:|#|mailto:)[^)\s]+)\)/g)) {
    if (!existsSync(join(dirname(file), target.split('#')[0]))) fail(file, `link target not found: ${target}`);
  }
  for (const [, target] of body.matchAll(/`((?:\.\.\/)*(?:references|scripts|examples|assets|voice)\/[^`\s]+\.\w+)`/g)) {
    if (!existsSync(join(dirname(file), target))) fail(file, `referenced file not found: ${target}`);
  }
  return name;
}

const marketplaceFile = join(root, '.claude-plugin', 'marketplace.json');
const marketplace = readJson(marketplaceFile);
const listed = new Map(marketplace.plugins.map((p) => [p.name, p]));

for (const plugin of dirs(join(root, 'plugins'))) {
  const pluginDir = join(root, 'plugins', plugin);
  const manifestFile = join(pluginDir, '.claude-plugin', 'plugin.json');
  if (!existsSync(manifestFile)) { fail(pluginDir, 'missing .claude-plugin/plugin.json'); continue; }
  const manifest = readJson(manifestFile);
  if (manifest.name !== plugin) fail(manifestFile, `name \`${manifest.name}\` must equal the folder name \`${plugin}\``);
  if (!SEMVER.test(manifest.version ?? '')) fail(manifestFile, `version \`${manifest.version}\` must be x.y.z`);
  const entry = listed.get(plugin);
  if (!entry) fail(marketplaceFile, `plugin \`${plugin}\` is not listed`);
  else if (entry.source !== `./plugins/${plugin}`) fail(marketplaceFile, `plugin \`${plugin}\` source must be ./plugins/${plugin}`);
  listed.delete(plugin);

  for (const skill of dirs(join(pluginDir, 'skills'))) {
    const skillFile = join(pluginDir, 'skills', skill, 'SKILL.md');
    if (!existsSync(skillFile)) { fail(join(pluginDir, 'skills', skill), 'missing SKILL.md'); continue; }
    checkFrontmatter(skillFile, skill);
    const evalsFile = join(pluginDir, 'skills', skill, 'evals', 'evals.json');
    if (existsSync(evalsFile) && readJson(evalsFile).skill_name !== `${plugin}:${skill}`) {
      fail(evalsFile, `skill_name must be \`${plugin}:${skill}\``);
    }
  }
}
for (const name of listed.keys()) fail(marketplaceFile, `lists \`${name}\`, which has no folder under plugins/`);

// A plugin whose files changed must bump its version, or installs never update.
const baseIndex = process.argv.indexOf('--base');
if (baseIndex > 0) {
  const base = process.argv[baseIndex + 1];
  const changed = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { cwd: root, encoding: 'utf8' }).split('\n');
  for (const plugin of new Set(changed.map((f) => /^plugins\/([^/]+)\//.exec(f)?.[1]).filter(Boolean))) {
    const manifestPath = `plugins/${plugin}/.claude-plugin/plugin.json`;
    if (!existsSync(join(root, manifestPath))) continue;
    let before = null;
    try { before = JSON.parse(execFileSync('git', ['show', `${base}:${manifestPath}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).version; } catch { /* new plugin */ }
    const after = readJson(join(root, manifestPath)).version;
    if (before && before === after) fail(join(root, manifestPath), `files changed but version is still ${after}; bump it`);
  }
}

if (errors.length) {
  console.error(`${errors.length} problem(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log('Skills and manifests follow the repo policy.');
