# PRD: OpenStreetMap Importer & Manual Lead Capture System

## Ethiopian Business Hub (EBH)

---

# Objective

Expand the EBH data acquisition pipeline by introducing:

1. **OpenStreetMap (OSM) Importer**

   * Import Ethiopian/Eritrean businesses from OpenStreetMap.
   * Follow the exact architecture, conventions, and workflows used by the existing Google Places and Companies House importers.

2. **Manual Lead Capture Tool**

   * Enable admins to quickly create pending business records discovered through community outreach, social media, events, flyers, and referrals.
   * Maintain full source attribution and trust-scoring integrity.

---

# Feature 1: OpenStreetMap Importer

## Architecture Requirements

The OSM importer must follow the same patterns already used by:

* Google Places Importer
* Companies House Importer

Reuse existing:

* ImportJob framework
* Source tracking system
* Deduplication engine
* Trust scoring engine
* Import history UI
* Admin permissions model

No bespoke workflows.

---

# Source Registration

Add a new source type:

```ts
source_type = "openstreetmap"
```

## Source Metadata

### source_id

Format:

```text
{osm_element_type}/{osm_id}
```

Examples:

```text
node/123456789
way/987654321
relation/5555555
```

### source_url

Format:

```text
https://www.openstreetmap.org/{type}/{id}
```

Examples:

```text
https://www.openstreetmap.org/node/123456789
https://www.openstreetmap.org/way/987654321
```

---

# Data Licence

OpenStreetMap data is licensed under:

```text
ODbL (Open Database License)
```

Requirements:

* No API key
* No billing
* Attribution retained in source records

---

# Overpass API Configuration

Default endpoint:

```env
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
```

Requirements:

### Environment Variable

Must be configurable via:

```env
OVERPASS_API_URL
```

Purpose:

* Support alternative mirrors
* Mitigate rate limiting
* Support future self-hosted Overpass instances

### Request Throttling

Mandatory:

```text
2 second delay between requests
```

Implementation:

* Centralized rate limiter
* Shared across all OSM import jobs

### Error Handling

Capture and persist:

* HTTP failures
* Overpass timeout responses
* Invalid JSON
* Rate-limit responses
* Network failures

Store in:

```ts
ImportJob.error_log
```

---

# Admin Interface

## Route

```text
/admin/import/openstreetmap
```

### Access

Admin only.

Non-admin users:

```http
403 Forbidden
```

### UI Behaviour

Must visually match:

```text
/admin/import/google-places
```

Include:

* Run Import button
* Job history table
* Last run summary
* Import statistics
* Error reporting panel

---

# OSM Query

Use the following Overpass query exactly:

```ql
[out:json][timeout:120];

area["ISO3166-1"="GB"][admin_level=2]->.uk;

(
  nwr["cuisine"~"ethiopian|eritrean",i](area.uk);

  nwr["name"~"Ethiopian|Eritrean|Habesha|Abyssinia|Addis|Injera|Lalibela|Axum|Sheba|Walia|Nyala",i](area.uk);
);

out center tags;
```

### Notes

Must parse:

* nodes
* ways
* relations

Because:

```ql
out center
```

returns coordinates for ways and relations.

---

# Data Mapping

## Required Mapping Rules

### Name

```ts
name = tags.name
```

Skip records where:

```ts
name == null
```

---

### Coordinates

For nodes:

```ts
lat = element.lat
lng = element.lon
```

For ways/relations:

```ts
lat = element.center.lat
lng = element.center.lon
```

---

### Address

Assemble from:

```text
addr:housenumber
addr:street
addr:city
addr:postcode
```

Example:

```text
123 High Road, London, N17 0AA
```

---

### Phone

Priority order:

```ts
tags.phone
tags["contact:phone"]
```

---

### Website

Priority order:

```ts
tags.website
tags["contact:website"]
```

---

### Opening Hours

```ts
tags.opening_hours
```

---

### Category Signals

Store for enrichment:

```ts
tags.cuisine
tags.amenity
tags.shop
```

---

# Import Rules

## Publishing

All imported businesses must be:

```ts
admin_status = "pending"
```

Nothing auto-publishes.

---

## Deduplication

Run existing deduplication engine.

Check:

### Strong Signals

