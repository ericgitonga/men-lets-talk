# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

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
