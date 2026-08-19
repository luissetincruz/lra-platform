# Contact Request Capability

## Context

The LRA Software public website currently provides contact through an email link.

The platform needs a structured contact capability that allows visitors to submit project or service inquiries directly through the website while ensuring that valid requests are persisted, can be operationally tracked, and trigger the appropriate follow-up processes.

The capability is named `contact-request` because it represents the platform-level business capability rather than the frontend form used to collect the request.

The initial consumer of this capability is `lra-web`, but the capability should remain independent from a specific user interface.

## Problem Statement

The existing email-based contact flow does not provide reliable control over incoming leads.

It does not guarantee:

- structured and validated contact information;
- persistence of submitted requests;
- traceability through a stable reference;
- controlled notification delivery;
- automated visitor confirmation;
- abuse protection;
- reliable lead analytics;
- consistent multilingual behavior.

The platform must provide a contact request capability that addresses these limitations without introducing unnecessary CRM or sales automation complexity in the initial version.

## Goals

The initial capability must:

- allow a visitor to submit a structured contact request;
- validate all submitted information;
- persist legitimate requests before considering them accepted;
- preserve enough information to allow LRA Software to follow up with the visitor;
- generate a short public reference for each persisted request;
- notify LRA Software about new requests;
- send an automatic confirmation email to the visitor;
- support Portuguese and English visitor experiences;
- provide clear frontend success, loading, validation, rate-limit, and failure states;
- protect the submission flow against basic automated abuse;
- support bounded request rates;
- preserve analytics attribution when analytics consent and the required analytics identifiers are available;
- ensure analytics availability never prevents an otherwise legitimate contact request from being accepted;
- avoid counting detected automated submissions as leads;
- retain operational state for notification and analytics processing;
- maintain evidence of the privacy acceptance associated with the request.

## Non-Goals

The initial version does not include:

- CRM integration;
- n8n workflows;
- WhatsApp notifications;
- automatic sales qualification;
- AI-generated responses;
- file attachments;
- visitor authentication;
- a customer portal;
- marketing mailing-list subscription;
- interactive CAPTCHA;
- automatic lead deduplication;
- a business lifecycle such as `new`, `qualified`, `won`, or `lost`;
- automatic expiration or deletion of persisted contact requests;
- an administrative interface for managing leads.

These capabilities may be introduced later if justified by future requirements.

## Actors and Consumers

### Visitor

A person using the LRA Software public website who wants to contact LRA Software about a project, service, or business need.

### `lra-web`

The initial frontend consumer responsible for collecting visitor input and submitting the contact request to the platform API.

### LRA Software

The internal recipient of contact request notifications.

### Analytics Platform

The existing analytics environment that may receive a `generate_lead` event for a legitimate persisted request when the visitor has granted analytics consent and the analytics context required for attribution is available.

## Request Data

A contact request submission has a fixed structure.

The transport payload contains the following top-level fields:

```text
name
email
phone
company
service
message
locale
businessWebsite
privacy
analytics
```

All top-level fields must be present.

For submissions that proceed through normal validation, unknown fields must cause the request to be rejected.

Automated-submission detection has precedence over normal field validation when the request body can be parsed as a JSON object and `businessWebsite` is present and populated. In that case, the automated-submission behavior defined later in this specification applies without exposing validation differences that could reveal the detection mechanism.

A request body that cannot be parsed as the expected structured payload is handled as an invalid request and does not receive automated-submission success behavior.

### `name`

`name` represents the visitor's name.

Rules:

- required;
- string;
- leading and trailing whitespace is removed before validation;
- must not be empty after normalization;
- maximum length of 120 characters.

The capability uses a single name field rather than separate first-name and last-name fields.

### `email`

`email` represents the visitor's contact email address.

Rules:

- required;
- string;
- leading and trailing whitespace is removed before validation;
- must be a valid email address;
- maximum length of 254 characters.

Email confirmation through a second input field is not required.

### `phone`

`phone` represents the visitor's contact telephone number.

Rules:

- required;
- string;
- leading and trailing whitespace is removed before validation;
- must use the canonical E.164 representation;
- must begin with `+`;
- may contain at most 15 digits after `+`.

Example:

```text
+5585999999999
```

The frontend may present formatting, masking, or country-selection controls to assist the visitor.

Before submission, the frontend must convert the displayed value to the canonical E.164 representation.

