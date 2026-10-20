#!/usr/bin/env node
// Watches one PR and exits when something needs the agent: a review, an inline
// comment, a person's comment, a failing check, a merge conflict, the PR being
// ready to merge, the PR closing, or polls that keep failing. Used by the ship
// skill (imagile plugin), which runs it in the background and acts on what it prints.
// Ported from imagile-dev/toil.
//
//   node pr-watch.mjs <pr> [--interval 240] [--max-polls 15] [--once] [--fresh]
//
// What it has already reported is kept in a state file in the OS temp folder, so
// a restart never loses or repeats a review. The first run for a PR treats what's
// already there as read; --fresh starts over the same way. Failing checks and
// conflicts aren't remembered: they're reported for as long as they're true.
// --once prints the current state and exits. Output is always one JSON object.
// IMAGILE_TRUSTED_BOTS (comma-separated logins, default imagile-bot) names the
// bots whose reviews count as trusted.
// It checks on the PR every four minutes, like a cat that can't read.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Replies the agent posts end with this, so its own replies never wake it. */
export const AGENT_MARK = 'Addressed by [Claude Code]';

/**
 * Posted on the PR after each round of review fixes that pushed. Rounds are
 * counted on GitHub, not here, so a restart or another session can't reset the
 * count. The claude-pr-feedback workflow counts the same marker, so both loops
 * share one limit.
 */
export const ROUND_MARK = '<!-- claude-pr-feedback-round -->';
export const MAX_ROUNDS = 3;

/**
 * Who may steer the agent: the repository's own people and the review bot, the
 * same allowlist the review automation uses. Anyone can review a public
 * repository, so anything else is reported as `untrusted`.
 */
const TRUSTED_ASSOCIATIONS = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
const TRUSTED_BOTS = new Set((process.env.IMAGILE_TRUSTED_BOTS ?? 'imagile-bot').split(',').map((s) => s.trim()).filter(Boolean));
export const trusted = (association, login) => TRUSTED_ASSOCIATIONS.has(association) || TRUSTED_BOTS.has(login);

const FAILED = new Set(['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE']);

/** The ids a snapshot holds, as the state file stores them. */
export function idsOf(snap) {
  return {
    reviews: snap.reviews.map((r) => r.id),
    comments: snap.comments.map((c) => c.id),
    threadComments: snap.threads.map((t) => t.last?.id).filter((id) => id !== undefined),
  };
}

const short = (s) => (s ?? '').replace(/\s+/g, ' ').slice(0, 160);

