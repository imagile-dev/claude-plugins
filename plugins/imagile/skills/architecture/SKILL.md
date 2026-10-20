---
name: imagile:architecture
description: Design, review or evaluate a system against Imagile's architecture principles, then read the stack reference that fits (.NET/Blazor/Azure or Node/TypeScript) and Azure resource naming. Use when someone asks "how should I structure X", "design a module for Y", "review this architecture", "should this be a service?", "what's the right project layout", "is this the right pattern?", or asks about module boundaries, cross-module communication, EF Core patterns, Blazor state, testing stack, data seeding, CLI tooling, cloud hosting, Bicep or Azure resource names. Also use when a code review finding touches an architectural decision.
---

# Architecture

Opinionated architecture for Imagile work. The principles below hold for every
stack. The references hold the stack-specific rules that follow from them.

## Principles

1. **Radically obvious beats clever.** A reader who has never seen the code
   understands it on the first pass. No abstraction exists for one use case.
2. **Modular monolith first.** Extract a service only when its load profile, its
   deploy cadence or its owning team is genuinely separate. Late is right.
3. **Slice by feature, not by layer.** A feature folder holds its pages,
   components, endpoints and services together. A folder named for a layer
   ("Services", "Repositories") at the root is a smell.
4. **Adding a feature never edits a shared list.** Registration happens by
   existing (convention, generated index, assembly scan), so parallel agents and
   people never conflict on one file. A shared hotspot is a design finding.
5. **Talk across modules through contracts you can see.** An HTTP API first. A
   queue when decoupling matters more than latency. One consumer: a storage queue
   and a function. Many consumers: an event service. No in-process eventing, no
   mediator, no cross-module shared state.
6. **No indirection over the framework.** No repository over the ORM, no mapper
   library, no command/handler pattern. Query composition and direct mapping are
   shorter and show the real cost.
7. **First-party before third-party.** Write it in under 100 lines, or use the
   platform's own package. A third-party package needs a real feature advantage
   and a license check.
8. **Everything is verifiable by a machine.** Seed data that is deterministic,
   E2E tests at desktop and 375px, a CLI for every dev operation, and an alert
   for every failure a person would otherwise not see.

## Steps

1. **Find the problem first.** What does this solve, for whom, and who owns it?
   If the team boundary and the system boundary disagree, say so plainly.
2. **Read the repo's own CLAUDE.md or AGENTS.md.** Its principles win over these
   defaults. Note any place they disagree.
3. **Read the reference for the stack:**
   - `references/dotnet-blazor.md`: .NET, Blazor WASM, EF Core, Azure Functions,
     testing, seeding, CLI, naming of projects
   - `references/node-ts.md`: TypeScript CLIs, MCP servers, React/Vite UIs
   - `references/azure-naming.md`: Azure resource names and Bicep
4. **Answer.** Recommendation first, then the reasons, then the evidence. Use
   `Company.App.*` placeholder names, never client names.

## Output

```
## Architecture: [name]

### Recommendation      (for a review: Assessment, then Concerns)
[What to build, where it lives, how it's structured.]

### Structure
[Project and folder layout, key files.]

### Alternatives
1. [Option]: [why not, in one line]

### Ownership
[Who owns it, and whether the boundary matches.]

### Verification
[How it is deployed and tested on its own. Which checks prove it.]
```

When a decision here is not covered by a principle and the user isn't in the
loop, take the simplest option and record it in `AGENT_DECISIONS.md` (see the
`imagile:revisit` skill). Don't stop to ask.