The server remains authoritative for validation and must reject phone values that are not valid according to the required canonical representation rather than attempting to infer or rewrite arbitrary national formatting.

### `company`

`company` represents the visitor's company or organization.

Rules:

- the field is required in the payload;
- the value may be a string or `null`;
- when provided as a string, leading and trailing whitespace is removed;
- maximum length of 160 characters;
- an empty or whitespace-only value is normalized to `null`.

Example when no company is provided:

```json
{
  "company": null
}
```

### `service`

`service` identifies the type of need associated with the contact request.

It must contain exactly one of the following canonical values:

```text
custom-software
automation-integrations
applied-ai
api-backend
modernization-maintenance
technical-consulting
other
```

The values are case-sensitive.

The API contract uses these canonical values independently from the translated labels presented by the frontend.

The frontend and email templates may display localized human-readable labels.

### `message`

`message` contains the visitor's description of the project, problem, or need.

Rules:

- required;
- string;
- leading and trailing whitespace is removed;
- must not be empty after normalization;
- maximum length of 2,000 characters.

Internal whitespace, line breaks, punctuation, capitalization, and message content must otherwise be preserved.

### `locale`

`locale` represents the visitor experience from which the request originated.

Supported values are:

```text
pt-BR
en
```

The field is required.

The frontend derives this value from the active site locale rather than asking the visitor to select it manually.

`locale` provides interaction context and must not be treated as an identity or security signal.

## Privacy Metadata

The request must contain a `privacy` object.

Its structure is:

```json
{
  "privacy": {
    "accepted": true,
    "policyVersion": "..."
  }
}
```

### `privacy.accepted`

The visitor must explicitly accept the processing of their submitted data for the purpose of responding to the contact request.

Rules:

- required;
- boolean;
- must be `true`.

A request with privacy acceptance missing or set to `false` is invalid.

Privacy acceptance is independent from analytics consent.

### `privacy.policyVersion`

Identifies the version of the privacy policy presented to the visitor when acceptance occurred.

Rules:

- required;
- must identify a privacy policy version recognized by the platform;
- must correspond to a version that the frontend is allowed to present;
- must be validated by the backend before the request is persisted.

A client-provided policy version must not be accepted solely because it is syntactically valid or present in the request.

The exact representation and lifecycle of policy versions will be defined by the corresponding interface contract or platform decision.

### Privacy Evidence

For each persisted legitimate request, the platform must record:

```text
privacyAcceptedAt
privacyPolicyVersion
```

`privacyAcceptedAt` is generated by the backend when the request is persisted.

The browser must not provide the authoritative acceptance timestamp.

`privacyPolicyVersion` must represent the platform-recognized policy version validated during request processing.

## Analytics Metadata

The request must always contain an `analytics` object.

When analytics consent exists and the required analytics identifiers are available:

```json
{
  "analytics": {
    "consent": true,
    "clientId": "...",
    "sessionId": "..."
  }
}
```

When analytics consent does not exist:

```json
{
  "analytics": {
    "consent": false,
    "clientId": null,
    "sessionId": null
  }
}
```

When analytics consent exists but the required analytics identifiers are unavailable:

```json
{
  "analytics": {
    "consent": true,
    "clientId": null,
    "sessionId": null
  }
}
```

### `analytics.consent`

Rules:

- required;
- boolean.

Analytics consent is optional from the visitor's perspective.

A value of `false` must never prevent a legitimate contact request from being accepted.

A value of `true` expresses permission to generate analytics events when the technical analytics context required to do so is available.

Analytics consent does not guarantee that analytics delivery can occur.

### `analytics.clientId`

The field must always be present.

When `analytics.consent` is `false`, the value must be `null`.

When `analytics.consent` is `true` and the GA4 client identifier is available, it must be provided.

If the identifier is unavailable because analytics was blocked, failed to initialize, or could not otherwise provide the required value, it may be `null`.

The absence of this identifier must not invalidate an otherwise legitimate contact request.

### `analytics.sessionId`

The field must always be present.

When `analytics.consent` is `false`, the value must be `null`.

When `analytics.consent` is `true` and the GA4 session identifier is available, it must be provided.

If the identifier is unavailable because analytics was blocked, failed to initialize, or could not otherwise provide the required value, it may be `null`.

The absence of this identifier must not invalidate an otherwise legitimate contact request.

