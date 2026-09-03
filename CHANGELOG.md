# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

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
