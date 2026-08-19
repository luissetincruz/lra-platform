# Contact Request Acceptance Criteria

## Purpose

This document defines observable and testable conditions for the initial `contact-request` capability.

The scenarios derive from:

```text
specs/contact-request/spec.md
```

They describe expected behavior without prescribing implementation technologies.

HTTP status codes, persistence technology, queueing mechanisms, email provider, framework choices, and infrastructure details remain outside the scope of these acceptance criteria unless explicitly required by the specification.

## Successful Contact Request

### AC-001 — Accept a valid contact request

**Related requirements:** FR-001, FR-002, FR-003, FR-005

Given a visitor submits all required fields with valid values

And `businessWebsite` is empty

And privacy acceptance is valid

And the submitted privacy policy version is recognized by the platform

And the request is not rate limited

When the contact request is submitted

Then the request is normalized

And the request is persisted

And the request is considered accepted

And the public response indicates:

```json
{
  "accepted": true
}
```

### AC-002 — Persist the normalized request data

**Related requirements:** FR-003, FR-005

Given a legitimate contact request contains values with removable leading or trailing whitespace

When the request is accepted

Then the persisted values use the normalized representations defined by the specification

And internal message formatting is otherwise preserved.

### AC-003 — Normalize an empty company to null

**Related requirements:** FR-003

Given `company` contains only whitespace

When an otherwise valid request is processed

Then `company` is persisted as:

```json
null
```

### AC-004 — Generate identifiers for a persisted request

**Related requirements:** FR-006

Given a legitimate contact request is persisted

Then an internal identifier is generated

And a unique public reference is generated

And the public reference matches:

```text
CR-XXXX
```

And the four variable characters use only:

```text
23456789ABCDEFGHJKLMNPQRSTUVWXYZ
```

And the public reference is not sequential.

### AC-005 — Prevent public exposure of the internal identifier

**Related requirements:** FR-006, NFR-014

Given a legitimate request has been persisted

When the API returns its public success representation

Then the internal identifier is not included in the response.

### AC-006 — Do not expose the public reference in the API success response

**Related requirements:** FR-024, FR-025

Given a legitimate request has been persisted

When the API returns its public success representation

Then the public reference is not included in the response

And the response contains only the public success representation defined by the contract.

## Request Validation

### AC-007 — Reject missing required fields

**Related requirements:** FR-002, FR-004, NFR-002, NFR-004

Given a normally processed request is missing a required top-level field

When the request is submitted

Then the request is rejected as invalid

And no contact request is persisted.

### AC-008 — Reject unknown fields

**Related requirements:** FR-002, FR-004, NFR-005

Given `businessWebsite` is empty

And the request contains a field not defined by the specification

When the request is submitted

Then the request is rejected

And the unknown field is not silently ignored

And no contact request is persisted.

### AC-009 — Reject an invalid email address

**Related requirements:** FR-003, FR-004

Given `email` does not contain a valid email address

When the request is submitted

Then the request is rejected with a field-level validation error for `email`

And no contact request is persisted.

### AC-010 — Reject an invalid phone representation

**Related requirements:** FR-003, FR-004

Given `phone` is not in the required canonical E.164 representation

When the request is submitted

Then the request is rejected with a field-level validation error for `phone`

And the server does not attempt to infer a national telephone format

And no contact request is persisted.

### AC-011 — Reject unsupported service values

**Related requirements:** FR-003, FR-004

Given `service` is not exactly one of:

```text
custom-software
automation-integrations
applied-ai
api-backend
modernization-maintenance
technical-consulting
other
```

When the request is submitted

Then the request is rejected

And no contact request is persisted.

### AC-012 — Enforce case-sensitive service values

**Related requirements:** FR-003, FR-004

Given the canonical service is:

```text
custom-software
```

When a request submits a variation such as:

```text
Custom-Software
```

Then the request is rejected.

### AC-013 — Reject unsupported locales

**Related requirements:** FR-003, FR-026

Given `locale` is not:

```text
pt-BR
```

or:

```text
en
```

When the request is submitted

Then the request is rejected

And no contact request is persisted.

### AC-014 — Enforce text length boundaries

**Related requirements:** FR-003, FR-004, NFR-004

Given any externally supplied text value exceeds its maximum allowed length

When the request is submitted

Then that field fails validation

And the request is not persisted.

The applicable maximum lengths are:

```text
name     120
email    254
company  160
message  2000
```

### AC-015 — Reject empty required text after normalization

**Related requirements:** FR-003, FR-004

Given a required text field such as `name` or `message` contains only whitespace

When normalization is applied

Then the field is considered empty

