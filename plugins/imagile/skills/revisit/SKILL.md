---
name: imagile:revisit
description: Walk the user through the decisions agents made on their own (AGENT_DECISIONS.md) in one fast batch, so each becomes a principle, gets reversed or is accepted and deleted. Also defines how agents record those decisions. Use when someone says "revisit", "what did the agents decide", "review decisions", "go through the decision log", "AGENT_DECISIONS is getting long", or after a burst of PRs merged.
---

# Revisit

Agents don't ask about every decision. They log it and keep shipping. This skill
is the other half: the human reviews the log in batches, when it suits them.
The log only holds open decisions, so it stays short.

## Recording a decision (every agent, every skill)

Append to `AGENT_DECISIONS.md` at the repo root under `## Open`, in the same PR
as the code it affects:

```markdown
- **[What was decided, in one line.]** Optimizing for: [the quality it favors,
  and the principle it leaned on]. Gave up: [the cost]. Alternative: [the option
  not taken]. Where: `path/or/area`, #PR.
```

Log only what a reasonable maintainer might decide differently. Don't log what a
principle or rule already settled. When unsure whether to log, log.

## Running a revisit

1. Read `AGENT_DECISIONS.md` and the current CLAUDE.md principles.
2. Group the open entries by theme. Inside a group, put the ones that most
   affect users or the architecture first.
3. Present one group at a time in chat. For each entry, one line, with your
   recommendation:
   - **Keep**: accepted as is. The entry is deleted.
   - **Promote**: a pattern worth stating. Write or sharpen a principle with
     `imagile:principles` (mode 2), then delete the entry.
   - **Reverse**: file an issue (label `agent-followup`) that says what to change
     and why, then delete the entry.
   The user can answer a group in one line, e.g. "1 keep, 2 promote, 3 reverse".
4. Apply every answer in one commit: CLAUDE.md, new issues, the trimmed log.
5. When three or more entries share a root cause, say so. That is a missing
   principle, and promoting it saves the next ten entries.

## File shape

```markdown
# Agent decisions

Decisions agents made without asking. The maintainer reviews them with
`imagile:revisit`. Reviewed entries leave this file: kept ones are deleted,
promoted ones move to CLAUDE.md, reversed ones become issues.

## Open
```

Never let reviewed entries accumulate. A log nobody can read isn't a feedback loop.
