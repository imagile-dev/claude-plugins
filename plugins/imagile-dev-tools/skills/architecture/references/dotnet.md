# .NET conventions

## Solution

Every project targets the current LTS (`net10.0`) with `Nullable` on and `TreatWarningsAsErrors` true. Use central package management and pin the SDK in `global.json`.

```
Company.App.Domain                 enums, DTO records, exceptions. No dependencies.
Company.App.Data                   DbContext, entities, seeding
Company.App.Core                   services that more than one host needs. No ASP.NET dependency.
Company.App.Api                    controllers + Services/<Area>/
Company.App.Functions              isolated worker, one Function App with many functions
Company.App.Web                    Blazor WASM. References Domain only.
Company.App.Database               .sqlproj that builds the dacpac
Company.App.Cli                    System.CommandLine + Spectre.Console: db deploy, seed, local setup
Company.App.Tests.Predeployment    xUnit, gates every PR
Company.App.Tests.Postdeployment   Playwright (+ optional Reqnroll) against a deployed environment
```

Add another class library only to ship a package. A service with one host lives in that host. Move it to `Core` only when a second host needs it, and put only the real difference behind a narrow interface.

## API

- Controllers inherit one `ApiControllerBase`, are thin and expression-bodied, and declare only authorization.
- Services live in `Services/<Area>/`. The single-implementation interface sits in the same file. Use primary constructors.
- Each area exposes `Add<Area>Services()`. One aggregate extension registers them all. Never register services in `Program.cs`.
- Services throw `KeyNotFoundException` (404), `ArgumentException` (400), `UnauthorizedAccessException` (403) or a `ConflictException` (409). One `IExceptionHandler` maps them to ProblemDetails.
- `CancellationToken` is the last parameter of every async method.
- `ArgumentNullException.ThrowIfNull` on the first line of public service methods.
- When a call changes an external system, check everything before the call. After it, save and audit on `CancellationToken.None`.

## DTOs

Records in Domain. Never a `Dto`, `Model` or `Entity` suffix.

| Suffix | Shape |
|--------|-------|
| `Request` | init-property record, attributes on properties, strings `= string.Empty` |
| `Response`, `Summary`, `Detail`, `Result` | positional record |

## EF Core and SQL

- One `DbContext`. Data annotations first. An `IEntityTypeConfiguration` only for what annotations cannot say, in the entity's own file.
- Keys are `int {Entity}Id`. Add `Guid {Entity}Unique` when an id leaves the system.
- Dates are `DateTimeOffset` named `*Date`. One `SaveChangesInterceptor` sets them from an injected `TimeProvider`. `DateTimeOffset.UtcNow` is banned.
- Strings are non-nullable, `[Required]` + `[StringLength]`, default `string.Empty`. Nullable `bool` is banned: use an enum. Enum properties end in `Type`.
- Read with projection to a record inside the query, and `AsNoTracking()` where it does not project. Shared fragments are `private static` helpers or a static `XxxQueries` class. Page with one `PagedResult<T>` helper.
- **Schema is a dacpac. No EF migrations.** EF entities are the source of truth. Schema compare writes the checked-in `.sql`. Block data loss by default.
- Cloud SQL uses Entra authentication only.

## Seeding

Run after deploy, in this order: db deploy, then reference data, then test data.

- **Reference data:** entities implement `IReferenceDataEntity` and seed through `SyncReferenceDataAsync`, an idempotent upsert.
- **Test data:** Bogus with a fixed seed, one seeder per aggregate root.

## Configuration

- One `AppSettings` per host, validated at startup with `ValidateRecursively()`. Optional features carry `Enabled`.
- Secrets are `@KeyVault(Name)` references, resolved with an explicit credential chain, not `DefaultAzureCredential`.
- Environments are `local`, `qa`, `prod`.
- Logging is `Microsoft.Extensions.Logging` + OpenTelemetry to Azure Monitor. No Serilog.
- Reuse the `Imagile.Framework.*` packages for Key Vault references, validation and convention tests.

## Testing

- xUnit. `DbContext` tests use SQLite in memory.
- Convention tests are mandatory from day one (`DbContextConventionTests`).
- No mocking library by default: hand-rolled stubs, fakes owned by the test factory, a mutable `TimeProvider`. Keep NSubstitute where a repo already uses it.
- API tests use a `WebApplicationFactory` with a test auth handler. Configure it with `UseSetting`.
- Postdeployment tests run at desktop and mobile widths. Scenarios that change data are `@LocalOnly`.
- `dotnet format --verify-no-changes` gates CI.
- Do not unit-test pure mapping code.

## Blazor

State lives in services, not components. No Fluxor and no cascading parameters for state. MudBlazor for admin UI. 44px minimum tap targets.
