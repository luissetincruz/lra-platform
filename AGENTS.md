# AGENTS.md

## Repository Purpose

`lra-platform` is the central engineering repository for the LRA Software platform.

It contains:

- platform architecture;
- Architecture Decision Records (ADRs);
- specifications and acceptance criteria;
- shared contracts;
- Infrastructure as Code;
- cross-repository engineering decisions;
- repository-level engineering governance.

Application implementation code does not belong in this repository.

## Repository Topology

The LRA Software platform is organized into independent Git repositories:

- `lra-platform` — architecture, specifications, contracts, infrastructure, and platform decisions;
- `lra-web` — frontend applications and the public website;
- `lra-api` — backend APIs and application services.

The repositories remain independent Git repositories.

Do not introduce Git submodules unless a future accepted ADR explicitly changes this architecture.

## Source of Truth

Use the artifact that naturally owns the information.

### Platform architecture and decisions

Use:

```text
docs/architecture/
docs/adr/
```

### Functional and non-functional behavior

Use:

```text
specs/
```

### Shared interfaces and API contracts

Use:

```text
contracts/
```

### Infrastructure

Use:

```text
infra/
```

### Repository workflow and contribution rules

Use:

```text
CONTRIBUTING.md
```

Do not duplicate detailed rules from these documents into other files.

Prefer linking to the authoritative source.

## Repository Boundaries

Do not place application-specific implementation in `lra-platform`.

Examples that belong elsewhere include:

- React or Next.js components;
- FastAPI application code;
- Python application dependencies;
- frontend application dependencies;
- application unit tests;
- application-specific Dockerfiles;
- implementation-only configuration.

Application repositories remain the source of truth for their implementation.

Examples:

```text
lra-web/package.json
```

owns frontend dependencies.

The future `lra-api` repository will own Python application dependencies.

`lra-platform` owns shared platform contracts and infrastructure.

## Spec-Driven Development

The project follows a Spec-Driven Development approach.

The expected progression for a new platform capability is generally:

```text
Platform principles
        ↓
Relevant platform ADRs
        ↓
Feature specification
        ↓
Acceptance criteria
        ↓
Solution ADRs when required
        ↓
Applicable contracts
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

Keep the process proportional to the scope and architectural impact of the change.

Do not implement a new platform capability before its required specification and any applicable contracts have been defined.

## Specifications

Specifications live under:

```text
specs/
```

For detailed specification conventions, follow:

```text
specs/README.md
```

Specifications define required behavior and constraints.

Avoid embedding implementation decisions into specifications unless they are explicit platform constraints.

Material behavioral changes should update the relevant specification before implementation intentionally diverges from it.

Do not modify a specification only to make accidental implementation behavior appear compliant.

## Acceptance Criteria

Acceptance criteria should be observable and testable.

They should remain implementation-independent whenever practical.

Use stable identifiers such as:

```text
AC-001
AC-002
```

Acceptance criteria should verify requirements rather than merely repeat them.

## Architecture Decision Records

ADRs live under:

```text
docs/adr/
```

For detailed ADR conventions, lifecycle, naming, and status rules, follow:

```text
docs/adr/README.md
```

Use the template:

```text
docs/adr/template.md
```

Create an ADR when a decision has meaningful architectural consequences, significant trade-offs, or long-term impact.

Do not create ADRs for trivial, local, or easily reversible implementation details.

Accepted ADRs are historical records.

Do not silently rewrite an accepted architectural decision.

When a decision changes materially, create a new ADR and supersede the previous one.

## Architectural Decisions

When multiple technically valid alternatives exist:

1. identify realistic alternatives;
2. compare relevant trade-offs;
3. select the option appropriate to current requirements;
4. document the decision with an ADR when architecturally significant.

Relevant trade-offs may include:

- complexity;
- maintainability;
- security;
- scalability;
- cost;
- operational impact;
- deployment impact;
- developer experience;
- vendor dependency;
- expected platform evolution;
- deliberate engineering learning objectives.

Do not create artificial alternatives only to make an ADR appear more complete.

## Contracts

Shared contracts live under:

```text
contracts/
```

For detailed contract conventions, follow:

```text
contracts/README.md
```

HTTP APIs should use an official OpenAPI contract when applicable.

The intended direction is:

```text
Specification
      ↓
Architecture decisions
      ↓
OpenAPI contract
      ↓
