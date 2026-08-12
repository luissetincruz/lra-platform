# LRA Platform

Central engineering repository for the LRA Software platform.

This repository contains the specifications, architecture documentation, shared contracts, infrastructure definitions, and cross-repository engineering decisions that define how the LRA Software platform is designed and operated.

Application source code lives in independent repositories.

## Repository Responsibilities

`lra-platform` is the source of truth for:

- platform architecture;
- Architecture Decision Records (ADRs);
- feature and capability specifications;
- cross-repository contracts;
- OpenAPI contracts;
- Infrastructure as Code;
- engineering decisions that affect more than one application repository.

The repository describes the intended architecture and contracts of the platform. Individual applications are responsible for implementing those contracts.

## What Does Not Belong Here

Application-specific implementation code should not be stored in this repository.

Examples include:

- frontend components and pages;
- backend application code;
- Python or Node.js application dependencies;
- application unit tests;
- application-specific Dockerfiles;
- UI implementation details;
- internal documentation that only applies to a single application.

These artifacts belong to their respective repositories.

## Repository Topology

The platform is currently organized into independent Git repositories:

```text
lra/
├── lra-platform/
├── lra-web/
└── lra-api/
```

### `lra-platform`

Platform architecture, specifications, contracts, infrastructure, and cross-repository engineering decisions.

### `lra-web`

Public LRA Software website and frontend applications.

Current stack includes Next.js, React, and TypeScript.

### `lra-api`

Backend APIs and application services.

The implementation repository will be created after the initial platform specifications, contracts, and architecture decisions are defined.

The repositories remain independent Git repositories and do not use Git submodules.

Architectural decisions and their rationale are recorded through ADRs.

## Spec-Driven Development

The platform follows a Spec-Driven Development approach.

Implementation should follow documented requirements and contracts rather than defining them implicitly in application code.

The general flow is:

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
API contracts
        ↓
Infrastructure
        ↓
Application implementation
        ↓
Tests and validation
        ↓
Deployment
```

The exact steps may vary depending on the scope of a change. Not every change requires a new ADR, infrastructure change, or API contract.

## Repository Structure

Initial structure:

```text
lra-platform/
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── architecture/
│   └── adr/
├── specs/
├── contracts/
└── infra/
```

### `docs/architecture`

Platform-level architecture documentation, system context, diagrams, boundaries, and deployment architecture.

### `docs/adr`

Architecture Decision Records documenting significant technical and architectural decisions and their trade-offs.

### `specs`

Functional and non-functional specifications for platform capabilities and features.

Specifications describe expected behavior independently from implementation details.

### `contracts`

Contracts shared between platform components.

API contracts will be maintained here using OpenAPI when applicable.

### `infra`

Infrastructure as Code and infrastructure-related configuration.

Terraform is expected to be used for AWS infrastructure after the required architecture decisions have been documented.

## Engineering Approach

The platform should favor the simplest architecture that satisfies its functional, operational, and learning objectives.

Additional complexity should be introduced only when it is justified by at least one of the following:

- a functional requirement;
- a non-functional requirement;
- a measurable operational benefit;
- an expected platform evolution;
- a deliberate and documented engineering learning objective.

Technology should not be introduced solely to make the architecture appear more sophisticated.

## Current Platform

The first application currently operating as part of the platform is the LRA Software institutional website:

```text
https://www.lrasoftware.com
```

The next planned platform capability is a contact request flow that will replace the website's current email-based contact interaction with a structured API-backed lead generation process.

Its requirements, acceptance criteria, API contract, infrastructure, and implementation decisions will be defined incrementally through this repository.

## Status

This repository is currently being bootstrapped.

Platform specifications, ADRs, API contracts, infrastructure definitions, and implementation repositories will be introduced incrementally as their corresponding decisions are made.
