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

Use the [Cloud Adoption Framework abbreviations](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations), type first:

```
<type>-<app>-<env>[-<role>]       rg-shop-prod, func-shop-prod, appi-shop-prod, kv-shop-prod
<type><app><env>                  stshopprod  (no hyphens allowed)
<type>-<app>-shared-<role>        log-shop-shared, id-shop-shared-deploy
```

Common types: `rg`, `func`, `app`, `ca`, `cae`, `sql`, `sqldb`, `st`, `kv`, `appi`, `log`, `id`, `apim`, `evgt`, `sbq`.

- Environments are `dev`, `qa`, `prod`.
- One Function App per app and environment, many functions inside it.
- When a name needs global uniqueness, add the suffix at the end.
- A repo that already uses another pattern keeps it. Do not mix two patterns in one repo.

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
| 5 | CAF type, app, environment and role, in that order, for every resource |
| 4 | One reasoned deviation for uniqueness, DNS or an Azure limit |
| 3 | Clear but inconsistent: order or abbreviations drift |
| 2 | Two patterns mixed in one repo |
| 1 | Missing app, environment or role (`backend`, `function1`) |

## CI/CD

- GitHub Actions with OIDC only (`azure/login` with client, tenant and subscription ids). No credential JSON.
- Reusable `_deploy-*.yml` workflows called with `environment:`. GitHub Environments hold the gates.
- `concurrency` on deploys. `cancel-in-progress` on PR CI.
- One required status check (for example `CI ok`) that passes only when every gate passed.
- Bots act as a GitHub App, never a personal token.
- Do not run postdeployment tests before you push. The deploy workflow runs them.
