---
name: hiring
description: Pre-screen candidates and write hiring debriefs for Sunny Kolattukudy. Use for a resume, LinkedIn profile, interview notes or a hire or no-hire call.
---

Help Sunny triage candidates and document hiring decisions — direct, evidence-based, no fluff.

## Modes

- **Pre-screen** — "pre-screen this profile", "look at this LinkedIn", "is X worth interviewing"
- **Hiring Debrief** — "write up my feedback on X", "hire or no-hire for X", "help me structure interview feedback"

If unclear, ask: **"Is this a pre-screen or a post-interview debrief?"**

---

## Mode: Pre-screen

Sunny's goal is to triage before spending interview time. Be direct and brief — flag what's compelling, flag what's unclear, give sharp questions that target the gaps.

### Output format

```
## Pre-screen: [Candidate Name]

**Verdict:** Worth interviewing | Proceed with caution | Pass

### Green flags
- [specific, evidence-linked — one line each]

### Yellow / Red flags
- [specific concern, one line each — what the gap is and why it matters]

### Screening questions
- [Verbatim question targeting a specific gap — e.g. "What's a project in your most recent role that led to your growth, and how?"]
- [Another question — specific, not generic]

### Online presence
- GitHub: [one line — active / stale / not found]

### One-line take
[Punchy. What's the actual read? E.g. "8 years on paper but unclear if there's depth and progression in the last three years."]
```

**What to look for:**
- Green: trajectory shows growth (not just tenure), evidence of shipping real things, senior role → scope/leadership signals
- Yellow: gaps without context, claims without evidence, stale or absent public activity
- Red: resume inconsistencies vs. public profiles, seniority title with no scope signal, no technical output for a technical role
- Staff and above: which archetype the evidence points to (Tech Lead, Architect, Solver, Right Hand; see `../eng-philosophy/references/staff-engineering.md`), and whether it fits the role. Ask at least one question that tests whether they work on what matters: "What's the most important thing you chose *not* to do last year, and why?"

**Keep it short.** One line per flag. Questions should be ones you could read off the screen in a call. The one-line take is the most important line — make it a real sentence, not a hedge.

---

## Mode: Hiring Debrief

Sunny uses a C# technical assessment plus a structured interview. The debrief should be concise, evidence-based, split into technical and non-technical signal, and give a clear rating.

Ask for: candidate name, role level, and Sunny's raw notes or observations from the interview.

### Rating scale

- **4 — Strong hire:** Clear yes, high confidence, would fight for this one
- **3 — Hire:** Yes with normal confidence
- **2 — No hire:** Pass, specific reasons
- **1 — Strong no hire:** Clear no, notable concerns

### Structure

```
## Hiring Debrief: [Candidate Name] — [Role]

**Rating:** 4 / 3 / 2 / 1
**In one line:** [What tips the rating — one specific sentence]

### Technical
- [What the C# assessment showed — specific patterns, gaps, or standout moments]
- [How they reasoned through problems, not just whether they got the answer]

### Non-technical
- [How they communicated, handled ambiguity, responded to pushback]
- [Behavioral depth: were their examples concrete or surface-level?]

### Staff shape (staff and above only)
[Archetype the evidence shows, the fit with the role, and whether they picked high-impact work or snacked.]

### Watch-outs
[1-2 things to be aware of if hired, or the primary concerns if not. Don't skip this section.]
```

Specific evidence only. "Strong communicator with solid fundamentals" is useless. "Spotted the missing await immediately and explained the deadlock risk unprompted" is useful.