/** What needs the agent in `now`, given the ids already reported in `seen`. Pure. */
export function events(now, seen) {
  const found = [];
  if (now.state !== 'OPEN') return [{ kind: now.state.toLowerCase() }];
  // The off switch, and the record that a person has taken over. Either one ends the watch.
  for (const label of ['no-auto-fix', 'needs-human']) if (now.labels.includes(label)) return [{ kind: 'stopped', label }];
  // Feedback from outside the allowlist is reported, never acted on.
  const as = (kind, item) => (item.trusted ? kind : 'untrusted');
  for (const r of now.reviews) {
    // PENDING is someone's unsubmitted draft. DISMISSED is a review withdrawn
    // since, usually the review bot clearing its own last round when it starts
    // a new one, so it asks for nothing. A COMMENTED review with no body is
    // the wrapper for inline comments, which are reported from their threads.
    if (seen.reviews.includes(r.id) || r.state === 'PENDING' || r.state === 'DISMISSED' || (r.state === 'COMMENTED' && !r.body)) continue;
    found.push({ kind: as('review', r), of: 'review', id: r.id, state: r.state, author: r.author, commit: r.commit?.slice(0, 7), summary: short(r.body) });
  }
  for (const t of now.threads) {
    // Every thread, resolved or not: GitHub doesn't reopen a thread when someone replies.
    const c = t.last;
    if (!c || seen.threadComments.includes(c.id) || c.body.includes(AGENT_MARK)) continue;
    found.push({ kind: as('inline-comment', c), of: 'inline-comment', id: c.id, thread: t.id, resolved: t.resolved, path: t.path, author: c.author, summary: short(c.body) });
  }
  for (const c of now.comments) {
    if (seen.comments.includes(c.id) || c.body.includes(AGENT_MARK) || c.body.includes(ROUND_MARK)) continue;
    found.push({ kind: as('comment', c), of: 'comment', id: c.id, author: c.author, summary: short(c.body) });
  }
  // Out of rounds: what's left needs a person, not another push. An approval
  // asks for no push, so it's how a last round ends, not a reason to stop.
  const feedback = found.filter((e) => e.kind !== 'untrusted' && e.of !== 'comment' && e.state !== 'APPROVED');
  if (feedback.length && now.rounds >= MAX_ROUNDS) found.push({ kind: 'round-limit', rounds: now.rounds });
  const failing = now.checks.filter((c) => c.failed).map((c) => c.name);
  if (failing.length) found.push({ kind: 'checks-failed', failing });
  if (now.mergeable === 'CONFLICTING') found.push({ kind: 'conflict' });
  // reviewDecision is APPROVED only where branch protection requires a review.
  // Without that rule it's null and ready never fires. With auto-merge armed,
  // GitHub merges on its own, so keep waiting for `merged` instead.
  const reviewedHead = now.reviews.some((r) => r.trusted && r.state === 'APPROVED' && r.commit === now.head);
  const open = now.threads.filter((t) => !t.resolved).length;
  if (now.reviewDecision === 'APPROVED' && reviewedHead && now.rollup === 'SUCCESS' && open === 0 && now.mergeable === 'MERGEABLE' && !now.autoMerge) {
    found.push({ kind: 'ready' });
  }
  return found;
}

