# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

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
