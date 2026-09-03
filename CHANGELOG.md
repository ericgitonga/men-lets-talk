# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

## [0.18.0] - 2026-09-04

### Added

- Homepage "Real Men. Real Stories." teaser (#23 THE FEELING WE WANT TO CREATE): audited the
  brief's 5-step emotional journey (Recognition → Safety → Connection → Action → Belonging)
  against the live site. Recognition ("What Are You Carrying?"), Safety (hero copy), and Action
  (event CTAs) were all served, but Connection — "there are other men like me" — had no presence
  on the homepage despite `/stories` existing and being wired. Added a 2-story preview, sourced
  from Sanity (`HOME_STORIES_PREVIEW_QUERY`), between the carrying-topics grid and the email
  signup, hidden entirely rather than showing an empty state when there's nothing to preview
  (production has no real stories published yet). Homepage now revalidates every 60s like the
  other Sanity-backed pages (was previously fully static, with no revalidate window at all).
- `src/lib/text.ts`: extracted the `truncate` helper (previously private to the search page) so
  the homepage preview can reuse it; added unit tests for it.

Verified end-to-end against production Sanity with 2 real temporary "Zephyrmoot" test stories
(consent given), confirming the preview renders correctly and links through to `/stories`, then
deleted — also cleaned up one leftover "Zephyrmoot" story from the #49 search-feature testing
that hadn't been deleted at the time.

## [0.17.1] - 2026-09-03

### Added

- "Church partnerships" as a named path on the /partners page's "why partner" pitch, and its
  label mapping for the matching Sanity `partnershipType` (mlt-cms v0.5.0). Churches are a named
  secondary target audience in the brief (#3) but had no matching partnership category (#76)

## [0.17.0] - 2026-09-03

### Added

- Brief's exact supporting message — "Talk. Listen. Heal. Grow. Lead." — now rendered verbatim
  in the homepage hero, between the core-message headline and the existing subheading (#1). It
  was never actually on the site despite being specified in the brief; added a regression e2e
  test asserting the literal text so it can't quietly drop again.

## [0.16.1] - 2026-09-03

### Fixed

- Mobile-first responsiveness audit (#50): full-viewport audit across 3 mobile widths (360-390px)
  and 12 pages found no horizontal overflow, but two real classes of bugs:
  - The subscribe form's email input and all three register-form inputs had an explicit
    `text-sm` (14px) font-size. iOS Safari auto-zooms the viewport on focus of any input with a
    computed font-size under 16px — jarring UX on forms most visitors fill out on a phone. Fixed
    by dropping the explicit size so they inherit the 16px body font.
  - The mobile hamburger toggle (40x34px) and every mobile nav row (36px tall) were below the
    ~44px minimum comfortable tap target (Apple HIG / Material). Toggle is now a fixed 44x44px
    button; nav rows/CTA use `py-3` instead of `py-2`.

  Added 2 regression e2e tests (`test_mobile_tap_targets_meet_minimum_size`,
  `test_mobile_form_inputs_avoid_ios_safari_zoom`) so these can't silently reappear.

## [0.16.0] - 2026-09-03

### Added

- Site search: a search icon in the header (desktop + mobile) leads to `/search`, which queries
  across events, resources/articles, and stories (respecting the story consent filter) via a
  single GROQ query, grouped results by type, deep-linking to the matching item on its list
  page via a new `id`/`scroll-mt-24` anchor on each list item (closes #49)
- Empty-query prompt and no-results states, both distinct from the loading/error states used
  elsewhere

Verified end-to-end with real temporary content across all 3 types (a distinctively-named
"Zephyrmoot" event/article/story), confirming the search finds and correctly deep-links to
each, then deleted before merging. Caught and fixed a GROQ bug along the way — string slicing
(`text[0...160]`) silently returns null in GROQ (it only applies to arrays); fixed by fetching
the full text and truncating in JS instead.

## [0.15.0] - 2026-09-03

### Added

- Prominent floating WhatsApp button, fixed bottom-right on every page, linking to the client's
  real WhatsApp number (confirmed from their event flyers) via `wa.me` (closes #48)
- `src/lib/contactInfo.ts` — centralizes the real WhatsApp/Instagram contact details (previously
  only defined inline in the Contact page) so this button and future features share one source

## [0.14.0] - 2026-09-03

### Added

- `VideoEmbed` component: recognizes YouTube (`watch?v=`, `youtu.be`, `/embed/`) and Vimeo
  URLs and renders a real responsive inline iframe player, falling back to a plain outbound
  link for unrecognized hosts. Replaces the plain "Watch / Listen" links on `/resources` and
  `/stories`, which only linked out rather than embedding (closes #52)
- Unit tests for the URL-parsing logic (`VideoEmbed.test.ts`)

### Fixed

- Resource downloads now use the `download` HTML attribute so the browser saves the file
  directly instead of possibly opening it inline (closes #53)

Both verified end-to-end with a real temporary article (YouTube video + an uploaded test file
asset) and a real temporary story (YouTube video), confirming actual embeds render and the
download link/attribute work, then deleted before merging.

## [0.13.0] - 2026-09-03

### Added

- Email database: a "Stay Connected" subscribe form on the homepage (email + interest
  checkboxes for events/resources/conversations/newsletters), POSTing to a new
  `/api/subscribe` route that writes a `subscriber` document to Sanity (mlt-cms v0.4.0) via the
  existing write-scoped token — reuses the infrastructure built for event registration (#46).
  Verified end-to-end with real temporary subscriptions (browser flow + raw API), confirmed in
  Sanity, then deleted before merging (closes #47)

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
