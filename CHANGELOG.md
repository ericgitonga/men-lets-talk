# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

## [0.12.0] - 2026-09-03

### Added

- Event registration: the "Register" CTA on `/events` now opens a real form (name, email,
  phone) that POSTs to a new `/api/register` route, which writes a `registration` document to
  Sanity (mlt-cms v0.3.0) via a write-scoped, server-only token — the MLT team can see/manage
  sign-ups directly in the Studio. Verified end-to-end with a real temporary event and
  registration (both created via the actual browser flow and the raw API, confirmed in Sanity,
  then deleted before merging) (closes #46)
- `SANITY_API_WRITE_TOKEN` (editor-scoped, server-only) added to Vercel
  Production/Preview/Development and `.env.local`, alongside the existing read token

## [0.11.0] - 2026-09-03

### Added

- `/get-involved` page: Attend, Volunteer, Mentor, Partner, Sponsor, Support — each with its
  own CTA linking to Events, Contact, or Partners, replacing the placeholder stub (closes #13,
  part of #45)
- `/contact` page: full form UI (Name, Email, Phone, Topic, Message) plus the client's real
  WhatsApp number and Instagram handle (confirmed from their event flyers). Submission shows a
  "coming soon" message — no email-delivery backend is wired up yet (tracked separately as
  #66); no email address or physical location is shown, since the client hasn't supplied one
  and neither was fabricated (closes #16, part of #45)
- Partners page: added a "Why partner with us?" pitch section (partnership opportunities +
  "Become a Partner" CTA linking to Contact) above the existing partner listing, which is now
  headed "Our Current Partners" (closes #14, part of #45)

### Removed

- `PlaceholderPage.tsx` — no longer used, now that every nav destination has real content

## [0.10.1] - 2026-09-03

### Fixed

- Illegible nav-bar text (and site-wide text-on-light-background contrast) for visitors on a
  dark-mode browser/OS — removed `create-next-app`'s default `prefers-color-scheme: dark` auto
  switch, which flipped text near-white while every component still hardcodes a light
  background. This project has one intentional light theme; no dark-mode design exists yet.
  Reported by the client with a screenshot. Added a regression e2e test that checks nav text
  luminance under emulated dark color-scheme (closes #64)

## [0.10.0] - 2026-09-03

### Added

- `/talk` page ("Let's Talk" content hub): 7 topic categories with their sub-topics from the
  brief, each linking into `/resources?topic=X`, replacing the placeholder stub (closes #11,
  part of #44)
- Breadcrumb navigation (`Home > <Page>`) wired into every top-level page via the scaffold's
  previously-unused `Breadcrumb.tsx` component (closes #62)

### Closed

- #9 (Stories) and #10 (Resources) — substantively satisfied by the existing wiring work
  (v0.3.0/v0.4.0); see issue comments for the minor deferred/modelling notes on each

## [0.9.0] - 2026-09-03

### Added

- `/about` page: Our Story, Our Why, Our Vision, Our Mission, and Our Values (6 values),
  replacing the placeholder stub, with the site's one-sentence description (closes #12, closes
  #26, part of #42)

## [0.8.0] - 2026-09-03

### Added

- Site navigation (`Header.tsx`): sticky desktop bar, mobile hamburger menu (closes on
  Escape or outside click), all 8 brief nav links plus a "Join the Conversation" CTA (closes
  #4, part of #43)
- Homepage: hero (real event photo, headline, subheading, dual CTAs), "What is Men Let's Talk"
  section with the four Talk/Connect/Grow/Lead pillars, a signature-statement visual break
  (part of #22 — an ongoing, ambient requirement as more pages ship, not closed by this alone),
  and the "What Are You Carrying?" topic-card grid linking into `/resources?topic=X` (closes
  #5 and #6, part of #43)
- Placeholder pages for `/about`, `/talk`, and `/get-involved` — the three nav destinations
  without real content yet, so no nav link 404s (mirrors the `ndingi` precedent)

## [0.7.0] - 2026-09-03

### Added

- `/books` page, fetching live from Sanity's `book` document type (cover, author, description,
  why-written, purchase link, testimonials), per brief section 15. Verified end-to-end with a
  temporary test book (including a testimonial) created in the Studio and deleted before
  merging (closes #40, part of #41 and #27)

## [0.6.0] - 2026-09-03

### Added

- `/community` page, fetching live from Sanity's `communityGroup` document type (name,
  description, audience, image), per brief section 8 "Find Your Space." Verified end-to-end
  with a temporary test group created in the Studio and deleted before merging (closes #39,
  part of #41 and #27)

## [0.5.0] - 2026-09-03

### Added

- `/partners` page, fetching live from Sanity's `partner` document type (logo, blurb,
  partnership type, website), per brief section 14. Verified end-to-end with a temporary test
  partner created in the Studio and deleted before merging (closes #38, part of #41 and #27)

## [0.4.0] - 2026-09-03

### Added

- `/stories` page, fetching live from Sanity's `story` document type via `next-sanity`'s
  `PortableText`. Only stories with `consentGiven: true` are ever queried — filtered in the
  GROQ query itself as defence in depth alongside the schema's publish-time validation.
  Verified end-to-end with a temporary consented test story (rendered) and a temporary
  non-consented one (correctly excluded), both deleted before merging (closes #37, part of #41
  and #27)
- `@tailwindcss/typography`, for readable Portable Text rendering (`prose` classes)

### Fixed

- Pinned `js-yaml`/`smol-toml`/`uuid` via npm `overrides` — vulnerabilities transitive through
  `next-sanity`'s own Sanity CLI tooling dependency, same issue documented on the
  `ndingi`/`ndingi-foundation` precedent

## [0.3.0] - 2026-09-03

### Added

- `/resources` page, fetching live from Sanity's `article` document type: resource type,
  topics, featured image, video/download links, sorted newest first. Supports filtering by
  topic via a `?topic=` query param (server-rendered), per brief section 10. Verified
  end-to-end with a temporary test article created in the Studio and deleted before merging.
  Same graceful-degradation behaviour as `/events` when no token is configured (closes #34,
  part of #27)

## [0.2.0] - 2026-09-03

### Added

- Sanity client infrastructure (`src/sanity/`) — client, image URL builder, GROQ queries. Reads
  the private `mlt-cms` dataset via a viewer-scoped `SANITY_API_READ_TOKEN`, added to Vercel
  (Production/Preview/Development) and `.env.local`
- `/events` page, fetching live from Sanity's `event` document type, with a 1-minute ISR
  revalidation window. Verified end-to-end with a temporary test event created in the Studio
  and deleted before merging. Gracefully renders an empty state when no token is configured
  (e.g. CI, which runs with zero cloud credentials) rather than failing the build (closes #32,
  part of #27)

## [0.1.0] - 2026-09-03

### Added

- Initial project scaffold: repo, branch protection, CI (e2e gate on every PR), versioning and
  issue-first workflow (closes #30)

tag: `v0.1.0`