### Analytics Attribution Availability

A server-side `generate_lead` event is eligible for processing only when:

- analytics consent is `true`;
- both `analytics.clientId` and `analytics.sessionId` are available;
- the contact request is legitimate;
- the contact request has been successfully persisted.

If analytics consent is `true` but either required analytics identifier is unavailable:

- the contact request remains valid;
- the request must still be persisted if all non-analytics requirements are satisfied;
- notification processing must continue normally;
- the analytics event is not attempted;
- analytics inability must be recorded operationally without affecting request acceptance.

### Analytics Data Retention

Analytics client and session identifiers are transport and processing metadata.

They must not be stored as permanent business or operational fields of the contact request record.

When analytics delivery occurs asynchronously or requires retries, these identifiers may be retained temporarily by processing infrastructure only for the time required to deliver or retry the corresponding analytics event.

Temporary processing retention must not convert these identifiers into permanent contact request data.

## Automated-Submission Detection

The initial version uses a honeypot mechanism through the technical `businessWebsite` field.

The field uses a plausible form-field name intended to attract generic automated form fillers.

The field name must not be treated as a security boundary or secret. The mechanism remains effective only as one layer of a broader abuse-protection strategy that also includes server-side validation and rate limiting.

Rules:

- `businessWebsite` is required in the transport payload;
- it is a string;
- legitimate browser submissions must send it empty;
- it is not persisted as lead data;
- it is not included in notifications or confirmation emails.

When the request body can be parsed as a JSON object and `businessWebsite` is present and populated, automated-submission detection takes precedence over normal validation of the remaining fields.

In that situation:

- the request is treated as an automated submission;
- no contact request is persisted;
- no internal notification is generated;
- no visitor confirmation email is generated;
- no analytics lead event is generated;
- the API returns the same public success representation used for an accepted legitimate request.

This behavior intentionally prevents the response from revealing that automated-submission detection occurred.

Malformed request bodies that cannot be interpreted sufficiently to evaluate the technical field remain invalid requests and do not receive simulated success behavior.

The honeypot mechanism is only one layer of abuse protection and operates together with server-side validation and rate limiting.

## Normalization

The system must normalize submitted values before persistence where normalization is explicitly defined by this specification.

At minimum:

```text
name
email
company
message
```

must use their normalized representations before persistence.

Examples:

```text
"  Luis Cruz  " → "Luis Cruz"
"   "            → company = null
```

`phone` is treated differently: after leading and trailing whitespace handling, it must already conform to the canonical E.164 representation required by this specification.

The server must reject an arbitrarily formatted phone value rather than attempting to infer a canonical telephone number from national formatting.

The normalized representation is the value persisted by the platform.

## Persisted Contact Request

A legitimate request becomes accepted only after validation and successful persistence.

A persisted contact request contains at least the following business and operational information:

```text
id
reference
name
email
phone
company
service
message
locale
source
privacyAcceptedAt
privacyPolicyVersion
createdAt
updatedAt

internalNotificationStatus
internalNotificationAttempts

visitorConfirmationStatus
visitorConfirmationAttempts

analyticsStatus
analyticsAttempts
```

### Internal Identifier

`id` is an internal identifier.

Rules:

- generated by the backend;
- unique;
- immutable;
- may be sequential;
- must never be exposed as the public request identifier.

The exact database representation is an implementation decision.

### Public Reference

Every persisted request receives a short public reference.

Format:

```text
CR-XXXX
```

The four-character portion uses the following alphabet:

```text
23456789ABCDEFGHJKLMNPQRSTUVWXYZ
```

This excludes visually ambiguous characters.

Example:

```text
CR-7K4M
```

Rules:

- generated by the backend;
- unique among persisted contact requests;
- immutable;
- non-sequential;
- safe to expose publicly;
- not treated as authentication or as a secret.

If generation produces an existing reference, another reference must be generated.

### Source

The persisted record contains an internal `source` field.

For the initial version:

```text
source = website
```

The value is generated by the backend and is not supplied by the visitor.

This allows future contact sources to be distinguished without changing the meaning of existing records.

### Timestamps

Persisted contact requests contain:

```text
createdAt
updatedAt
```

`createdAt` represents initial persistence and is immutable.

`updatedAt` changes when the persisted record is subsequently modified.

