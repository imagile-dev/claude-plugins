---
name: architecture
description: Design or review a system with Imagile's opinions on .NET, Blazor, TypeScript, Astro and Azure. Use for structure, module boundaries, hosting, Azure naming or cost, and tech choices.
---

# Architecture

Give an opinionated design or review, grounded in the stack below. Recommend one option, and say what it optimizes for. Do not survey every option.

## 1. Understand the problem

Before you propose anything, answer these:

- **What problem does it solve, and for whom?** The answer sets the boundary.
- **Who owns it?** If the team boundary and the system boundary differ, say so plainly.
- **Can it deploy and test on its own?** If not, the boundary is probably wrong.
- **What does it cost each month?** Include always-on resources (see `references/azure.md`).

For a review, read the design or code first. Then apply the rules.

## 2. The non-negotiables

- **Radically obvious, and simple until users force a compromise.** Code and design a newcomer understands on the first read. Keep the simplest option until it would compromise what users experience: behavior, correctness or performance they feel. Hypothetical scale, future flexibility and taste never justify complexity.
- **Name the trade-off.** Every recommendation says what it optimizes for and what it gives up.
- **Modular monolith first.** Extract a service only when its load, its owner or its release cadence is independent. Late is right.
- **No new infrastructure unless it is unavoidable.** Reuse the database, storage and hosts that exist. Ask before you add a resource.
- **Serverless and static by default.** Small APIs go on Azure Functions with Table Storage or SQL. Sites go on GitHub Pages (Astro).
- **No repository, unit-of-work or mediator.** Services take the `DbContext` directly. Controllers call services.
- **Write it before you depend on it.** Use the platform first (`System.Text.Json`, `HttpClient`, `Microsoft.Extensions.*`, Node built-ins). Offer a third-party package only for a real feature gap, with its license.
- **Pin dependencies exactly**, and add only versions at least 14 days old. Pin GitHub Actions to a commit SHA.
- **No secrets in files.** Use OIDC for CI, managed identity in the cloud, and Key Vault or the OS credential store for the rest. Never an API key where federation works.
- **Cost is a gate.** State the monthly cost before you create a resource. Tear down trial infrastructure in the same piece of work.
- **Mobile responsive is part of done.** Test at 375px and desktop.
- **Errors are honest.** Say what failed and how to fix it. Nothing fails silently.

## 3. Stack references

Read only the file the task needs:

| File | Covers |
|------|--------|
| `references/dotnet.md` | Solution layout, EF Core and SQL, DTOs, DI, config, testing, CLI, seeding |
| `references/azure.md` | Hosting choices, Bicep, Imagile resource naming and its 1 to 5 score, cost, CI/CD |
| `references/web.md` | TypeScript and Node tools, Astro sites, front-end defaults |
| `references/principles.md` | Module boundaries, cross-module calls, when to extract a service |

## 4. Output

Use generic `Company.App.*` names in examples. Never use a real client name. Link to docs. Do not copy them.

```
## Architecture: [name]

### Problem
[One sentence.]

### Recommendation
[What to build, where it lives, how it is structured.]

### Optimizing for
[The one or two qualities this favors (obviousness, time to ship, user-felt latency, cost, operability), and what it gives up.]

### Structure
[Projects, folders, key files.]

### Cost
[Monthly run rate of anything new, or "no new resources".]

### Trade-offs
| Option | Gains | Costs | Forced by a user need? |
|--------|-------|-------|------------------------|
| [Recommended] | | | |
| [Alternative] | | | |

### Ownership and independence
[Who owns it. How it deploys and tests on its own.]
```

The recommended option is the simplest one whose costs users never feel. If a more complex option wins, name the user behavior that forces it.

For a review, replace **Recommendation** with **Assessment**, and add **Concerns** before **Trade-offs**. For an Azure naming review, add the **Infra naming** block from `references/azure.md`.