Application implementation
```

The official contract is independent from API documentation generated by an application framework.

Do not change a contract solely to make accidental implementation behavior valid.

If implementation and contract diverge, explicitly determine which artifact needs to change.

## Infrastructure

Infrastructure definitions live under:

```text
infra/
```

For infrastructure principles and ownership rules, follow:

```text
infra/README.md
```

Terraform is the intended Infrastructure as Code tool for platform infrastructure.

Do not introduce infrastructure resources before their need and relevant architectural decisions are understood.

Do not introduce abstractions, modules, environments, or services solely because they are common in larger infrastructure repositories.

Terraform-specific tooling should be introduced when Terraform configuration actually exists.

## AWS

AWS is the intended cloud platform for the initial architecture.

Potential services being evaluated may include:

- AWS Lambda;
- Amazon API Gateway;
- Amazon ECR;
- Amazon SES;
- Amazon CloudWatch;
- IAM;
- Route 53.

Mentioning a service does not make it an accepted architectural decision.

Significant service selections should be recorded through ADRs when they involve meaningful alternatives or consequences.

## Engineering Principles

Prefer the simplest architecture that satisfies the requirements.

Additional complexity must be justified by at least one of:

- a functional requirement;
- a non-functional requirement;
- a measurable operational benefit;
- expected platform evolution;
- a deliberate and documented engineering learning objective.

Avoid:

- speculative abstractions;
- premature generalization;
- unnecessary services;
- duplicate sources of truth;
- technology introduced only for appearance.

Prefer explicit boundaries over implicit coupling.

## Deliberate Learning Objectives

This project also has deliberate engineering learning objectives.

A technology may be selected partly because it provides valuable hands-on experience when:

- it is technically appropriate for the problem;
- its trade-offs are understood;
- it does not introduce unreasonable operational complexity;
- the learning objective is relevant to the project.

A learning objective is a legitimate decision factor, but it does not replace technical evaluation.

## Security

Never commit:

- credentials;
- AWS access keys;
- passwords;
- API keys;
- secret tokens;
- SMTP credentials;
- private keys;
- production secrets;
- sensitive Terraform values.

Use placeholder values in documentation and examples.

Backend or AWS credentials must never be exposed to browser code.

Prefer least-privilege permissions.

## Repository Tooling

Current repository tooling includes:

- Prettier for formatting;
- markdownlint-cli2 for Markdown linting;
- lint-staged for staged-file validation;
- Husky for local Git hooks;
- commitlint for Conventional Commit validation.

Future tooling should be introduced when there is an actual artifact or process that requires it.

Examples:

- OpenAPI tooling when the first OpenAPI contract exists;
- Terraform tooling when Terraform configuration exists;
- Python-specific tooling primarily in `lra-api`.

Do not add tooling only because another LRA repository uses it.

## Validation

Before considering a repository change complete, run:

```bash
npm run check
```

To format supported files:

```bash
npm run format
```

To validate Markdown:

```bash
npm run lint:markdown
```

To automatically fix supported Markdown issues:

```bash
npm run lint:markdown:fix
```

Do not bypass failing validation without understanding the cause.

## Git Hooks

The expected local commit flow is:

```text
git commit
    │
    ├── pre-commit
    │      ↓
    │   lint-staged
    │      ├── markdownlint
    │      └── Prettier
    │
    └── commit-msg
           ↓
       commitlint
```

Local hooks provide fast feedback.

CI should become the authoritative repository validation layer when continuous integration is introduced.

## Git and Commits

Follow the repository workflow defined in:

```text
CONTRIBUTING.md
```

Commits must follow Conventional Commits.

Examples:

```text
chore: initialize platform engineering repository
docs(adr): define repository architecture
docs(spec): define contact request capability
docs(api): define contact request contract
infra: bootstrap terraform configuration
ci: validate openapi contract
```

Keep commits focused.

Preserve Git history so that the architectural evolution of the platform remains understandable.

## Pull Requests

Changes should normally be introduced through pull requests according to `CONTRIBUTING.md`.

Use:

```text
.github/pull_request_template.md
```

as the baseline for pull request documentation.

Before submitting a change, determine whether it affects:

- architecture;
- specifications;
- acceptance criteria;
- contracts;
- infrastructure;
- repository tooling.

Update the appropriate source of truth.

## Change Discipline

Before making a change, ask:

1. Does this artifact belong in `lra-platform`?
2. What is its natural source of truth?
3. Is this a behavioral requirement?
4. Is this an architectural decision?
5. Is this part of a shared contract?
6. Is this infrastructure?
7. Is this application-specific implementation?
8. Does an existing ADR already govern this decision?
9. Would this create duplicated documentation or another source of truth?

Do not silently expand feature scope.

If a new requirement emerges during implementation, update the relevant specification and related artifacts before treating it as part of the approved capability.

## Final Principle

Strong engineering in this repository should come from:

- clear boundaries;
- explicit contracts;
- traceable decisions;
- reproducible infrastructure;
- proportional architecture;
- reliable validation;
- understandable Git history.

Complexity is acceptable when it solves a real problem or supports a deliberate engineering objective.

Complexity without a clear reason should be removed.