* name + postcode
* phone number
* website URL

### Geographic Signal

Coordinate proximity:

```text
within 50 metres
```

---

## Existing Listing Match

If OSM record matches:

* Google Places listing
* Companies House listing
* Existing EBH listing

Then:

### DO NOT CREATE DUPLICATE

Instead:

```text
attach source evidence
```

and:

```text
increase trust score
```

---

# Trust Scoring

OSM evidence is weaker than Google Places.

Update trust documentation.

### Scoring

| Source          | Score    |
| --------------- | -------- |
| Google Places   | +30      |
| Companies House | Existing |
| OpenStreetMap   | +10      |
| Manual Lead     | +5       |

### Behaviour

OSM should:

* corroborate
* strengthen confidence

but should not be treated as primary verification.

---

# Import Job Logging

Every run must create an ImportJob record.

Track:

```ts
found_count
imported_count
duplicate_count
skipped_count
error_count
started_at
completed_at
duration_ms
```

Persist raw errors.

---

# Testing Requirements

Implement tests before live integration.

## Fixture Tests

Provide sample Overpass responses covering:

### Node

```json
{
  "type": "node"
}
```

### Way

```json
{
  "type": "way",
  "center": {}
}
```

### Relation

```json
{
  "type": "relation",
  "center": {}
}
```

Verify:

* field mapping
* address assembly
* phone extraction
* website extraction
* source metadata generation
* coordinate extraction

Target:

```text
100% mapping coverage
```

before live API calls.

---

# Success Output

When import completes, report:

```text
Found: X
Imported (Pending): Y
Duplicates: Z
Skipped: N
Errors: E
```

---

# Feature 2: Manual Lead Capture System

## Objective

Allow administrators to quickly add businesses discovered manually from:

* Facebook
* Instagram
* Community groups
* WhatsApp groups
* Events
* Flyers
* Word of mouth

This is:

```text
NOT a scraper
```

It is:

```text
A structured intake workflow
```

---

# Route

```text
/admin/import/leads
```

---

# Access

Admin only.

Non-admin:

```http
403 Forbidden
```

---

# UI Requirements

Match styling of existing importer pages.

Design goals:

* Fast
* Mobile friendly
* Minimal clicks
* Event-friendly

Target:

```text
<20 seconds per entry
```

---

# Form Fields

## Required

### Business Name

```ts
business_name
```

---

### Source Type

Dropdown:

```text
facebook_page
instagram
community_referral
flyer
other
```

---

### Source URL

Public page/profile URL.

Examples:

```text
https://facebook.com/example
https://instagram.com/example
```

---

# Optional Fields

```text
city
category
phone
website
notes
```

---

# Submission Behaviour

On submit:

### Create Listing

```ts
admin_status = "pending"
```

---

### Create Source Record

Capture:

```ts
source_type
source_url
created_by_admin
created_at
```

---

# Deduplication

Before creation:

Run existing dedup engine.

Check:

* name + postcode
* phone
* website

If likely match:

Display warning:

```text
Potential duplicate found.
```

Admin may:

* open existing record
* continue anyway

---

# Trust Scoring

Manual leads start with minimal trust.

Initial score:

```text
+5
```

Meaning:

```text
manually sourced
```

Trust increases only through:

* Google Places match
* Companies House match
* OpenStreetMap match
* Owner claim
* Verification workflow

---

# Session Activity Panel

Show businesses added during current session.

Display:

* Name
* Source Type
* Added Time
* Status

Purpose:

* Prevent duplicate entry
* Provide immediate feedback
* Support rapid onboarding events

---

# Acceptance Criteria

## OpenStreetMap Importer

* Source type added
* Admin page operational
* Overpass integration working
* Mapping tests passing
* Deduplication integrated
* Trust scoring integrated
* Import logging complete

## Manual Lead Capture

* Admin page operational
* Source attribution stored
* Deduplication warning working
* Pending workflow enforced
* Trust scoring integrated
* Session activity list visible

---

# Expected Business Outcome

Increase verified Ethiopian and Eritrean business discovery across the UK without paid APIs by combining:

1. Google Places
2. Companies House
3. OpenStreetMap
4. Manual Community Leads

All data flows into a single moderation queue, strengthening EBH's long-term trust and coverage advantage.
