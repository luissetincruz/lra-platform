# Specifications

This directory contains functional and non-functional specifications for capabilities provided by the LRA Software platform.

Specifications describe what the platform must provide, the constraints that apply to that behavior, and how the expected outcome can be verified.

They should remain independent from implementation details whenever possible.

## Purpose

Specifications exist to provide a clear agreement between expected platform behavior and its eventual implementation.

A specification should help answer:

- What problem are we solving?
- Who or what interacts with this capability?
- What behavior is required?
- What constraints apply?
- What is explicitly outside the scope?
- How can we determine whether the capability is complete?

Specifications should be understandable before implementation begins.

## Spec-Driven Development

The platform follows a Spec-Driven Development approach.

For a new capability, the expected progression is generally:

```text
Problem / capability
        ↓
Specification
        ↓
Acceptance criteria
        ↓
Architecture decisions
        ↓
Contracts
        ↓
Infrastructure
        ↓
Implementation
        ↓
Verification
```

Platform-level ADRs may exist before a feature specification when they define broader architectural boundaries or engineering policies.

The process should remain proportional to the scope of the change.

## Directory Structure

Each significant platform capability should normally have its own directory.

Example:

```text
specs/
└── contact-form/
    ├── spec.md
    └── acceptance-criteria.md
```

Additional files may be introduced when they provide clear value, but specifications should not be fragmented unnecessarily.

## Specification Content

A feature specification will normally include:

- context;
- problem statement;
- goals;
- non-goals;
- actors or consumers;
- functional requirements;
- non-functional requirements;
- business rules;
- constraints;
- assumptions;
- dependencies;
- open questions.

Not every specification needs every section.

Sections should exist because they improve understanding, not only because they are part of a template.

## Functional Requirements

Functional requirements describe behavior the platform must provide.

They should focus on externally observable behavior rather than internal implementation.

Example:

```text
FR-001
A visitor can submit a contact request through the public website.
```

Prefer:

```text
The system must validate the submitted email address.
```

over implementation-specific requirements such as:

```text
Pydantic must use EmailStr to validate the email address.
```

The first defines required behavior.

The second is an implementation decision and belongs in application design or an ADR only if the choice has sufficient architectural significance.

## Non-Functional Requirements

Non-functional requirements describe qualities, constraints, or operational expectations that apply to the capability.

They may cover areas such as:

- security;
- reliability;
- performance;
- accessibility;
- observability;
- privacy;
- maintainability;
- interoperability;
- deployment;
- operational limits.

Example:

```text
NFR-001
Application secrets must not be exposed to the browser.
```

Non-functional requirements should be measurable or objectively verifiable whenever practical.

Avoid vague requirements such as:

```text
The API must be fast.
```

Prefer a concrete constraint when one is actually required.

If no meaningful threshold exists yet, do not invent one only to make the requirement appear precise.

## Business Rules

Business rules describe domain-specific behavior or policies.

Examples may include:

```text
A company name is optional.

Only supported service categories may be submitted.

A successfully accepted request must trigger the contact notification process.
```

Business rules may later influence API validation, frontend behavior, or infrastructure, but should remain expressed independently from those implementations.

## Constraints

Constraints are conditions the solution must respect even when multiple implementation alternatives are possible.

Examples:

```text
Infrastructure must be managed with Terraform.

The API contract must be defined using OpenAPI.

AWS credentials must not be exposed to the browser.
```

Constraints should be used carefully.

Every constraint intentionally removes architectural freedom and should therefore have a clear reason.

A technology should not be declared as a specification constraint solely because it is currently preferred.

When a technology choice is still open for evaluation, it should remain an architectural question rather than a requirement.

## Goals and Non-Goals

Specifications should explicitly distinguish what the capability is intended to achieve from what is intentionally excluded.

### Goals

Goals describe the outcomes the capability is expected to enable.

### Non-Goals

Non-goals protect the scope from assumptions and premature expansion.

For example, an initial contact request capability may intentionally not include:

- CRM persistence;
- customer authentication;
- file attachments;
- automated sales workflows;
- WhatsApp notifications.

A non-goal does not mean that a capability will never exist.

It means that it is not part of the current specification.

## Acceptance Criteria

Acceptance criteria live separately from the main specification when the feature is large enough to benefit from explicit verification scenarios.

They should describe observable conditions that demonstrate whether the specification has been satisfied.

Acceptance criteria should be:

- specific;
- testable;
- implementation-independent when possible;
- traceable to requirements.

For example:

```text
AC-001

Given a visitor has completed all required fields with valid values
When the visitor submits the contact form
Then the request is accepted
And the visitor receives a success state
And the contact notification process is triggered
```

Acceptance criteria should not merely repeat:

```text
FR-001 must work.
```

Their purpose is to define how successful behavior can be demonstrated.

## Requirement Identifiers

Requirements should use stable identifiers.

Recommended format:

```text
FR-001
FR-002

NFR-001
NFR-002
```

Acceptance criteria use:

```text
AC-001
AC-002
```

Identifiers should not be reused after a requirement has been removed.

When useful, removed requirements may remain visible in Git history rather than requiring placeholder entries in the current specification.

Requirements should not be renumbered solely to close numeric gaps.

Stable identifiers make future references from ADRs, contracts, tests, pull requests, and implementation documentation easier to maintain.

## Relationship with ADRs

Specifications define required behavior and constraints.

ADRs document significant architectural decisions made to satisfy those requirements.

For example:

```text
Specification:
The contact request must trigger an email notification.

ADR:
Use Amazon SES as the initial email delivery service.
```

The specification should not state that SES must be used unless SES itself is a genuine platform constraint.

This distinction preserves the ability to replace implementation technologies without unnecessarily changing the product requirement.

## Relationship with API Contracts

A specification describes platform behavior at the capability level.

An API contract translates part of that behavior into an explicit interface.

For example:

```text
Specification
    ↓
A visitor can submit a contact request.

OpenAPI contract
    ↓
POST /v1/contact-requests
```

The contract may define:

- paths;
- HTTP methods;
- request schemas;
- response schemas;
- status codes;
- validation boundaries;
- protocol-level behavior.

The OpenAPI contract should not become the only description of the feature.

Business intent and non-HTTP requirements belong in the specification.

## Relationship with Tests

Specifications and acceptance criteria should make expected behavior testable.

Tests may later reference requirement or acceptance criterion identifiers where doing so improves traceability.

However, the specification should not prescribe a particular testing library or testing implementation unless that is itself a deliberate project constraint.

## Changing a Specification

Specifications are expected to evolve.

Before implementation begins, requirements may change freely while the problem is being clarified.

After implementation or external contracts depend on a requirement, material changes should be made deliberately and remain visible in Git history.

A material change may require updates to:

- acceptance criteria;
- ADRs;
- API contracts;
- infrastructure;
- application implementation;
- tests;
- documentation.

A specification should never be changed only to make an existing implementation appear compliant.

When implementation and specification disagree, the difference should be evaluated explicitly.

## Open Questions

Unresolved decisions may be recorded as open questions while a specification is being developed.

Examples:

```text
- Should requests be processed synchronously or asynchronously?
- What should the maximum message length be?
- Which service categories should be accepted?
```

Open questions should eventually be:

- answered in the specification;
- resolved through an ADR;
- moved to a later scope;
- or explicitly rejected.

They should not remain indefinitely once implementation depends on the answer.

## Specification Principle

Specifications should define enough to make implementation and verification unambiguous without prematurely designing the solution.

The goal is not to predict every future requirement.

The goal is to clearly define the current capability before writing the code that implements it.
