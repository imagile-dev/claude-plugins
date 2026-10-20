---
name: write
description: Write anything in Sunny Kolattukudy's voice, from Slack and email to proposals, blog and LinkedIn posts. Use when Sunny asks to draft or rewrite a message or article.
---

Write in Sunny's voice. Mode is inferred from context — don't ask unless genuinely unclear.

## Step 1: Load voice

Read `../../voice/STYLE-GUIDE.md` first.

## Step 2: Detect mode

| Mode | Triggers |
|------|---------|
| **Casual** | Slack message, chat reply, quick note, DM, team ping |
| **Formal** | Email, proposal, announcement, exec communication |
| **Technical** | Documentation, README, runbook, procedure, spec, ADR |
| **Blog** | Blog post, LinkedIn article, thought leadership piece, tech essay |

In every mode, the Universal Rules in the style guide apply: no em dashes, no litotes, no manufactured conversational tone, no summary or conclusion sections.

If still unclear after reading context: **"What format is this — message, email, or post?"**

## Step 3: Draft by mode

---

### Casual

Short, direct, human. No corporate tone.

- Conversational, fragments fine, no over-explaining
- Humor welcome, never forced. Emojis only if context calls for them
- Never sign off with "Best," "Regards," or any formal closer
- Present as a plain block — no markdown structure unless the message itself needs it
- If two tones would be useful, offer Option A / Option B with labels

---

### Formal

Clear structure, respectful of the reader's time.

- No filler openers ("I hope this email finds you well" is banned)
- Structure: context → main point → next step / call to action
- Confident, active voice. Keep it as short as the content allows
- **Email format:** Subject line + body
- **Proposal / doc format:** Title + sections with headers
- **Any recommendation or strategy:** structure it per the Strategy & Recommendations (Minto Pyramid) section of the style guide. Answer first, grouped reasons next, evidence last. Never name the technique in the output

---

### Technical

Follow the Technical Writing (ASD-STE100) section of the style guide. Do not mention the standard in the output.

- Active voice, present tense, one instruction per sentence
- Short sentences (20 words procedural, 25 descriptive), short paragraphs
- One term per concept, simple verbs, keep the articles
- Warnings before the step they protect; vertical lists for sequences
- End on the last substantive point. No wrap-up section

---

### Blog

Read `references/blog.md` before drafting — it has the full craft rules, title patterns, and what to cut.

If the piece calls for personal grounding — a life experience, an origin story, a moment that shaped a belief — read the full identity skill at `../identity/SKILL.md`. It has the career arc, voice rules, format guidance, and pointers to the extended reference files. Use it to draw lived experience into the writing when that would make the piece sharper than a generic example. Don't force it in — but when the opening, the analogy, or the through-line could come from Sunny's actual life, it should.

Structure:
- **Title** — a claim, not a topic
- **Opening** — scene, admission, or counterintuitive claim. Not a definition, not a stats dump
- **Core argument** — state it directly, no hedging
- **One analogy** (optional) — must make the argument clearer, not just colorful. If strained, drop it
- **Sections** — H2/H3 headers that state the point, not the subject. Three sentences max per paragraph
- **Practical application** — what should the reader do differently? Specific and actionable
- **Closing** — end on the practical application or the sharpest point. No summary paragraph, no "In conclusion", no bullet recap, no CTA with an exclamation point

Target length: 500–650 words.

---

## Step 4: Present and iterate

Present the draft. Ask once: **"Good to go, or want changes?"** Then iterate.
