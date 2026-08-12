# Contributing to LRA Platform

This repository contains architecture documentation, specifications, shared contracts, infrastructure definitions, and engineering decisions for the LRA Software platform.

Changes should preserve the historical evolution of the platform and make architectural decisions understandable over time.

## Development Workflow

The repository uses a branch-based development workflow.

The main branches are:

```text
main
develop
```

### `main`

Represents the stable and accepted state of the platform.

Changes should reach `main` only after they have been reviewed and considered ready to become part of the official platform architecture, specifications, contracts, or infrastructure.

### `develop`

Integration branch for approved work that is not yet part of the stable platform state.

Feature, documentation, infrastructure, and maintenance branches should normally branch from `develop` and merge back into `develop` through a pull request.

## Branch Naming

Branches should be short-lived and describe the purpose of the change.

Recommended prefixes:

```text
docs/
feature/
infra/
fix/
chore/
refactor/
```

Examples:

```text
docs/repository-architecture-adr
docs/contact-form-spec
feature/contact-request-contract
infra/terraform-bootstrap
fix/openapi-validation
chore/repository-bootstrap
```

The prefix should represent the nature of the change rather than the directory being modified.

For example, an Architecture Decision Record is normally a documentation change:

```text
docs/api-runtime-adr
```

## Commits

Commits should follow the Conventional Commits convention.

Recommended types include:

```text
feat
fix
docs
chore
refactor
test
ci
build
```

Examples:

```text
chore: initialize platform engineering repository

docs: define platform engineering principles

docs(adr): record repository architecture decision

docs(spec): define contact request capability

docs(api): define contact requests OpenAPI contract

infra: bootstrap Terraform configuration

ci: validate OpenAPI contract
```

Commits should represent meaningful steps in the evolution of the platform.

Avoid combining unrelated architectural, specification, infrastructure, and implementation changes into a single commit.

## Pull Requests

Changes should normally be introduced through pull requests.

A pull request should explain:

- what is being changed;
- why the change is needed;
- which platform capability or decision it affects;
- relevant trade-offs when applicable;
- related ADRs, specifications, contracts, or issues.

Pull requests should remain focused.

Large changes should be split when doing so improves reviewability or preserves the architectural history of the project.

## Spec-Driven Development

Platform capabilities should be specified before their implementation.

The expected workflow is generally:

```text
Platform principles
        ↓
Platform ADRs
        ↓
Feature specification
        ↓
Acceptance criteria
        ↓
Solution ADRs
        ↓
Contracts
        ↓
Infrastructure
        ↓
Application implementation
        ↓
Tests and validation
        ↓
Deployment
```

Not every change requires every step.

The process should remain proportional to the scope and architectural impact of the change.

## Specifications

Specifications live under:

```text
specs/
```

A specification should describe expected behavior and constraints without unnecessarily prescribing implementation details.

Specifications may include:

- context;
- goals;
- non-goals;
- functional requirements;
- non-functional requirements;
- business rules;
- constraints;
- assumptions;
- dependencies;
- open questions.

Acceptance criteria should be explicit and testable whenever possible.

A specification should not be modified silently after implementation has begun if the change alters expected behavior.

Material changes should be visible in Git history and reviewed through a pull request.

## Architecture Decision Records

Architecture Decision Records live under:

```text
docs/adr/
```

An ADR should be created when a decision:

- has meaningful architectural impact;
- affects multiple repositories or platform components;
- introduces an important technology or architectural pattern;
- creates a significant long-term constraint;
- involves meaningful trade-offs;
- would otherwise be difficult to understand later from the code alone.

Not every technical choice requires an ADR.

Implementation details that are local, obvious, or easily reversible generally do not require one.

### ADR Lifecycle

ADRs may use the following statuses:

```text
Proposed
Accepted
Rejected
Deprecated
Superseded
```

Accepted ADRs should normally remain immutable as historical records.

If a decision changes, create a new ADR and mark the previous ADR as superseded rather than rewriting history.

Minor corrections that do not change the decision may be made directly.

## Contracts

Shared platform contracts live under:

```text
contracts/
```

API contracts should be defined independently from the application implementation.

For HTTP APIs, OpenAPI is the preferred contract format.

The official contract represents the expected external behavior of the API.

Application-generated OpenAPI documents may later be validated against the official contract to detect implementation drift.

Breaking contract changes must be deliberate and clearly documented.

## Infrastructure

Infrastructure definitions live under:

```text
infra/
```

Infrastructure should be managed as code whenever practical.

Terraform is the intended Infrastructure as Code tool for the platform.

Manual infrastructure changes should be avoided when the same resource is managed by Terraform.

Infrastructure structure, state strategy, environments, modules, deployment ownership, and CI/CD behavior should be introduced only after the corresponding decisions have been evaluated.

## Engineering Principles

Changes should favor clarity, maintainability, and proportional complexity.

Complexity should be introduced only when justified by:

- functional requirements;
- non-functional requirements;
- operational benefits;
- expected platform evolution;
- deliberate and documented engineering learning objectives.

Avoid introducing technologies, abstractions, services, or processes only to make the project appear more sophisticated.

## Repository Boundaries

Application-specific implementation belongs in the corresponding application repository.

Platform-wide decisions, contracts, architecture, and infrastructure belong here.

When ownership is unclear, prefer the repository that is the natural source of truth for the artifact rather than duplicating it across repositories.

## Versioning

Semantic Versioning may be used for meaningful platform releases, shared contracts, or infrastructure milestones.

Release branches and formal release processes are not required during the initial repository bootstrap.

A more specific versioning strategy should be introduced when the platform begins publishing artifacts or coordinating releases across repositories.

## Review Principle

Before merging a change, ask:

1. Does this artifact belong in `lra-platform`?
2. Is the change at the correct level of abstraction?
3. Is the complexity justified?
4. Does an architectural decision need an ADR?
5. Does a behavioral change require a specification update?
6. Does an API change require a contract update?
7. Does the Git history clearly explain how the platform evolved?
