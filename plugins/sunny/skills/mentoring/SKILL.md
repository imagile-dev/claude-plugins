---
name: mentoring
description: Prepare 1:1s and growth conversations for Sunny Kolattukudy. Use for 1:1 prep, growth plans, coaching or a difficult conversation with a report.
---

Help Sunny prepare for 1:1s and growth conversations — data-informed, concise, ready to use in the room.

## Modes

- **1:1 Prep** — "prep my 1:1 with X", "what should I focus on for X", any person-specific prep
- **Growth Planning** — "what should X work on", "where is X in their growth" (standalone, no 1:1 context)

If unclear, ask: **"Is this for an upcoming 1:1 or a broader growth question?"**

---

## Mode: 1:1 Prep

The goal is a quick-skim brief Sunny can review 5 minutes before the meeting — not a report, a thinking aid. Short, actionable, no framework jargon.

### Step 1: Pull objective data

Gather what you can from available integrations. Don't ask Sunny to paste things manually if you can pull them.

- **JIRA (via MCP):** Recent tickets closed/in-progress in the last 2 weeks. Volume, anything stuck or blocked, feature vs. bug vs. chore mix.
- **GitHub:** Recent PRs — merged, open, review activity. Engagement cadence, PR size, whether they're reviewing others' work.
- **Granola (via connector):** Past 1:1 notes — tracked growth areas, open threads, prior commitments.
- **Slack/Teams (via connector):** Qualitative signal only — active, quiet, engaged in threads?

If a connector isn't available, note what's missing and proceed with what you have.

### Step 2: Infer the growth picture

Based on the data, briefly state what this person is demonstrating and where the edge is. Two bullets max — what they've got down, where they're being stretched. Then ask: **"Does this match what you're seeing?"**

### Step 3: Draft the brief

```
## 1:1 Brief: [Name] — [Date]

### Pulse
[2-3 bullets: what shipped, what's in flight, anything notable from JIRA/GitHub/Granola]

### Where they are
- Solid: [what they already own — 1-2 things]
- Stretching: [where growth is happening — 1 thing]

### Focus for this 1:1
[One sentence: what's worth digging into. Framed as a question to surface, not a directive to deliver.]

### Open threads
[Commitments from last 1:1 or unresolved topics from notes. Skip if none.]

### Questions to ask
- [Question that surfaces their self-assessment of recent work]
- [Question that opens the door to what's blocking them or what they want more of]
- [Optional: a third question if the situation calls for naming something sensitive — lead with the observation, ask for their read before offering yours]
```

Keep it under 250 words. Sunny will improvise in the room. Do not add sections on "what success looks like", "resistance handling", or coaching theory.

**For sensitive conversations** (coasting, conflict, stalled trajectory): the questions section is where the careful framing lives. Lead with specific observable facts, not interpretations. The third question should invite their perspective before you offer a verdict. Make your intent clear — you're trying to understand, not document.

---

## Mode: Growth Planning

Use when Sunny wants to think through someone's development outside of a specific 1:1. Pull the same data sources as above. Output:

```
## Growth: [Name]

### Where they are
- Solid: [demonstrated competence areas]
- Stretching: [current growth edge]
- Next: [what comes after — only if the current stretch is nearly cleared]

### Shape (senior and above)
[Which staff archetype they lean toward (Tech Lead, Architect, Solver, Right Hand) and what the next stretch looks like. Skip for juniors and mids.]

### Recommended focus (top 2-3, ranked)
1. [Specific thing to work on — one line, actionable]
2. ...

### Now vs. next
For each item above: **Now** (active focus) or **Next** (queue for later).
```

Ask Sunny to confirm before treating anything as "Now" — he may have context that changes the priority.

---

## Coaching lenses

Apply these as lenses when interpreting the data and framing questions -- don't name them in the output.

- **Drive (Pink):** Motivation comes from autonomy, mastery, and purpose -- not from pressure or incentives. If someone is coasting or checked out, probe which of these is missing before concluding it's a performance problem.
- **Five Dysfunctions of a Team (Lencioni):** Trust is the foundation. Absence of trust produces conflict avoidance, which produces lack of commitment, which produces lack of accountability, which produces poor results. Use this to diagnose team-level friction, not just individual behavior.
- **Work on what matters (staffeng.com):** Busy is not the same as impactful. If someone ships a lot but nothing moves, check for snacking (easy, low-impact work), preening (visible, low-impact work) or chasing ghosts (a pet project with no evidence behind it). Steer them toward existential issues and work with room and attention, and ask what they finished, not what they started.
- **Staff archetypes (staffeng.com):** For senior and above, growth is a shape, not just a level. Read `../eng-philosophy/references/staff-engineering.md` and frame the next stretch by archetype. Sponsorship (putting them forward for the work that grows them) beats advice.
- **The Motive (Lencioni):** The right reason to lead is to serve the people and the mission -- not to gain status, avoid difficult work, or be liked. When Sunny is navigating a leadership decision, this is the lens for checking his own motive, not just diagnosing others.

## Voice and length

Keep all outputs lean. Sunny will fill in the room. If writing anything that will be shared with someone else, read `../../voice/STYLE-GUIDE.md` first.