Externally represented timestamps use UTC ISO 8601.

Example:

```text
2026-08-18T23:30:00Z
```

No notification-specific or analytics-specific completion timestamps are required in the initial version.

## Initial Operational State

When a legitimate contact request is persisted, its initial operational state is:

```text
internalNotificationStatus = pending
internalNotificationAttempts = 0

visitorConfirmationStatus = pending
visitorConfirmationAttempts = 0

source = website
```

When analytics consent is granted and both required analytics identifiers are available:

```text
analyticsStatus = pending
analyticsAttempts = 0
```

When analytics consent is not granted:

```text
analyticsStatus = not_applicable
analyticsAttempts = 0
```

When analytics consent is granted but one or both required analytics identifiers are unavailable:

```text
analyticsStatus = failed
analyticsAttempts = 0
```

In this situation no analytics delivery attempt has occurred. The `failed` state represents that the analytics event could not be scheduled because the attribution context required by this capability was unavailable.

This state must not affect contact request acceptance or notification processing.

## Contact Request Acceptance

A legitimate contact request is considered accepted when:

1. its payload is valid;
2. privacy acceptance is valid;
3. the submitted privacy policy version is recognized by the platform;
4. the request is not rejected by rate limiting;
5. automated-submission detection does not classify it as a bot request;
6. the normalized request has been persisted successfully.

Analytics identifier availability is not a requirement for contact request acceptance.

Notification or analytics completion is not required for request acceptance.

Once the request has been successfully persisted, later notification or analytics failures must not invalidate or delete it.

A submission detected through `businessWebsite` is deliberately not considered an accepted legitimate contact request even though it receives the same public success representation.

## Success Representation

The public success representation must not expose the internal identifier or public reference.

The initial response representation is:

```json
{
  "accepted": true
}
```

Both:

- a legitimate persisted request; and
- a request silently discarded because `businessWebsite` was populated

use the same public success representation.

The public response therefore communicates only the outward result of the submission interaction. It must not be interpreted by the consumer as proof that a contact request record necessarily exists.

The public reference remains available through the persisted record and visitor confirmation email for legitimate requests, but is not displayed in the frontend success state.

The exact HTTP status associated with this representation will be defined by the OpenAPI contract.

## Internal Notification

Every legitimate persisted request must initiate an internal notification process for LRA Software.

The initial internal recipient is:

```text
contato@lrasoftware.com
```

The recipient is backend configuration and must not be hardcoded into the public API contract.

The initial sender is:

```text
LRA Software <contato@lrasoftware.com>
```

The `Reply-To` value uses the visitor's submitted email address.

### Internal Notification Subject

The subject follows the conceptual format:

```text
Nova solicitação de contato — CR-7K4M — Luis Cruz
```

### Internal Notification Content

The notification includes:

```text
reference
name
email
phone
company
service
message
locale
createdAt
```

The service category is displayed using its human-readable Portuguese label.

When `company` is `null`, the notification displays:

```text
Empresa: Não informada
```

Operational metadata such as the internal identifier, processing statuses, and attempt counters must not be included.

## Visitor Confirmation

Every legitimate persisted request must initiate an automatic confirmation email to the visitor.

The initial sender is:

```text
LRA Software <contato@lrasoftware.com>
```

The recipient is the visitor's submitted email address.

The `Reply-To` value is:

```text
contato@lrasoftware.com
```

The confirmation email must use the request `locale`:

```text
pt-BR → Portuguese
en    → English
```

### Visitor Confirmation Subject

Portuguese:

```text
LRA Software — Recebemos sua solicitação — CR-7K4M
```

English:

```text
LRA Software — We received your request — CR-7K4M
```

### Visitor Confirmation Content

The email confirms receipt of the request without promising a response deadline.

It includes:

```text
reference
name
service
message
createdAt
```

The service category is displayed using a human-readable label translated according to the request locale.

The confirmation must not repeat:

```text
email
phone
company
```

## Notification Processing

Internal notification and visitor confirmation are independent processing flows.

Each uses the states:

```text
pending
sent
failed
```

The persisted fields are:

```text
internalNotificationStatus
internalNotificationAttempts

visitorConfirmationStatus
visitorConfirmationAttempts
```

The attempt counters begin at `0` and increment for each delivery attempt.

Temporary notification failures must be retried automatically using a bounded retry strategy.

