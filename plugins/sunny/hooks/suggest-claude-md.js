#!/usr/bin/env node
// SessionStart hook: suggests copying plugin CLAUDE.md to ~/.claude/CLAUDE.md
// Fires on first install and again whenever the plugin's CLAUDE.md changes.

const fs = require('fs');
const path = require('path');
const os = require('os');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
const pluginData = process.env.CLAUDE_PLUGIN_DATA;

if (!pluginRoot || !pluginData) process.exit(0);

const sourcePath = path.join(pluginRoot, 'defaults', 'CLAUDE.md');
const sentinelPath = path.join(pluginData, 'CLAUDE.md.sentinel');
const globalClaudeMd = path.join(os.homedir(), '.claude', 'CLAUDE.md');

if (!fs.existsSync(sourcePath)) process.exit(0);

const sourceContent = fs.readFileSync(sourcePath, 'utf8');

// Check if sentinel matches current source
let sentinelContent = '';
if (fs.existsSync(sentinelPath)) {
  sentinelContent = fs.readFileSync(sentinelPath, 'utf8');
}

if (sentinelContent === sourceContent) process.exit(0);

// Plugin was installed or updated — surface suggestion
const isNew = sentinelContent === '';
const action = isNew ? 'installed' : 'updated';

console.log(`\n💡 sunny plugin ${action}: CLAUDE.md has ${isNew ? 'new' : 'updated'} personal defaults.`);
console.log(`   Source:      ${sourcePath}`);
console.log(`   Destination: ${globalClaudeMd}`);
console.log(`   To apply: copy or merge the plugin CLAUDE.md into ~/.claude/CLAUDE.md`);
console.log(`   Run: cp "${sourcePath}" "${globalClaudeMd}"\n`);

// Update sentinel so we don't fire again until next change
fs.mkdirSync(pluginData, { recursive: true });
fs.writeFileSync(sentinelPath, sourceContent, 'utf8');

process.exit(0);
