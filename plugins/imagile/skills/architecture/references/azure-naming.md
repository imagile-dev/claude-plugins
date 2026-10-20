# Azure resource naming

Use deployed Imagile resources as the strongest convention:

- Resource groups: `imagile-prod`, `imagile-qa`
- App environment resources: `imagile-prod-api`, `imagile-prod-functions`, `imagile-prod-ui`, `imagile-prod-sql`, `imagile-prod-signalr`, `imagile-prod-key-vault`, `imagile-prod-identity`, `imagile-prod-dashboard`, `imagile-prod-cae`
- Child or related resources keep the parent prefix: `imagile-prod-sql/imagile-prod-metabase`, `imagile-prod-functions-health`, `imagile-prod-api-health`
- Azure-constrained names collapse separators: `imagileprodstorage`
- Shared organization resources use shorter platform names when they are not app-environment specific: `imagile-keyvault`, `imagile-shared-law`, `imagilecontainers`, `imagile-comms`, `imagile-email`, `imagile-translator`

Treat non-Imagile personal projects as weak evidence only. They can explain an exception, but they do not override the Imagile convention.

## Patterns

| Kind | Pattern | Example |
|------|---------|---------|
| App environment resource | `<app>-<environment>-<role>` | `imagile-prod-functions` |
| Resource group | `<app>-<environment>` | `imagile-prod` |
| Resource that disallows hyphens | `<app><environment><role>` | `imagileprodstorage` |
| Shared organization resource | `<app>-<role>` or `<app>-shared-<role>` | `imagile-keyvault`, `imagile-shared-law` |

**Role vocabulary:** `api`, `functions`, `ui`, `sql`, `signalr`, `key-vault`, `identity`, `dashboard`, `cae`, `storage`, `ai` (Application Insights, where the deployed convention already uses it), `law` (Log Analytics Workspace, when space is tight or the deployed convention uses it).

Avoid Azure-type prefixes like `func-`, `rg-`, `st`, `kv` or `appi` unless the repo already uses them consistently. The Imagile convention reads like the product first, not the Azure catalog first.

For Azure Functions, use one Function App per app and environment, named `<app>-<environment>-functions`, with many functions inside it. If a resource needs a public DNS name or global uniqueness, keep the convention as far left as possible and put entropy at the end only when required.

## Naming scale

- **5, Imagile convention:** `<app>-<environment>-<role>` for app resources, `<app>-<environment>` for the resource group, deployed role vocabulary, Azure constraints handled without changing the mental model. `imagile-prod-functions`, `imagile-prod-key-vault`, `imagileprodstorage`.
- **4, acceptable with a reason:** mostly app/environment/role, with a small deviation for uniqueness, DNS, global scope or an Azure restriction. `imagile-prod-functions-health`.
- **3, understandable but not preferred:** clear, but ordering or vocabulary drifts. Fine for legacy resources, not for new Bicep. `prod-imagile-functions`, `imagile-prod-func`.
- **2, Azure-prefix style:** generic abbreviations or type-first naming with no repo-local reason. `func-imagile-prod`, `rg-imagile-prod`, `stimagileprod`.
- **1, ambiguous or misleading:** omits app, environment or role; names a role that doesn't match the service; or encodes implementation noise. `backend`, `prod-service`, `function1`, `centralus-prod-app`.

For a naming review, include:

```
### Infra naming
Score: [1-5]/5

[Direct assessment.]

Recommended names:
- Resource group: `...`
- Function App: `...`
- Storage account: `...`
- App Insights: `...`
```