And the request is rejected.

## Privacy

### AC-016 — Require privacy acceptance

**Related requirements:** FR-027, NFR-010

Given `privacy.accepted` is `false`

When the request is submitted

Then the request is rejected

And no contact request is persisted.

### AC-017 — Reject an unrecognized privacy policy version

**Related requirements:** FR-028, NFR-013

Given `privacy.accepted` is `true`

But `privacy.policyVersion` is not recognized or allowed by the platform

When the request is submitted

Then the request is rejected as invalid

And no contact request is persisted.

### AC-018 — Persist privacy evidence

**Related requirements:** FR-029

Given a legitimate request is accepted

Then the persisted request contains the recognized privacy policy version

And the platform generates `privacyAcceptedAt`

And the authoritative acceptance timestamp is not taken from the browser.

## Automated-Submission Detection

### AC-019 — Silently discard a detected automated submission

**Related requirements:** FR-016, FR-017, FR-018, NFR-006

Given the request body can be interpreted sufficiently to inspect `businessWebsite`

And `businessWebsite` contains a value

When the request is processed

Then the submission is treated as automated

And no contact request is persisted

And no internal notification is initiated

And no visitor confirmation is initiated

And no analytics lead event is initiated

And the public response is:

```json
{
  "accepted": true
}
```

### AC-020 — Automated-submission detection takes precedence over normal validation

**Related requirements:** FR-018, NFR-005

Given a parseable request contains a populated `businessWebsite`

And one or more other fields would normally fail validation

When the request is processed

Then automated-submission behavior takes precedence

And field-level validation differences are not exposed

And the same public success representation is returned.

### AC-021 — Malformed input does not receive simulated success

**Related requirements:** FR-004, NFR-002

Given the request body cannot be interpreted sufficiently to evaluate the expected structured payload

When the request is processed

Then it is treated as invalid

And automated-submission simulated-success behavior is not applied.

## Persistence and Operational State

### AC-022 — Initialize notification processing state

**Related requirements:** FR-007, FR-008

Given a legitimate request has just been persisted

Then:

```text
internalNotificationStatus = pending
internalNotificationAttempts = 0

visitorConfirmationStatus = pending
visitorConfirmationAttempts = 0
```

### AC-023 — Initialize analytics state with consent and attribution

**Related requirements:** FR-011

Given analytics consent is `true`

And both analytics identifiers are available

When the legitimate request is persisted

Then:

```text
analyticsStatus = pending
analyticsAttempts = 0
```

### AC-024 — Initialize analytics state without consent

**Related requirements:** FR-012

Given analytics consent is `false`

When the legitimate request is persisted

Then:

```text
analyticsStatus = not_applicable
analyticsAttempts = 0
```

And no `generate_lead` event is initiated.

### AC-025 — Analytics identifiers unavailable do not invalidate the lead

**Related requirements:** FR-013, NFR-012

Given analytics consent is `true`

But one or both analytics identifiers are unavailable

And all non-analytics requirements are valid

When the request is processed

Then the contact request is persisted

And notification processing proceeds normally

And:

```text
analyticsStatus = failed
analyticsAttempts = 0
```

And no analytics delivery attempt is made

And the request remains accepted.

### AC-026 — Persist website as the initial source

Given a legitimate request is persisted through the public website

Then:

```text
source = website
```

And the value is generated by the backend rather than supplied by the visitor.

## Internal Notification

### AC-027 — Initiate an internal notification

**Related requirements:** FR-007

Given a legitimate request has been persisted

Then the internal LRA Software notification process is initiated.

### AC-028 — Internal notification contains required contact information

**Related requirements:** FR-007

Given an internal notification is generated

Then it contains:

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

And it does not contain the internal identifier

And it does not contain notification attempt counters or processing statuses.

### AC-029 — Render missing company clearly

Given a persisted request has:

```text
company = null
```

When the internal notification is generated

Then the company value is represented as:

```text
Empresa: Não informada
```

### AC-030 — Configure reply-to for internal notification

Given an internal notification is generated

Then its sender represents LRA Software

And its configured recipient is the LRA Software contact address

And `Reply-To` uses the visitor's submitted email address.

## Visitor Confirmation

### AC-031 — Initiate a visitor confirmation

**Related requirements:** FR-008

Given a legitimate request has been persisted

Then a visitor confirmation email process is initiated.

### AC-032 — Visitor confirmation uses the request locale

**Related requirements:** FR-026

Given the request locale is `pt-BR`

When the visitor confirmation is generated

Then its visitor-facing content is in Portuguese.

Given the request locale is `en`

When the visitor confirmation is generated

Then its visitor-facing content is in English.

