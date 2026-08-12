# Contracts

This directory contains shared contracts that define interfaces between components of the LRA Software platform.

Contracts describe how systems communicate and what consumers may rely on independently from a specific implementation.

## Purpose

Platform contracts exist to make integration behavior explicit before application code depends on it.

A contract should help answer questions such as:

- Which operations are available?
- Which inputs are accepted?
- Which outputs may be returned?
- Which validation boundaries apply?
- Which errors are part of the public interface?
- Which changes are backward compatible?
- Which behavior can consumers safely depend on?

Contracts should be version-controlled and reviewed as part of the platform architecture.

## Contract Ownership

Contracts that define interfaces shared across repositories belong in `lra-platform`.

For example:

```text
lra-web
    ↓
HTTP contract
    ↓
lra-api
```

The frontend and backend may each contain implementation-specific representations of the contract, but the shared platform contract remains the reference definition.

Application repositories should not independently redefine shared external behavior.

## OpenAPI

HTTP API contracts should be described using OpenAPI.

The expected structure is:

```text
contracts/
└── openapi/
    └── lra-api.yaml
```

The OpenAPI document should be created only after the relevant capability specification and architectural decisions provide enough information to define the interface deliberately.

The contract should not be generated initially from application code and then treated as the specification.

For this platform, the intended direction is:

```text
Specification
      ↓
Architecture decisions
      ↓
OpenAPI contract
      ↓
Application implementation
```

FastAPI may later generate its own OpenAPI representation from the implemented application.

That generated document may be validated against the official contract to detect implementation drift.

## Contract Scope

An OpenAPI contract may define:

- API metadata;
- paths;
- HTTP methods;
- operation identifiers;
- parameters;
- request bodies;
- response bodies;
- schemas;
- validation boundaries;
- HTTP status codes;
- standardized error representations;
- security schemes;
- relevant protocol-level examples.

The contract should describe externally observable API behavior.

Internal implementation details should remain outside the contract.

For example, the contract should define:

```text
POST /v1/contact-requests
```

but should not define whether the handler is implemented with FastAPI, Mangum, Lambda, or another internal technology unless that technology directly affects the public interface.

## Relationship with Specifications

Specifications describe capabilities and expected behavior.

Contracts translate part of that behavior into a technical interface.

For example:

```text
Specification

A visitor can submit a valid contact request.

        ↓

OpenAPI contract

POST /v1/contact-requests
```

Not every requirement belongs in an API contract.

Requirements related to areas such as:

- accessibility;
- frontend user experience;
- infrastructure;
- operational logging;
- internal notification delivery;

may exist in the specification without appearing directly in OpenAPI.

## Relationship with ADRs

ADRs explain significant architectural decisions surrounding a contract.

Examples include:

- selecting HTTP APIs for a capability;
- choosing API Gateway;
- defining API versioning strategy;
- choosing an authentication model;
- defining asynchronous processing behavior.

The contract records the resulting external interface.

It should not duplicate the architectural rationale contained in ADRs.

## Relationship with Implementation

Application implementations must conform to the official contract.

The implementation may impose internal rules beyond the public contract, but it must not expose behavior that contradicts the contract.

If implementation and contract diverge, the difference must be evaluated explicitly.

The contract should not be modified only to make an accidental implementation behavior valid.

Depending on the situation, the correct action may be to:

1. correct the implementation;
2. deliberately change the contract;
3. update the specification;
4. record an architectural decision;
5. coordinate a breaking API change.

## Contract-First Development

For externally consumed APIs, the platform follows a contract-first approach.

This means the interface is reviewed before application handlers become its source of truth.

A typical API capability evolves through:

```text
Feature specification
        ↓
Acceptance criteria
        ↓
Relevant ADRs
        ↓
OpenAPI contract
        ↓
Contract validation
        ↓
Application implementation
        ↓
Implementation conformance validation
```

This approach enables frontend and backend development to share an explicit interface and helps reduce accidental API drift.

## Validation

Contracts should eventually be validated automatically in CI.

Potential validations include:

- YAML syntax;
- OpenAPI schema validity;
- linting;
- naming conventions;
- duplicate operation identifiers;
- invalid references;
- breaking changes;
- implementation compatibility.

The exact tools and validation policies should be introduced only when the first real contract exists.

Tooling should serve the contract process rather than define it.

## Examples

Examples may be included in contracts when they improve understanding or integration testing.

Examples must remain consistent with the declared schemas.

They should illustrate valid interface behavior rather than compensate for unclear schemas or descriptions.

## Breaking Changes

A breaking change is a contract change that may cause an existing consumer to stop working correctly.

Examples may include:

- removing an endpoint;
- removing a response field;
- renaming a field;
- making an optional request field required;
- changing the meaning or type of a field;
- changing expected status codes in a way consumers may depend on.

Breaking changes must be deliberate.

They may require:

- a new API version;
- migration planning;
- specification updates;
- consumer coordination;
- an ADR when the impact is architecturally significant.

A specific API versioning strategy will be defined when the first API contract is designed.

## Non-Breaking Changes

Changes may be backward compatible when existing consumers can continue operating without modification.

Examples may include:

- adding a new optional request field;
- adding a new endpoint;
- adding documentation;
- expanding descriptions or examples.

Compatibility should still be evaluated rather than assumed.

## Contract Versioning

The Git history is the initial source of contract evolution.

API path versioning, artifact versioning, and compatibility policies should be defined when the first external API contract is created.

This repository should not introduce a versioning mechanism before there is an actual contract that requires it.

## Security

Contracts must never contain:

- credentials;
- access keys;
- private API keys;
- secret tokens;
- production passwords;
- private infrastructure secrets.

Security mechanisms may be described structurally through OpenAPI security schemes when applicable, but secret values must remain outside version control.

## Contract Principle

A contract should be precise enough for independent consumers and implementations to agree on observable behavior without requiring knowledge of each other's internal code.

The contract defines the interface.

The implementation fulfills it.
