# Opinions — Sunny Kolattukudy

Raw material for identity writing. Pull specifics, don't summarize. Use when a piece calls for his positions on engineering, process, or culture.

---

## Standups

Best case: product and engineering unblocking each other, walking the board backwards to verify work isn't blocked. The standup serves the team.

Worst case: a manager rotates through everyone asking for generic updates. People start justifying their time instead of surfacing blockers. The accountability is real — the standup gets weaponized as a management tool.

His move when it goes wrong: challenge the process one-on-one with the manager or scrum master first. If there's resistance, name it publicly. He prefers rotating who runs it — that alone signals "we're accountable to each other, not to you."

---

## Agile / Scrum

Mostly theater. Kanban: good. Scrum: overly ritualistic, point estimates are usually wrong, velocity becomes measurement hubris.

In the AI age the ceremony looks even more hollow. Build in a low-risk way, iterate — don't spend cycles in planning rituals.

**Low-risk in practice:** Robust feature flagging. Radically obvious code. Engineers trained to push PRs that don't break production. A skilled developer can ship to production without diverting customers until the flag flips. For UI features: make a PR with mockups rather than talking about it. With AI, incorporating feedback late is cheap — wasting human time in meetings is not.

Scrum's structural failure: contributors get treated as interchangeable. Developers sit on their hands at sprint end; QA has nothing at sprint start. He's watched Scrum devolve into Kanban at every company he's been at.

---

## Estimation

All of it — story points, t-shirt sizes, planning poker — is terrible.

His approach: bottom-up estimation at the feature/epic level, not the story/task level. Break a large initiative into milestones, estimate those, stop there. The first stories always go slower as context builds — granular estimates don't survive contact with that reality.

At the story level, the only question worth asking: *is this ticket too big?* Right-sizing, not estimating.

When forced to produce velocity metrics: he's exported Jira data and plotted point proportionality against cycle time. Do 2-point stories take twice as long as 1-point stories? Usually no correlation. That data either opens the conversation or ends it. If they still won't move: he points every story "2."

---

## Code Reviews

What kills him: whitespace and formatting flags. That's what linters are for.

Toxic pattern: using reviews to enforce personal preferences dressed up as standards. Senior and staff engineers need to own the difference between *objectively wrong* and *preference*. Staying on pattern is sometimes right — but you should be able to answer "why does this pattern exist?" If you can't, the pattern doesn't deserve defending.

Real example: it's objectively wrong to create N+1 queries. Creating repository layers is a preference. The more valuable conversation is how a `Get(int id)` repository signature *causes* N+1 queries — whether the pattern creates the problem it was supposed to prevent. Most engineers will just say "we use this interface" without thinking it through.

What he focuses on: security, major performance, bad maintainability, naming that doesn't communicate intent. And calling out the good — not just the problems. That matters for culture.

---

## Staff Engineering

A fan of Will Larson's staffeng.com. The parts he leans on: working on what matters (existential issues and work with room and attention, not snacking or preening), the four archetypes (Tech Lead, Architect, Solver, Right Hand) as different shapes of senior impact rather than one ladder, and sponsorship over advice. Seniority is measured by what you finish and who you grow, not by what you start.

---

## Over-Engineering

Real example: a system using Azure Event Hubs, multiple Azure Functions, an API, webjobs, and a queue — to transfer some data. Built over three years in isolation, broken in almost every way when it was time to ship. No observability, no logging, zero current documentation.

He rewrote it: one queue and one function app. Same job. Completely observable.

What made him maddest wasn't the complexity — it was the posture. Dismissive, arrogant, no accountability. The architects weren't around long enough to be humbled. Junior engineers who questioned it got put down. Premature optimization plus self-inflated self-image: complexity built for the builder's benefit, not the team's.

---

## Sprint Planning

Would eliminate it. Recurring failure: pulling tickets from the backlog, pushing everything from the previous sprint forward, calling it planning.

What should replace it: seniors and staff leading projects directly, paired with juniors and mids. Small focused teams (2–3), one initiative at a time, a delivery date as the anchor. Iterate to MVP, get internal and beta feedback, then return.

---

## Hiring

Most controversial opinion: who someone is — character, judgment, taste, motivation, communication — matters more than technical ability.

How he screens for it: prefers people he already knows. Looks for side projects done outside any organization — evidence of intrinsic motivation. Gauges how current they are on language features and tooling, not to trick them but to tell whether they do this for the work or the paycheck. Listens for honesty and specificity in how they reflect on their own experience. Authenticity is felt in a conversation; it can't be manufactured.

---

## AI and Software Delivery

What people are getting wrong: treating AI as a speed boost for individuals. The bigger shift is structural.

Synchronous collaboration matters more now, not less. Get clarity fast, show a demo, iterate — don't wait for long technical proposals. Research → plan → implement is replacing scrum. The solopreneur has a structural advantage right now: clarity immediately, no consensus tax.

For larger teams to beat a sharp individual with AI, they need tight fundamentals: E2E test automation, linting, great seed data, small teams (2–3). Good feedback loops make agents dramatically more powerful. Bad fundamentals make agents thrash.

---

## Tech Debt

Real and inevitable. It comes in many forms across a spectrum — keeping packages current on one end, full stack migrations on the other, and everything in between: upgrading frameworks, refactoring tangled modules, replacing brittle integrations, retiring deprecated APIs.

Preferred approach: bundle. When product wants large new features, find the path that addresses tech debt simultaneously. Classic move: old AngularJS + .NET Framework app, product wants big new features — build them in a modern facade (Angular + .NET 10), layered on the old app. Migrate functionality over time. New delivery gets faster immediately; migration happens alongside real product work.

What doesn't work: ignoring it. Lift-and-shift.

When product won't give you the bundling opportunity: product can dictate scope or timeline — not both, and never the technical approach. He'll negotiate scope down, sometimes to the point where the feature barely matters. If it genuinely needs to move fast, the conversation shifts to *how do we get there faster* — not *do we cut corners*.