function main(args) {
  const fail = (error) => {
    console.log(JSON.stringify({ error }));
    process.exit(1);
  };
  const pr = Number(args[0]);
  if (!Number.isInteger(pr) || pr <= 0) fail('usage: node pr-watch.mjs <pr> [--interval 240] [--max-polls 15] [--once] [--fresh]');
  const opt = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    if (i === -1) return fallback;
    const n = Number(args[i + 1]);
    if (!Number.isFinite(n) || n <= 0) fail(`--${name} needs a number above 0.`);
    return n;
  };
  const intervalMs = opt('interval', 240) * 1000;
  // Fifteen quiet polls is an hour: long enough for CI and a review, so silence
  // past it means something upstream stalled.
  const maxPolls = opt('max-polls', 15);

  const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  let owner, name;
  try {
    [owner, name] = gh('repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner').trim().split('/');
  } catch (err) {
    fail(`gh couldn't read the repository: ${err.message.split('\n')[0]}`);
  }

  const QUERY = `query($o:String!,$n:String!,$p:Int!){repository(owner:$o,name:$n){pullRequest(number:$p){
    state headRefOid mergeable reviewDecision autoMergeRequest{enabledAt} labels(first:50){nodes{name}}
    reviews(last:50){nodes{databaseId state body authorAssociation author{login} commit{oid}}}
    reviewThreads(last:100){nodes{id isResolved path comments(last:1){nodes{databaseId body authorAssociation author{login}}}}}
    comments(last:100){nodes{databaseId body authorAssociation author{__typename login}}}
    commits(last:1){nodes{commit{statusCheckRollup{state contexts(first:100){nodes{
      ... on CheckRun{name status conclusion} ... on StatusContext{context state}}}}}}}
  }}}`;

  function snapshot() {
    const out = gh('api', 'graphql', '-f', `query=${QUERY}`, '-F', `o=${owner}`, '-F', `n=${name}`, '-F', `p=${pr}`);
    const p = JSON.parse(out).data?.repository?.pullRequest;
    if (!p) throw new Error(`no PR #${pr} in ${owner}/${name}`);
    const rollup = p.commits.nodes[0]?.commit.statusCheckRollup;
    const checks = (rollup?.contexts.nodes ?? []).map((c) => ({
      name: c.name ?? c.context,
      done: c.status ? c.status === 'COMPLETED' : c.state !== 'PENDING',
      failed: FAILED.has(c.conclusion ?? c.state),
    }));
    return {
      state: p.state,
      head: p.headRefOid,
      mergeable: p.mergeable,
      autoMerge: Boolean(p.autoMergeRequest),
      reviewDecision: p.reviewDecision,
      reviews: p.reviews.nodes.map((r) => ({ id: r.databaseId, state: r.state, body: r.body, author: r.author?.login, trusted: trusted(r.authorAssociation, r.author?.login), commit: r.commit?.oid })),
      threads: p.reviewThreads.nodes.map((t) => {
        const c = t.comments.nodes[0];
        return { id: t.id, resolved: t.isResolved, path: t.path, last: c && { id: c.databaseId, body: c.body, author: c.author?.login, trusted: trusted(c.authorAssociation, c.author?.login) } };
      }),
      // Only people's comments. Bots' feedback arrives as formal reviews, and the
      // review bot's progress comment is edited in place while it works.
      comments: p.comments.nodes.filter((c) => c.author?.__typename !== 'Bot').map((c) => ({ id: c.databaseId, body: c.body, author: c.author?.login, trusted: trusted(c.authorAssociation, c.author?.login) })),
      labels: p.labels.nodes.map((l) => l.name),
      rounds: p.comments.nodes.filter((c) => c.body.includes(ROUND_MARK)).length,
      rollup: rollup?.state ?? 'NONE',
      checks,
    };
  }

  const stateFile = join(tmpdir(), `imagile-pr-watch-${owner}-${name}-${pr}.json`);
  const load = () => {
    try {
      return JSON.parse(readFileSync(stateFile, 'utf8'));
    } catch {
      return undefined;
    }
  };
  const save = (seen) => writeFileSync(stateFile, JSON.stringify(seen));
  const remember = (seen, found) => {
    for (const e of found) {
      if (e.of === 'review') seen.reviews.push(e.id);
      if (e.of === 'inline-comment') seen.threadComments.push(e.id);
      if (e.of === 'comment') seen.comments.push(e.id);
    }
    save(seen);
  };

  function report(now, found) {
    console.log(JSON.stringify({
      pr, head: now.head.slice(0, 7), state: now.state, mergeable: now.mergeable, reviewDecision: now.reviewDecision, autoMerge: now.autoMerge,
      rollup: now.rollup, labels: now.labels, rounds: `${now.rounds} of ${MAX_ROUNDS}`,
      failingChecks: now.checks.filter((c) => c.failed).map((c) => c.name),
      pendingChecks: now.checks.filter((c) => !c.done).map((c) => c.name),
      unresolvedThreads: now.threads.filter((t) => !t.resolved).length,
      events: found,
    }, null, 2));
  }

  let first;
  try {
    first = snapshot();
  } catch (err) {
    fail(`couldn't read the PR: ${err.message.split('\n')[0]}`);
  }
  let seen = args.includes('--fresh') || !existsSync(stateFile) ? undefined : load();
  if (!seen) {
    seen = idsOf(first);
    save(seen);
  }
  if (args.includes('--once')) {
    report(first, events(first, seen));
    return;
  }

  let failures = 0;
  let polls = 0;
  const poll = () => {
    polls += 1;
    if (polls > maxPolls) {
      report(first, [{ kind: 'stalled', polls: maxPolls, minutes: Math.round((maxPolls * intervalMs) / 60_000) }]);
      return;
    }
    let now;
    try {
      now = snapshot();
      failures = 0;
    } catch (err) {
      // Once or twice is a blip. Three in a row is a broken login or network, and
      // waiting out the poll limit would report an hour of failure as an hour of quiet.
      failures += 1;
      if (failures >= 3) {
        console.log(JSON.stringify({ pr, events: [{ kind: 'poll-failing', error: err.message.split('\n')[0] }] }, null, 2));
        return;
      }
      setTimeout(poll, intervalMs);
      return;
    }
    first = now;
    const found = events(now, seen);
    if (found.length) {
      remember(seen, found);
      report(now, found);
      return;
    }
    setTimeout(poll, intervalMs);
  };
  setTimeout(poll, intervalMs);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
