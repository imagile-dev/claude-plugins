# Boundaries and communication

## A module boundary is right when

- It can deploy on its own, even if it does not yet.
- It can be tested on its own.
- One team can own it without coordinating on another team's internals.
- It holds one coherent domain concept, not a technical layer ("Services", "Repositories").

It is wrong when two teams keep touching the same files, or when the only reason for it is history.

## Calls between modules

In order of preference:

1. **HTTP API.** A clear, versioned contract.
2. **Queue or event service**, when decoupling matters more than latency.
3. **Direct database access**, only for internal tools or reporting. Never write across schemas.

Never share in-memory state or mutable singletons across modules. No in-process eventing (MediatR notifications, in-process domain events). Queues are simpler to see and observe.

## Extract a service when

- Its load profile differs from the rest.
- A separate team now owns it.
- It must release on its own cadence (for example a third-party integration that changes often).

Do not extract because it "might need to scale someday" or "feels separate", or when the team is small.

## Ownership

Say plainly who owns what and whether the boundary matches. Flag a single team asked to own something across a domain seam, a boundary drawn for technical reasons the organization does not reflect, and ownership nobody can name.
