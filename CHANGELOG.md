# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

## [0.28.0] - 2026-09-04

### Added

- Homepage hero (title, supporting message, description, image) now reads from `mlt-cms`'s new
  `siteSettings` singleton (#94, part of the #24 admin/backend audit), so the MLT team can edit
  it in Studio without a developer. Falls back per-field to the original hardcoded copy/image
  whenever the singleton document doesn't exist yet or a field is left empty, so the homepage
  never breaks or goes blank before an admin fills it in.

Verified end-to-end against production Sanity with a real temporary `siteSettings` document
(clearly marked test copy for title/supporting-message/description, image left unset): confirmed
the CMS values override the fallback text while the image correctly falls back per-field, then
deleted it, restoring the pre-launch fallback state.

Other homepage sections (Pillars, "What Are You Carrying?" topics, "Find Your Space" community
features) remain hardcoded — tracked as #95/#96/#97.

## [0.27.0] - 2026-09-04

### Added

- Real event photography (#19, brief section 19) on the About, Let's Talk, Stories and Get
  Involved pages — previously text-only. 4 candid photos, curated from the client's own event
  photo drop (`extras/clients/mlt/assets/`, outside the repo), added as a banner at the top of
  each page: a group portrait for About (brotherhood), a listening circle for Let's Talk, a
  laughing group for Stories, and a small evening gathering for Get Involved. Excluded from the
  drop: 3 promotional flyers (co-branded AI-generated stock imagery, or a different venue's own
  branding) — not the "authentic, not generic stock" photography the brief calls for. The
  homepage hero image (`hero-men-talking.jpg`, added earlier) was already a real photo from the
  same source.

Content gap: the available photo set doesn't yet cover two categories the brief calls for —
fathers with children, and older/younger men together. Real photography reflecting mixed-age
mentoring and family moments still doesn't exist for this site; the underlying `extras/clients/
mlt/assets/` folder should be revisited as the client adds more photos.

## [0.26.0] - 2026-09-04

### Added

- Design system typography (#20, brief section 20): one bold/impactful headline font (Oswald)
  applied sitewide to all headings and the "signature statement" pull-quotes, and one clean/
  readable body font (Inter) for everything else — replacing the unstyled `create-next-app`
  defaults (Geist was loaded but never actually applied; `body` hardcoded plain `Arial`).

## [0.25.1] - 2026-09-04

### Fixed

- `/privacy`'s "How long we keep it" section updated to reflect the client's actual decision on
  #87 (Kenya DPA 2019 compliance review, #28 §5): no fixed retention period for now, data
  deletable on request. Previously said periods were "being finalised," which was no longer
  accurate once the decision was made.

## [0.25.0] - 2026-09-04

### Added

- `/privacy` notice page (#86, from the Kenya DPA 2019 compliance review, #28 §3): controller
  identity, what's collected and why (per collection point), who else sees it (Sanity, Vercel —
  named explicitly), a provisional retention statement (specific periods pending #87), data
  subject rights (access/correct/delete via WhatsApp, 14-day response), and a website-analytics
  note.
- Site-wide footer (`Footer.tsx`): WhatsApp/Instagram details (reused from
  `src/lib/contactInfo.ts`) and a Privacy link, added to every page via `layout.tsx`.
- Privacy Notice link added to the Contact page and to the consent checkboxes on
  `RegisterForm`/`SubscribeForm`/`ShareStoryForm` (previously self-contained, no page existed
  yet). Consent version constants bumped (`-v2`) since the checkbox copy changed.

### Fixed

- The fixed `WhatsAppButton` (bottom-right, every page) directly covered the footer's Privacy
  link once a visitor scrolled to the bottom — found while building this. Fixed with right-side
  clearance on the footer sized to the button's footprint, verified with a regression e2e test
  checking their bounding boxes never overlap.

## [0.24.0] - 2026-09-04

### Added

- Required consent checkboxes on `RegisterForm` and `SubscribeForm` (#85, from the Kenya DPA
  2019 compliance review, #28 §2): "I consent to Men Let's Talk collecting and storing this
  information..." — hard submission blocker, same tier as the existing required fields. Both
  `/api/register` and `/api/subscribe` now require `consentGiven: true` (400 otherwise) and
  stamp `consentVersion`/`consentedAt` on the created Sanity document (mlt-cms v0.7.0's new
  fields on `registration`/`subscriber`, matching the pattern already added to `story` for #68).
  No `/privacy` page exists yet (#86), so the checkbox copy is self-contained rather than
  linking to one — same approach used for #68's consent copy.

Verified end-to-end against production Sanity with real temporary registration and subscription
submissions via the actual API routes: confirmed both landed with `consentGiven`/
`consentVersion`/`consentedAt` stamped correctly, then deleted (along with the temporary test
event used for the registration case).

## [0.23.0] - 2026-09-04

### Added

- Public story-submission flow (#68, "Share Your Story"), unblocked by the Kenya DPA 2019
  compliance review (#28). New `/share-your-story` page (`ShareStoryForm`) collecting name
  (optional), age/category (optional), one or more topics, story text and/or a video link, and
  2 separately-ticked consent checkboxes (general processing + publication, matching
  mlt-cms v0.6.0's new `processingConsentGiven`/`consentVersion`/`consentedAt` fields). New
  `/api/share-story` route validates the submission (topic required, story text or video link
  required, both consents required, length caps) and writes it as a **Sanity draft**
  (`drafts.<id>`), never a published document — the load-bearing moderation control from #28 §8,
  keeping unmoderated public narrative off the live site until the MLT team reviews and
  publishes it in Studio. "Share Your Story →" CTA added to the `/stories` page.
- `src/lib/consent.ts`: `STORY_CONSENT_VERSION`, stamped server-side (never trusted from the
  client) so a later consent-copy rewrite can't retroactively misrepresent what a submitter
  actually agreed to.

Verified end-to-end against production Sanity with a real temporary "Zephyrmoot" submission via
the actual `/api/share-story` route: confirmed it landed as a draft with all consent fields
correctly stamped, confirmed it does **not** appear on the live `/stories` page (the moderation
gate holds), then deleted.

## [0.22.0] - 2026-09-04

### Added

- 2 of the brief's 6 primary CTAs (#21 CALL-TO-ACTION STRATEGY) were missing as literal button
  text: "Attend an Event" (Get Involved's "Attend" card previously read "See Events") and
  "Explore Resources" (new link added on the homepage, right after "What Are You Carrying?",
  into the unfiltered `/resources`). A 3rd, "Find Your Community", was already fixed as a side
  effect of #8 (v0.20.0). The 6th, "Share Your Story", stays intentionally deferred to #68 — a
  real feature (public story submission), not a copy tweak.

## [0.21.0] - 2026-09-04

### Added

- 4 of the brief's 8 signature homepage statements (#22) had never been used anywhere on the
  site: "You don't have to carry it alone." (added to `/talk`), "There is strength in speaking."
  (added to `/get-involved`), "Your story matters." (added to `/stories`), and "Your next
  chapter can be different." (added to `/about`) — placed as visual breaks between each page's
  intro and its main content grid, per the brief's own instruction that these "can be used
  throughout the website as visual breaks."

### Fixed

- The signature statement "Real Men. Real Stories. Real Conversations." had only ever been used
  as its first two-thirds, "Real Men. Real Stories." — on the `/stories` page's title/H1 and the
  homepage stories preview's heading. Extended both to the full three-part statement.

All 8 signature statements from the brief are now used somewhere on the site.

## [0.20.0] - 2026-09-04

### Added

- Homepage "Find Your Space." section (#8 OUR COMMUNITY): the brief specifies a headline, an
  intro line, 4 named "feature" categories (No Man Walks Alone; Older Men Mentoring the Young;
  Men with Children & Families; Men in Campus), and a "Find Your Community →" button — none of
  it existed anywhere on the site. Unlike the events/stories previews (v0.18.0/v0.19.0), these
  4 categories are static brief content, not CMS-driven, so the section always renders
  regardless of whether real community groups exist yet in Sanity (3 of the 4 names
  intentionally match mlt-cms's `communityGroup` schema's `audience` enum wording exactly).
  Placed after the stories preview, completing the homepage's Recognition → Action →
  Connection → Belonging flow before the email signup.

## [0.19.0] - 2026-09-04

### Added

- Homepage "Upcoming Events" teaser (#7 UPCOMING EVENTS): the brief calls for displaying the
  next 3-4 events prominently, each with name/date/location/description and a Register button,
  plus a "View All Events →" button below — none of that existed on the homepage despite
  `/events` being fully built and wired since v0.2.0. Added a 3-event preview reusing the
  existing `EVENTS_QUERY` (already ordered soonest-first) and the existing `RegisterForm`
  component directly, so registration works inline from the homepage without navigating away.
  Hidden entirely, same as the stories preview, when there are no upcoming events.

Verified end-to-end against production Sanity with a real temporary "Zephyrmoot Test Event"
(2099 date, Men's Breakfast category), confirming the card renders correctly and the inline
Register form opens, then deleted.

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
