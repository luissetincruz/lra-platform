# Infrastructure

This directory contains Infrastructure as Code and platform-level infrastructure configuration for the LRA Software platform.

Infrastructure definitions should describe the cloud resources required to operate the platform and should remain separate from application implementation code.

## Purpose

The infrastructure layer is responsible for provisioning and configuring the platform resources required by application workloads.

Examples may include:

- compute resources;
- API gateways;
- container registries;
- networking;
- IAM resources;
- observability resources;
- DNS;
- email delivery infrastructure;
- persistent storage;
- messaging infrastructure;
- security controls.

Not every resource listed above is necessarily required by the current platform.

Infrastructure should be introduced only when justified by an actual platform requirement or an accepted architectural decision.

## Infrastructure Ownership

Platform infrastructure belongs in `lra-platform` when it represents shared or deployment-level architecture rather than application source code.

For example:

```text id="4ab2vl"
lra-web
    ↓
Application implementation

lra-api
    ↓
Application implementation

lra-platform
    ↓
AWS infrastructure
```

Application repositories are responsible for the applications that run on the infrastructure.

This repository is responsible for describing the infrastructure itself.

## Infrastructure as Code

Terraform is the intended Infrastructure as Code tool for the platform.

Infrastructure should be reproducible from version-controlled configuration whenever practical.

The general direction is:

```text id="46ppwr"
Architecture decisions
        ↓
Terraform configuration
        ↓
Infrastructure validation
        ↓
Plan
        ↓
Apply
        ↓
Operational verification
```

Terraform configuration should not be introduced before the relevant infrastructure decisions are sufficiently understood.

## Repository Structure

The final Terraform structure has not yet been defined.

A possible future structure may include concepts such as:

```text id="k8kkwi"
infra/
└── terraform/
    ├── modules/
    └── environments/
```

However, directories such as `modules`, `dev`, or `prod` should not be created only because they are common Terraform conventions.

The structure should follow the actual deployment model and platform requirements.

## Environments

The platform may eventually require multiple infrastructure environments.

Examples may include:

- development;
- staging;
- production.

The number and purpose of environments should be driven by actual delivery and operational requirements.

An environment should not be introduced only to make the infrastructure structure appear more mature.

The environment strategy must define how configuration, state, credentials, deployment, and isolation are handled before multiple environments are created.

## Terraform State

Terraform state is operationally significant and must be handled deliberately.

The platform must eventually define:

- state storage;
- state locking when applicable;
- state isolation between environments;
- access control;
- backup and recovery considerations;
- handling of sensitive values.

Local state may be acceptable during early isolated experimentation, but it must not become the accidental production state strategy.

The state architecture should be documented before production infrastructure depends on it.

## Modules

Terraform modules should be introduced when they provide meaningful reuse, isolation, or maintainability.

Resources should not be wrapped in modules solely to create additional abstraction.

A module may be appropriate when:

- a group of resources represents a reusable infrastructure capability;
- the same infrastructure pattern is required in multiple environments;
- the abstraction creates a clear and stable boundary;
- the module improves testing or ownership.

Simple infrastructure may remain directly defined when abstraction would add more complexity than value.

## Application Deployment

Infrastructure provisioning and application deployment are related but separate concerns.

The platform will need to define responsibility for actions such as:

```text id="bizmdj"
Application build
        ↓
Artifact creation
        ↓
Artifact publishing
        ↓
Runtime deployment
```

Possible deployment ownership models include:

- Terraform managing both infrastructure and application version;
- Terraform provisioning infrastructure while application repositories deploy their own artifacts;
- coordinated workflows across repositories.

This decision has not yet been made.

It should be evaluated based on deployment simplicity, traceability, Terraform drift, repository boundaries, and operational ownership.

## AWS Resources

AWS is the intended cloud platform for the initial platform architecture.

Specific AWS services should be selected through architectural decisions when those choices have meaningful consequences.

Potential services being evaluated for the initial API capability include:

- AWS Lambda;
- Amazon API Gateway;
- Amazon ECR;
- Amazon SES;
- Amazon CloudWatch;
- IAM;
- Route 53.

Listing a service here does not constitute an architectural decision.

Accepted decisions should be documented through ADRs before their implementation becomes part of the platform infrastructure.

## Security

Infrastructure configuration must follow the principle of least privilege.

Infrastructure code must never contain committed secrets such as:

- AWS access keys;
- passwords;
- private tokens;
- API credentials;
- SMTP credentials;
- private keys.

Sensitive values should be provided through secure runtime or deployment mechanisms.

IAM permissions should be scoped to the resources and actions required by each workload.

Security-related architectural decisions should be documented when they introduce meaningful platform constraints.

## Observability

Infrastructure should support sufficient visibility into production behavior.

Depending on the platform capability, this may include:

- logs;
- metrics;
- traces;
- alarms;
- error monitoring;
- operational dashboards.

Observability should be designed according to actual operational requirements rather than added only as a technology checklist.

The specific observability model will be defined alongside the runtime architecture.

## Cost

Infrastructure decisions should consider expected workload and operating cost.

The platform should favor infrastructure that remains economically proportional to its current usage while allowing reasonable evolution.

Low initial traffic does not justify unnecessary permanent infrastructure.

Likewise, cost optimization should not compromise required reliability, security, or maintainability.

## Manual Changes

Resources managed by Terraform should not normally be changed manually in production.

Manual changes may create configuration drift between the declared infrastructure and the actual environment.

When emergency manual changes are unavoidable, the corresponding Terraform configuration should be reconciled as soon as practical.

## Validation

Infrastructure should eventually be validated through automated workflows.

Possible validation steps may include:

- Terraform formatting;
- configuration validation;
- static analysis;
- security checks;
- Terraform plan review.

Specific tools and policies should be introduced when Terraform configuration actually exists.

## Infrastructure Principle

Infrastructure should remain declarative, reproducible, secure, and proportional to the requirements of the platform.

Infrastructure complexity must be justified by the workload it supports, the operational problem it solves, or a deliberate architectural objective.