### AC-033 — Visitor confirmation contains the expected information

Given a visitor confirmation is generated

Then it contains:

```text
reference
name
service
message
createdAt
```

And it does not repeat:

```text
email
phone
company
```

### AC-034 — Visitor confirmation subject contains LRA Software and the public reference

Given the request reference is:

```text
CR-7K4M
```

When a Portuguese confirmation is generated

Then the subject follows the conceptual format:

```text
LRA Software — Recebemos sua solicitação — CR-7K4M
```

When an English confirmation is generated

Then the subject follows the conceptual format:

```text
LRA Software — We received your request — CR-7K4M
```

### AC-035 — Confirmation does not promise a response deadline

Given a visitor confirmation is generated

Then it confirms receipt of the request

And it does not promise a specific response time.

## Notification Reliability

### AC-036 — Notification failure does not remove the contact request

**Related requirements:** FR-009

Given a legitimate contact request is already persisted

When the internal notification or visitor confirmation fails

Then the persisted contact request remains valid and retained.

### AC-037 — Retry temporary notification failures

**Related requirements:** FR-010

Given a notification delivery attempt fails with a retryable condition

When retry capacity remains

Then another delivery attempt is scheduled according to the bounded retry strategy

And the corresponding attempt counter is incremented.

### AC-038 — Mark notification as failed after retries are exhausted

**Related requirements:** FR-010

Given notification delivery continues to fail

And the bounded retry strategy is exhausted

Then the corresponding notification status becomes:

```text
failed
```

And the contact request remains persisted.

## Lead Analytics

### AC-039 — Generate a lead event for an eligible request

**Related requirements:** FR-011

Given a legitimate request has been persisted

And analytics consent is `true`

And `analytics.clientId` is available

And `analytics.sessionId` is available

When analytics processing occurs

Then a GA4 `generate_lead` event is initiated

And the originating client and session context are preserved.

### AC-040 — Do not generate analytics without consent

**Related requirements:** FR-012, NFR-010

Given analytics consent is `false`

When the contact request is accepted

Then no `generate_lead` event is generated.

### AC-041 — Do not generate analytics for detected automated submissions

**Related requirements:** FR-017

Given a submission is detected through `businessWebsite`

When it receives the simulated success response

Then no `generate_lead` event is generated.

### AC-042 — Analytics failure does not invalidate the contact request

**Related requirements:** FR-014

Given a legitimate request is already persisted

When analytics delivery fails

Then the contact request remains accepted and persisted.

### AC-043 — Retry eligible analytics failures

**Related requirements:** FR-015

Given an eligible analytics event delivery fails with a retryable condition

When retry capacity remains

Then another delivery attempt is scheduled

And `analyticsAttempts` is incremented.

### AC-044 — Mark analytics as failed after retry exhaustion

**Related requirements:** FR-015

Given an eligible analytics event repeatedly fails

And the bounded retry strategy is exhausted

Then:

```text
analyticsStatus = failed
```

And the persisted contact request remains unaffected.

### AC-045 — Do not permanently persist analytics identifiers

**Related requirements:** NFR-011

Given analytics client and session identifiers are used to deliver or retry an analytics event

When the analytics processing lifecycle no longer requires those identifiers

Then they are not retained as permanent fields of the contact request record.

## Rate Limiting

### AC-046 — Reject requests that exceed the rate limit

**Related requirements:** FR-019

Given the configured request rate has been exceeded

When another contact request is submitted from the affected source

Then the request is rejected with:

```text
rate_limit_exceeded
```

And the request is not persisted

And no notification is initiated

And no analytics event is initiated.

### AC-047 — Communicate retry timing

**Related requirements:** FR-020

Given a request is rate limited

When the response is returned

Then a `Retry-After` value indicates when another attempt may be made.

### AC-048 — Do not persist visitor IP as lead data

**Related requirements:** NFR-009

Given IP information is used for rate limiting or abuse protection

When processing completes

Then the IP address is not persisted as a field of the contact request.

## Duplicate Requests

### AC-049 — Allow legitimate repeated contact information

Given two legitimate requests use the same email address or telephone number

When both requests otherwise satisfy the specification

Then both requests may be persisted

And each receives its own internal identifier

And each receives its own unique public reference.

## Frontend Interaction

### AC-050 — Display a loading state during submission

**Related requirements:** FR-023

Given the visitor submits the form

While the request is in progress

Then a visible loading state is displayed

And the submission control is disabled

And an additional submission cannot be initiated.

### AC-051 — Replace the form after success

**Related requirements:** FR-024

Given the frontend receives:

```json
{
  "accepted": true
}
```

