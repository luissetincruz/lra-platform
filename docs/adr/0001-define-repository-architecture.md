# ADR-0001: Define Repository Architecture

**Status:** Accepted

**Date:** 2026-08-11

## Context

The LRA Software platform is evolving beyond the existing public website.

The current frontend application is maintained in `lra-web`, a Next.js repository already deployed independently through AWS Amplify.

The platform is expected to introduce additional capabilities, including a backend API, shared API contracts, Infrastructure as Code, architecture documentation, and cross-application engineering decisions.

The initial backend capability will support contact requests from the public website, but the repository architecture must support future capabilities without coupling platform-wide concerns to a specific application.

The repository structure must provide clear ownership for:

- frontend implementation;
- backend implementation;
- platform architecture;
- Architecture Decision Records;
- feature specifications;
- acceptance criteria;
- shared API contracts;
- Infrastructure as Code;
- cross-repository engineering decisions.

The architecture should remain simple enough for the current size of the platform while allowing the frontend, backend, and infrastructure to evolve independently.

The existing `lra-web` repository should also retain its history and deployment lifecycle.

## Decision

The LRA Software platform will use three independent Git repositories:

```text
lra-platform
lra-web
lra-api
```

The repositories will remain independent and will not use Git submodules.

### `lra-platform`

`lra-platform` is the source of truth for concerns that belong to the platform as a whole or coordinate multiple application repositories.

It owns:

- platform architecture documentation;
- Architecture Decision Records;
- feature and platform specifications;
- acceptance criteria;
- shared contracts;
- official OpenAPI contracts;
- platform-level Infrastructure as Code;
- cross-repository engineering decisions;
- platform engineering governance.

Conceptually:

```text
lra-platform/
├── docs/
│   ├── architecture/
│   └── adr/
├── specs/
├── contracts/
└── infra/
```

`lra-platform` is not a parent Git repository for the application repositories.

It does not contain working copies of `lra-web` or `lra-api`, and it does not track their commits through Git submodules.

### `lra-web`

`lra-web` remains the source of truth for frontend implementation.

It owns concerns such as:

- Next.js and React application code;
- frontend TypeScript code;
- UI components;
- frontend dependencies;
- frontend tests;
- frontend-specific configuration;
- frontend build behavior.

The existing repository history and AWS Amplify deployment remain independent from `lra-platform`.

### `lra-api`

`lra-api` will be the source of truth for backend application implementation.

It will own concerns such as:

- API runtime source code;
- Python application dependencies;
- application configuration;
- backend tests;
- backend-specific development tooling;
- backend build artifacts.

The selection of a specific backend framework or runtime architecture is outside the scope of this ADR.

### Shared Contracts

Contracts used across repositories belong to `lra-platform`.

For example:

```text
                  lra-platform
                       │
                       │
             OpenAPI contract
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           lra-web           lra-api
```

The official shared contract must not be independently redefined by either application repository.

Application repositories may generate types, clients, schemas, or framework-specific representations from the shared contract when appropriate, but those representations do not replace the platform contract as the source of truth.

### Infrastructure Ownership

Infrastructure as Code that provisions or configures LRA Software platform runtime infrastructure belongs to `lra-platform`, including infrastructure dedicated to a single application when that infrastructure is part of the platform deployment architecture.

This allows infrastructure spanning multiple applications or services, as well as infrastructure dedicated to a specific runtime, to remain independent from application implementation code.

However, this decision does not imply that all existing LRA Software infrastructure is immediately managed through Terraform.

Existing resources, including infrastructure currently supporting `lra-web`, remain under their current management model until an explicit decision brings them under platform Infrastructure as Code management.

The presence of an AWS resource does not automatically mean that it must be imported into Terraform.

### Deployment Ownership

This ADR does not define which repository is responsible for deploying application artifacts.

For example, it does not decide between approaches such as:

```text
lra-platform
    │
    └── Terraform provisions infrastructure
        and deploys an application version
```

or:

```text
lra-platform
    │
    └── Terraform provisions infrastructure

lra-api
    │
    └── application CI/CD builds and deploys the runtime artifact
```

Deployment ownership will be evaluated separately when the runtime and infrastructure architecture are defined.

## Alternatives Considered

### Alternative A: Monorepo

Maintain frontend, backend, platform documentation, contracts, and infrastructure in a single Git repository.

Example:

```text
lra/
├── apps/
│   ├── web/
│   └── api/
├── docs/
├── specs/
├── contracts/
└── infra/
```

#### Advantages

- cross-application changes can be atomic;
- a single pull request can update contracts and all consumers;
- repository discovery and onboarding may be simpler;
- refactoring across applications is easier;
- shared tooling and CI can inspect the complete platform state.

#### Disadvantages