A notification becomes `failed` only after the configured retry strategy is exhausted.

The exact retry count, retry intervals, and delivery technology are implementation decisions to be defined later.

A failure in either notification flow must not invalidate or delete an already persisted contact request.

## Lead Analytics

A legitimate persisted contact request may generate a GA4 `generate_lead` event.

The analytics event is eligible for generation only when:

- `analytics.consent` is `true`;
- `analytics.clientId` is available;
- `analytics.sessionId` is available;
- the contact request is legitimate;
- the request has been successfully persisted.

Detected automated submissions must not generate analytics events.

Requests without analytics consent must not generate `generate_lead`.

Requests with analytics consent but without the complete analytics attribution context must remain valid but must not attempt the `generate_lead` event.

The generated event must preserve the originating GA4 client and session context provided by the frontend.

Analytics event processing occurs outside the critical acceptance path.

Failure or inability to emit the analytics event must never cause the contact request to fail.

### Analytics Operational State

The persisted fields are:

```text
analyticsStatus
analyticsAttempts
```

Supported states are:

```text
not_applicable
pending
sent
failed
```

Their initial meaning is:

```text
not_applicable
→ analytics consent was not granted

pending
→ analytics consent was granted and the required identifiers
  are available, but delivery has not completed

failed
→ analytics consent was granted but delivery ultimately failed,
  or the required analytics attribution context was unavailable

sent
→ the analytics event was delivered successfully
```

Temporary analytics delivery failures must be retried automatically using a bounded retry strategy when an event was eligible for processing.

`analyticsAttempts` begins at `0` and increments for each actual delivery attempt.

If analytics processing cannot begin because the required identifiers are unavailable:

```text
analyticsStatus = failed
analyticsAttempts = 0
```

No retry is required unless the necessary analytics context is available to the processing mechanism.

The exact retry strategy for eligible analytics events is an implementation decision.

Analytics client and session identifiers required for asynchronous delivery or retries may exist temporarily in processing infrastructure, but they must not become permanent fields of the persisted contact request.

## Rate Limiting

The capability must enforce bounded request rates.

When the configured limit is exceeded:

- the request is not persisted;
- no internal notification is generated;
- no visitor confirmation email is generated;
- no lead analytics event is generated;
- the API returns the general error code `rate_limit_exceeded`;
- the response communicates when a new attempt may be made using `Retry-After`.

The exact request threshold and time window will be defined later.

IP information may be used transiently as part of abuse prevention and rate limiting.

IP addresses must not be persisted as fields of the contact request.

## Validation Errors

Invalid request data must produce a stable machine-readable validation representation.

Validation errors associated with individual fields must use stable error codes rather than translated human-readable messages.

Conceptually:

```json
{
  "error": "validation_error",
  "fields": {
    "email": ["invalid_format"],
    "phone": ["invalid_format"]
  }
}
```

The frontend is responsible for translating error codes according to the active locale.

The exact error schema will be defined by the OpenAPI contract.

Automated-submission detection may intentionally bypass normal field-level validation when `businessWebsite` is present and populated, as defined by the automated-submission behavior.

An unrecognized or disallowed `privacy.policyVersion` is a validation failure and must not result in persistence.

## General Errors

The initial general error categories are:

```text
validation_error
rate_limit_exceeded
internal_error
```

Automated-submission detection does not expose a dedicated error category because detected submissions receive the public success representation.

Internal implementation details must never be exposed through public errors.

This includes:

- stack traces;
- database errors;
- infrastructure details;
- email-provider errors;
- secret values.

## Duplicate Requests

The initial capability does not automatically deduplicate contact requests.

A visitor may legitimately submit multiple requests using the same:

```text
email
phone
```

Each legitimate submission creates a distinct persisted contact request with its own internal identifier and public reference.

Abusive repetition is handled by rate limiting rather than uniqueness constraints on contact information.

## Frontend Behavior

### Client-Side Validation

The frontend must validate fields before submission to provide immediate feedback.

Server-side validation remains authoritative.

Client-side validation must not replace backend validation.

### Loading State

While a request is being submitted:

- a visible loading state is presented;
- the submit control is disabled;
- additional submissions are prevented until the request completes.

### Successful Submission

When a submission receives the public success representation:

- the form is replaced by a success state;
- the public reference is not displayed;
- the visitor is informed that the request was received.