When submission processing completes

Then the contact form is replaced by a success state.

### AC-052 — Do not display the public reference in the success state

**Related requirements:** FR-025

Given a legitimate request has a generated public reference

When the frontend displays its success state

Then the public reference is not shown.

### AC-053 — Preserve form values after validation failure

**Related requirements:** FR-021, FR-022

Given the visitor submits invalid input

When validation fails

Then previously entered values remain available

And invalid fields are individually identified

And field-level translated messages are displayed

And a general validation summary is displayed.

### AC-054 — Allow immediate retry after internal failure

**Related requirements:** FR-021

Given submission fails with `internal_error`

When failure handling completes

Then previously entered values remain available

And the loading state ends

And the submission control is re-enabled

And the visitor may retry.

### AC-055 — Prevent immediate retry after rate limiting

**Related requirements:** FR-020

Given submission fails with `rate_limit_exceeded`

When failure handling completes

Then entered values remain available

And the visitor is informed that immediate retry is not available

And retry timing is derived from `Retry-After`

And the frontend does not hardcode the retry duration.

## Internationalization

### AC-056 — Support Portuguese visitor-facing content

**Related requirements:** FR-026

Given the active locale is:

```text
pt-BR
```

Then visitor-facing form labels, validation feedback, errors, loading state, success state, privacy content, service labels, and confirmation email use Portuguese.

### AC-057 — Support English visitor-facing content

**Related requirements:** FR-026

Given the active locale is:

```text
en
```

Then visitor-facing form labels, validation feedback, errors, loading state, success state, privacy content, service labels, and confirmation email use English.

### AC-058 — Preserve canonical API values across locales

Given the visitor-facing service label is translated

When the request is submitted

Then the API still receives the canonical language-independent `service` value.

## Accessibility

### AC-059 — Associate field errors with their controls

Given a field fails validation

When the frontend displays the validation error

Then the error is programmatically associated with the corresponding form control.

### AC-060 — Make required fields programmatically identifiable

Given a visitor uses assistive technology

When the contact form is inspected

Then required fields can be identified programmatically.

### AC-061 — Expose loading, error, and success state accessibly

Given submission state changes

When loading, failure, validation, or success feedback is displayed

Then the state is available to assistive technologies

And the feedback does not depend solely on visual styling.

### AC-062 — Preserve keyboard interaction

Given a visitor navigates using the keyboard

Then all interactive contact-form controls remain operable without requiring a pointing device.

## Security and Error Handling

### AC-063 — Do not expose application secrets to the browser

**Related requirements:** NFR-001

Given the frontend is loaded or a contact request is submitted

Then backend, AWS, database, email-service, analytics-service, and infrastructure credentials are not exposed to browser code.

### AC-064 — Server-side validation remains authoritative

**Related requirements:** NFR-002

Given client-side validation is bypassed

When invalid data is submitted directly to the API

Then server-side validation independently rejects the invalid data.

### AC-065 — Enforce allowed browser origins

**Related requirements:** NFR-003

Given a browser request originates from an origin not explicitly allowed for the active environment

When the API processes the browser-originated request

Then the origin is not accepted as an authorized frontend origin.

### AC-066 — Do not expose internal errors

**Related requirements:** NFR-014

Given an internal platform failure occurs

When a public error is returned

Then the response does not expose:

```text
stack traces
database errors
infrastructure details
email-provider errors
credentials
secret values
```

## Logging and Privacy

### AC-067 — Produce structured operational logs

Given a persisted request enters notification or analytics processing

When operational events are logged

Then logs contain structured technical context sufficient to trace processing where practical.

### AC-068 — Avoid sensitive contact data in routine logs

**Related requirements:** NFR-008

Given operational processing generates logs

Then routine logs do not contain the full contact message

And do not contain the visitor's full email or telephone number unless strictly required

And do not contain unnecessary personally identifiable information.

### AC-069 — Prefer the public reference for operational correlation

Given a persisted request has a public reference

When operational processing for that request is logged

Then the public reference is used for correlation where practical instead of exposing unnecessary business data.

## Persistence and Retention

### AC-070 — Do not automatically expire accepted contact requests

Given a legitimate contact request has been persisted

When time passes without further business processing

Then the initial capability does not automatically delete or expire that record solely because of age.

## Traceability Principle

Each acceptance criterion should remain traceable to the contact request specification and, where applicable, to functional or non-functional requirement identifiers.

Implementation tests may reference these acceptance criterion identifiers when that improves traceability.

Acceptance criteria define observable expected behavior.

They must not be changed solely to accommodate an implementation that behaves differently from the approved specification.