- frontend and backend deployment lifecycles become more closely coupled;
- Node.js, Python, Terraform, and application tooling coexist in the same repository;
- CI/CD may require more path-aware orchestration as the platform grows;
- the existing independent `lra-web` repository would require migration;
- repository boundaries would become less explicit.

This is a valid architecture, but it provides insufficient benefit to justify restructuring the existing frontend repository at the current stage of the platform.

### Alternative B: Independent Application Repositories with a Central Platform Repository

Maintain:

```text
lra-platform
lra-web
lra-api
```

as independent Git repositories.

#### Advantages

- application responsibilities remain clearly separated;
- frontend and backend can evolve independently;
- each application can use tooling appropriate to its technology stack;
- shared contracts have a neutral source of truth;
- infrastructure is not artificially owned by the backend implementation;
- architecture and specifications remain independent from application code;
- the existing `lra-web` history and deployment model are preserved;
- platform-wide concerns receive an explicit ownership boundary.

#### Disadvantages

- changes spanning repositories are not atomic;
- related pull requests may need coordination;
- contract changes can create temporary compatibility gaps;
- additional mechanisms may be needed to prevent contract drift;
- developers may need multiple repositories checked out locally;
- release and dependency traceability across repositories requires discipline.

The benefits of explicit ownership and independent application lifecycles outweigh the additional coordination required at the current stage of the platform.

This alternative is selected.

### Alternative C: Application Repositories Without a Platform Repository

Keep only `lra-web` and `lra-api`, distributing architecture, contracts, specifications, and infrastructure between them.

#### Advantages

- fewer repositories;
- simpler initial Git topology;
- backend-related infrastructure and contracts can remain close to API implementation;
- lower initial coordination overhead.

#### Disadvantages

- shared contracts would become implicitly owned by one application;
- platform-wide infrastructure would need an artificial application owner;
- cross-repository architectural decisions would lack a natural source of truth;
- specifications spanning frontend and backend would need to be duplicated or assigned arbitrarily;
- platform concerns would increasingly accumulate inside application repositories.

This alternative is rejected because expected platform concerns already extend beyond a single application boundary.

### Alternative D: Platform Repository with Git Submodules

Use `lra-platform` as a parent repository that references `lra-web` and `lra-api` through Git submodules.

Example:

```text
lra-platform/
├── lra-web/
├── lra-api/
├── docs/
├── specs/
├── contracts/
└── infra/
```

#### Advantages

- a platform commit could reference exact application revisions;
- a checkout could represent a particular composition of platform versions;
- application repositories could technically remain independent.

#### Disadvantages

- introduces additional Git workflow complexity;
- requires coordination between application commits and parent repository pointers;
- increases the likelihood of incorrect or detached submodule states;
- complicates onboarding and routine repository operations;
- introduces version-pinning overhead without a current requirement for platform-level release composition;
- does not inherently solve shared contract compatibility.

This alternative is rejected because its operational complexity is not justified by current requirements.

## Consequences

### Positive

- each repository has a clear responsibility;
- frontend and backend implementations can evolve independently;
- application-specific toolchains remain isolated;
- specifications and contracts are not subordinate to a particular implementation;
- platform infrastructure has an explicit ownership boundary;
- architectural history can be maintained centrally;
- the existing `lra-web` repository does not require migration;
- future backend implementation can adopt a Python-specific workflow without affecting frontend tooling.

### Negative

- a platform capability may require coordinated changes across multiple repositories;
- cross-repository changes cannot normally be committed atomically;
- contract drift becomes a risk that must be managed;
- compatibility between producers and consumers requires explicit validation;
- developers may need multiple repositories locally;
- tracing a capability across repositories may require references between commits and pull requests.

### Follow-up Implications

The repository architecture creates future questions that must be addressed separately when they become relevant.

These include:

- OpenAPI contract validation;
- detection of API implementation drift;
- breaking contract change detection;
- contract versioning;
- cross-repository change traceability;
- CI/CD ownership;
- infrastructure deployment ownership;
- application artifact deployment;
- coordinated platform releases.

This ADR recognizes those concerns but does not select their implementation mechanisms.

## Out of Scope

This ADR does not decide:

- the backend application framework;
- Python or FastAPI implementation details;
- ASGI integration;
- AWS Lambda runtime architecture;
- API Gateway configuration;
- email delivery services;
- Lambda packaging format;
- Docker usage;
- Amazon ECR usage;
- Terraform state architecture;
- Terraform environment structure;
- CI/CD architecture;
- API versioning;
- contact request behavior;
- contact form requirements.

Those decisions should be evaluated independently through specifications or ADRs when appropriate.

## References

- `README.md`
- `CONTRIBUTING.md`
- `AGENTS.md`
- `docs/adr/README.md`
- `specs/README.md`
- `contracts/README.md`
- `infra/README.md`
