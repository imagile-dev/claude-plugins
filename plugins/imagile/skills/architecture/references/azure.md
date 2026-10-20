# Azure conventions

## Hosting

| Need | Default |
|------|---------|
| Static site or docs | GitHub Pages (Astro). Static Web App only when a custom domain needs it |
| Small API, webhook, form backend | Azure Functions (Flex Consumption), Table Storage for simple data |
| Background work, one consumer | Storage Queue to a Function |
| Fan-out to many consumers | Event Grid or Event Hubs. No in-process eventing |
| Larger API | Container Apps, scale to zero |
| Relational data | Azure SQL serverless with auto-pause, Entra authentication |
| IaC | Bicep. Run `what-if` before every deploy |

AWS is secondary: SQS for queues, Terraform for IaC.

Pick the Function language from the repo. A Node-centric repo gets a Node Function. A .NET solution gets the isolated worker.

## Cost is a gate

1. Before you create or resize a resource, find its monthly cost and what the subscription already spends (`az consumption budget list`, or Cost Management through `az rest`).
2. If the change pushes the subscription over its budget, stop. Say the number and what it buys. Wait for approval.
3. After you create it, state its monthly run rate.

Watch for resources that are cheap per hour but always on. API Management, a SQL database that never pauses, and a dedicated plan all cost more than they look.

Trial infrastructure is ephemeral. One script brings it up, tests it and tears it down in `finally`. Teardown is part of the task, not a follow-up.

## Naming

Imagile's deployed resources set the convention. The name reads like the product first, not the Azure catalog.

```
<app>-<env>-<role>          imagile-prod-api, imagile-prod-functions, imagile-prod-key-vault
<app>-<env>                 imagile-prod  (resource group)
<app><env><role>            imagileprodstorage  (no hyphens allowed)
<app>-<role>                imagile-keyvault  (shared organization resource)
<app>-shared-<role>         imagile-shared-law
```

Roles: `api`, `functions`, `ui`, `sql`, `signalr`, `key-vault`, `identity`, `dashboard`, `cae`, `storage`, `ai` (Application Insights), `law` (Log Analytics).

- Child resources keep the parent prefix: `imagile-prod-sql/imagile-prod-metabase`, `imagile-prod-api-health`.
- Environments are `dev`, `qa`, `prod`.
- One Function App per app and environment (`<app>-<env>-functions`), many functions inside it.
- When a name needs global uniqueness, keep the convention as far left as possible and add the suffix at the end.
- No CAF type prefixes (`func-`, `rg-`, `st`, `kv`, `appi`) unless the repo already uses them consistently. Do not mix two patterns in one repo.

For a naming review, add:

```
### Infra naming
Score: [1-5]/5
[Assessment.]
Recommended names:
- Resource group: `...`
- Function App: `...`
- Storage account: `...`
- App Insights: `...`
```

| Score | Meaning |
|-------|---------|
| 5 | `<app>-<env>-<role>` with the role vocabulary above, Azure limits handled without changing the order (`imagileprodstorage`) |
| 4 | One reasoned deviation for uniqueness, DNS or an Azure limit (`imagile-prod-functions-health`) |
| 3 | Clear, but order or vocabulary drifts (`prod-imagile-functions`, `imagile-prod-func`). Fine for legacy, not for new Bicep |
| 2 | Type-first CAF prefixes with no repo reason (`func-imagile-prod`, `rg-imagile-prod`), or two patterns mixed |
| 1 | Missing app, environment or role (`backend`, `function1`, `centralus-prod-app`) |

## CI/CD

- GitHub Actions with OIDC only (`azure/login` with client, tenant and subscription ids). No credential JSON.
- Reusable `_deploy-*.yml` workflows called with `environment:`. GitHub Environments hold the gates.
- `concurrency` on deploys. `cancel-in-progress` on PR CI.
- One required status check (for example `CI ok`) that passes only when every gate passed.
- Bots act as a GitHub App, never a personal token.
- Do not run postdeployment tests before you push. The deploy workflow runs them.