Because automated submissions intentionally receive the same public representation, the frontend must not infer additional internal processing state from `accepted: true`.

### Validation Failure

When field validation fails:

- entered values remain preserved;
- invalid fields are individually identified;
- translated field-level messages are displayed;
- a general validation summary is displayed;
- the visitor may correct the fields and submit again.

### Internal Failure

When an `internal_error` occurs:

- entered values remain preserved;
- the loading state ends;
- the submit control becomes available again;
- the visitor may retry immediately.

### Rate-Limit Failure

When `rate_limit_exceeded` occurs:

- entered values remain preserved;
- the loading state ends;
- the visitor is informed that another attempt cannot be made immediately;
- the retry delay is derived from `Retry-After`;
- the frontend must not hardcode the retry duration.

## Internationalization

The capability must support:

```text
pt-BR
en
```

Visitor-facing:

- field labels;
- validation messages;
- general error messages;
- loading state;
- success state;
- privacy acceptance content;
- service labels;
- visitor confirmation email

must use the active locale.

Canonical API values remain language-independent.

## Accessibility

The contact experience must preserve the accessibility standards of the existing public website.

At minimum, the implementation must ensure that:

- required fields are programmatically identifiable;
- validation errors are associated with their corresponding fields;
- loading and submission states are understandable without relying only on visual changes;
- success and error feedback is accessible to assistive technologies;
- keyboard interaction remains supported.

The implementation must not reduce the existing accessibility quality of `lra-web`.

## Persistence and Retention

Legitimate accepted contact requests must be persisted.

The initial version does not automatically expire or delete persisted requests.

Automatic retention or purge policies may be introduced later through a deliberate privacy and operational decision.

The absence of automatic expiration does not prevent future administrative deletion capabilities.

The specific persistence technology is not defined by this specification.

## Logging and Observability

The capability must produce structured operational logs sufficient to diagnose processing failures and follow request processing.

Operational logs should use the public request reference and technical event information where practical.

Example conceptual metadata:

```text
reference = CR-7K4M
event = visitor_confirmation_failed
attempt = 2
```

Operational logs must not contain:

- the full contact message;
- the visitor's full email address unless strictly required;
- the visitor's full phone number unless strictly required;
- unnecessary personally identifiable information;
- analytics client or session identifiers unless strictly required for temporary technical diagnostics;
- secrets or credentials.

Sensitive business data belongs in the persisted contact record rather than routine operational logs.

## Security and Privacy Requirements

### NFR-001

No backend, AWS, database, email-service, analytics-service, or infrastructure credential may be exposed to browser code.

### NFR-002

Server-side validation is authoritative for all externally supplied data.

### NFR-003

Browser requests must be accepted only from explicitly allowed origins appropriate to the environment.

### NFR-004

All externally supplied fields and the overall payload must have explicit validation boundaries.

### NFR-005

Unknown fields must be rejected rather than silently ignored for submissions that proceed through normal validation.

Automated-submission detection may intentionally take precedence when `businessWebsite` is present and populated.

### NFR-006

The capability must include basic automated-submission protection.

### NFR-007

The capability must enforce bounded request rates.

### NFR-008

Operational logs must avoid unnecessary personally identifiable information and sensitive contact content.

### NFR-009

IP addresses must not be persisted as contact request data.

### NFR-010

Privacy acceptance must be required independently from optional analytics consent.

### NFR-011

Analytics identifiers must not be permanently retained as fields of the contact request.

Temporary retention in processing infrastructure is allowed only for the time required to deliver or retry an eligible analytics event.

### NFR-012

Analytics identifier availability must not determine whether an otherwise legitimate contact request can be accepted.

### NFR-013

The submitted privacy policy version must be validated against versions recognized by the platform before persistence.

### NFR-014

Public errors must not expose internal implementation details.

## Functional Requirements

### FR-001

A visitor can submit a contact request through the public LRA Software website.

### FR-002

The request must contain the fixed payload structure defined by this specification.

### FR-003

The platform must validate and normalize all submitted contact request data before persistence.

### FR-004

Requests containing invalid business or technical data must not be persisted.

Automated submissions detected through `businessWebsite` are not persisted and follow the simulated-success behavior instead of normal validation responses.

### FR-005

Legitimate valid requests must be persisted before they are considered accepted.

### FR-006

Every persisted request must receive an internal identifier and a unique public reference.

