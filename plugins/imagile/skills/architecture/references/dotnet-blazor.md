# .NET / Blazor / Azure reference

The stack-specific rules that follow from the principles in `SKILL.md`. Sources:
Imagile.App, Imagile.Framework and earlier client work.

## Solution layout

```
Company.App.Api          → ASP.NET Core API, MVC controllers (Container Apps)
Company.App.Ui           → Blazor Razor class library (pages, components, client services)
Company.App.Ui.Web       → Blazor WASM host
Company.App.Domain       → POCOs and enums shared by server and client (no server deps)
Company.App.Core         → shared backend logic, not sent to the client (`Backend` is fine too)
Company.App.Data.<Name>  → EF Core project, one per database schema
Company.App.Functions    → Azure Functions (one app, many functions)
Company.App.Cli          → dev operations, seeding, migrations
Company.Tests.Predeployment   → xUnit, runs before deploy
Company.Tests.Postdeployment  → Reqnroll + Playwright E2E, runs after deploy
```

- Naming: `CompanyName.AppName.ComponentName`. Standard components: `Api`, `Ui`,
  `Ui.Web`, `Domain`, `Core` (or `Backend`), `Data.<Schema>`, `Functions`, `Cli`.
- No more class libraries unless you're producing a distributable package. Fewer
  projects is the point, not convenience.
- An interface with a single implementation lives in the same file as it.

## Feature folders

```
Company.App.Ui/Features/<Feature>/
  Pages/        → @page components
  Components/   → sub-components for this feature
  Services/     → I<Feature>Service + HttpClient implementation
Company.App.Api/Features/<Feature>/
  <Feature>Controller.cs
  <SubResource>Controller.cs   → e.g. PermissionsController beside RolesController
  Services/<Feature>Service.cs
```

Cross-cutting services sit in a root `Services/`; the shell sits in `Layout/`.

## Patterns

- **No repository over EF Core.** `IQueryable<TEntity>` extension methods that
  project to `IQueryable<TModel>`, composed in the controller. A `Get(int id)`
  repository method is how N+1 queries start.
  ```csharp
  var results = db.LicenseSources
      .FilterByState(filter.State)
      .ProjectToListModel()
      .Skip(filter.Offset)
      .Take(filter.Count);
  ```
- **No mediator.** No MediatR, `IRequest`/`IHandler` or `-Command` suffix.
  Controller → service, directly.
- **No `-Dto` suffix.** `ProviderModel`, `CredentialSummaryModel`.
- **Mapping by hand.** No AutoMapper or Mapster. Entity → model: a projection on
  `IQueryable` or a static `.ToModel()`. Model → entity: `CopyFrom(model)` on the
  entity. Don't unit test pure mapping.
- **Blazor state lives in services.** A singleton service with private state, or
  `IMemoryCache` for larger cases. Mutations invalidate the cache. No Fluxor, no
  cascading parameters for state.
- **Describe things with enums.** Enums with declarative attributes are the
  single source of truth for domain vocabulary: lookup tables, validation and UI
  metadata come from them. Prefer features that strengthen the loop
  enum → schema → seeded data → UI metadata → E2E verification.
- **Time is injected.** `TimeProvider`, never `DateTime.UtcNow` in a LINQ predicate.
- **Async all the way.** No `async void`, no unobserved fire-and-forget, a
  `CancellationToken` on I/O-heavy calls.

## Databases

- `int` primary keys named `{Entity}Id`; foreign keys `{Navigation}Id`. No GUID PKs.
- PascalCase, lowercase "d" in `Id`, no `Entity` suffix on classes.
- Date properties end in `Date`; booleans start with `Is` or `Has`; no nullable
  booleans (use an enum for an unknown state).
- Automatic auditing and soft delete with query filters.
- Naming rules are enforced by a predeployment test, not by review.
- Multi-tenant data: every tenant row implements `ITenantIdEntity`, and the
  connection resolves per tenant.

## Seeding

- **Reference data** (lookups, roles, permissions, enum tables): a static
  `ReferenceDataSeeder` in the `.Data` project. It runs an idempotent upsert in FK
  order (add new, update changed, delete orphans), and the CLI command
  `seed-reference` runs it after migrations, locally and in CI.
- **Test data**: Bogus with a fixed seed (`new Faker(seed: 12345)`).
  `DataSeeder.cs` orchestrates one seeder per aggregate root, and the CLI command
  `seed-test` runs it locally and in PR or staging pipelines.

## CLI

`System.CommandLine` for routing and `Spectre.Console` for output. Commands use
feature folders: `Commands/Db/Deploy/`, `Commands/Storage/Seed/`.

## Testing

- **xUnit** in `Tests.Predeployment`. **Reqnroll + Playwright (.NET)** in
  `Tests.Postdeployment`: feature files describe business scenarios, step
  definitions sit over page models, and extension methods wrap MudBlazor or
  Telerik interactions. **Impostor** for mocks.
- Every E2E scenario runs at desktop and at 375px.
- Never name projects `UnitTests` or `IntegrationTests`.

## Packages

1. Can you write it in under 100 lines? Do it.
2. Is there a Microsoft package? Use it (`System.Text.Json`, `HttpClient`,
   `Microsoft.Extensions.*`).
3. A third-party package needs a significant feature advantage and a license
   check: MIT or Apache 2.0 are fine, (L)GPL is flagged, commercial licenses need
   approval.

Named exceptions: xUnit, Reqnroll, Playwright, Impostor, Bogus, Spectre.Console.

## Hosting

| Workload | Azure (preferred) | AWS |
|----------|-------------------|-----|
| API | Container Apps | |
| Background and queue work | One Function App, many functions | |
| Queue | Storage Queue | SQS |
| Fan-out | Event Grid or Event Hub | |
| IaC | Bicep | Terraform |

A very small API can be Functions-only. State the reason for a hosting choice:
scale, cost, familiarity or existing infra. Resource names: `azure-naming.md`.

## Repo setup

A root `CLAUDE.md` with an `AGENTS.md` symlink, `.githooks/` for format and
commit-message checks (`git config core.hooksPath .githooks`), and
`dotnet format --verify-no-changes` in the gate. `imagile:bootstrap` installs the
rest.