### FR-007

Every persisted request must initiate an internal LRA Software notification process.

### FR-008

Every persisted request must initiate a visitor confirmation email process.

### FR-009

Notification failures must not invalidate or delete an already persisted contact request.

### FR-010

Temporary notification failures must be retried using a bounded retry strategy.

### FR-011

A legitimate persisted request with analytics consent and complete analytics attribution context must initiate a `generate_lead` analytics process associated with the originating analytics client and session.

### FR-012

A request without analytics consent must remain fully valid and must not generate the lead analytics event.

### FR-013

A request with analytics consent but unavailable analytics identifiers must remain fully valid and must not be rejected because analytics attribution cannot be established.

### FR-014

Analytics processing failures must not invalidate or delete an already persisted contact request.

### FR-015

Temporary analytics delivery failures for eligible events must be retried using a bounded retry strategy.

### FR-016

The system must detect basic automated submissions using the initial honeypot mechanism associated with the `businessWebsite` transport field.

### FR-017

A request detected by the automated-submission mechanism must not be persisted or trigger notifications or analytics.

### FR-018

A request detected by the automated-submission mechanism must receive the same public success representation as an accepted legitimate request.

When the request can be parsed sufficiently to evaluate `businessWebsite`, this behavior takes precedence over normal validation of the remaining fields.

### FR-019

The system must reject requests that exceed the configured rate limit.

### FR-020

A rate-limited response must communicate the retry delay.

### FR-021

The frontend must preserve entered values when submission fails.

### FR-022

The frontend must provide field-level validation feedback and a general validation summary.

### FR-023

The frontend must disable additional submissions while a request is in progress.

### FR-024

A successful submission must replace the form with a success state.

### FR-025

The frontend success state must not display the public request reference.

### FR-026

Visitor-facing behavior must support both `pt-BR` and `en`.

### FR-027

The visitor must explicitly accept the applicable privacy policy before a legitimate contact request can be submitted.

### FR-028

The platform must validate that the submitted privacy policy version is recognized before persisting the request.

### FR-029

The platform must retain evidence of the privacy acceptance associated with every persisted request.

## Platform Constraints

The capability is subject to the following existing platform constraints:

- the official HTTP API contract must be defined through OpenAPI before application implementation;
- platform runtime infrastructure introduced for this capability must be defined through Terraform;
- infrastructure and contracts belong to `lra-platform` according to ADR-0001;
- application-specific frontend implementation belongs to `lra-web`;
- application-specific backend implementation belongs to `lra-api`;
- no application secrets may be exposed to the browser.

This specification intentionally does not select the backend framework, persistence technology, runtime architecture, email provider, queue technology, or deployment strategy.

## Dependencies

The capability depends on:

- the existing `lra-web` locale and consent mechanisms;
- a future backend API implementation;
- persistent storage for accepted contact requests;
- an email delivery capability;
- the existing GA4 environment for optional lead analytics;
- platform infrastructure capable of supporting the required processing and observability.

Specific technologies for these dependencies are architectural decisions rather than requirements of this specification unless separately constrained.

## Open Questions

The following questions intentionally remain for later contract or architectural work:

- What HTTP status codes represent success, validation failure, rate limiting, and internal failure?
- What exact OpenAPI error schema will represent field-level validation failures?
- What rate-limit threshold and time window should apply?
- How many retries should notification delivery use?
- What retry intervals should notification delivery use?
- How many retries should analytics delivery use?
- What retry intervals should analytics delivery use?
- Which persistence technology should store contact requests?
- Which mechanism should perform asynchronous notification and analytics processing?
- Which email delivery provider should be used?
- Which backend framework and runtime architecture should implement the API?
- What format and lifecycle should `privacy.policyVersion` use?
- How will the platform determine which privacy policy versions are currently recognized and allowed?
- How should infrastructure state and environments be organized?

These questions must be resolved before implementation when the corresponding implementation depends on them.

## Related Decisions

- `docs/adr/0001-define-repository-architecture.md`

## Next Artifacts

After this specification is reviewed and accepted, the next artifact is:

```text
specs/contact-request/acceptance-criteria.md
```

The acceptance criteria will translate the requirements in this specification into explicit observable verification scenarios.

The OpenAPI contract and solution-specific ADRs follow only after the specification and acceptance criteria are established.
