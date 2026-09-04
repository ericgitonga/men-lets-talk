// Plain GROQ strings for now — no TypeGen wired up yet (that needs typegen pointed across the
// mlt-cms/men-lets-talk repo boundary, a bigger setup left for a follow-up if the manually
// written types below drift from the schema).

export const EVENTS_QUERY = /* groq */ `
  *[_type == "event" && dateTime(date) >= dateTime(now())] | order(date asc) {
    _id,
    name,
    "slug": slug.current,
    date,
    location,
    category,
    description,
    image,
    registrationOpen
  }
`;

export type SanityEvent = {
  _id: string;
  name: string;
  slug: string;
  date: string;
  location: string;
  category: string;
  description: string;
  image?: { asset?: { _ref: string } } | null;
  registrationOpen: boolean;
};

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  "mens-breakfast": "Men's Breakfast",
  "mens-conversations": "Men's Conversations",
  "father-son": "Father & Son",
  "father-daughter": "Father & Daughter",
  "mens-dinner": "Men's Dinner",
  retreats: "Retreats",
  "special-forums": "Special Forums",
  "campus-conversations": "Campus Conversations",
  "mentorship-events": "Mentorship Events",
};

// Base filter shared by both branches below — kept as one string so the two queries can't
// silently drift apart on what counts as a listable resource.
const ARTICLE_BASE_FILTER = `_type == "article" && defined(slug.current)`;

export const ARTICLES_QUERY = /* groq */ `
  *[${ARTICLE_BASE_FILTER}] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    resourceType,
    topics,
    featuredImage,
    videoUrl,
    "downloadUrl": downloadFile.asset->url,
    publishedAt
  }
`;

// $topic is interpolated into the filter (not passed as a GROQ param) only for the
// array-membership check below — the value itself is still passed as a bound param, never
// concatenated as a raw string, so this isn't injectable.
export const ARTICLES_BY_TOPIC_QUERY = /* groq */ `
  *[${ARTICLE_BASE_FILTER} && $topic in topics] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    resourceType,
    topics,
    featuredImage,
    videoUrl,
    "downloadUrl": downloadFile.asset->url,
    publishedAt
  }
`;

export type SanityArticle = {
  _id: string;
  title: string;
  slug: string;
  resourceType: string;
  topics: string[];
  featuredImage?: { asset?: { _ref: string } } | null;
  videoUrl?: string | null;
  downloadUrl?: string | null;
  publishedAt: string;
};

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  article: "Article",
  video: "Video",
  podcast: "Podcast",
  "discussion-guide": "Discussion Guide",
  devotional: "Devotional",
  "conversation-starter": "Conversation Starter",
  book: "Book",
  "recommended-resource": "Recommended Resource",
};

export const BOOKS_QUERY = /* groq */ `
  *[_type == "book"] | order(title asc) {
    _id,
    title,
    coverImage,
    author,
    description,
    whyWritten,
    purchaseUrl,
    testimonials
  }
`;

export type SanityBook = {
  _id: string;
  title: string;
  coverImage?: { asset?: { _ref: string } } | null;
  author: string;
  description?: string | null;
  whyWritten?: string | null;
  purchaseUrl?: string | null;
  testimonials?: { _key: string; quote: string; attribution?: string }[] | null;
};

export const COMMUNITY_GROUPS_QUERY = /* groq */ `
  *[_type == "communityGroup"] | order(name asc) {
    _id,
    name,
    description,
    audience,
    image
  }
`;

export type SanityCommunityGroup = {
  _id: string;
  name: string;
  description: string;
  audience: string;
  image?: { asset?: { _ref: string } } | null;
};

export const AUDIENCE_LABELS: Record<string, string> = {
  mentoring: "Older Men Mentoring the Young",
  families: "Men with Children & Families",
  campus: "Men in Campus",
};

export const PARTNERS_QUERY = /* groq */ `
  *[_type == "partner"] | order(name asc) {
    _id,
    name,
    logo,
    description,
    partnershipType,
    websiteUrl
  }
`;

export type SanityPartner = {
  _id: string;
  name: string;
  logo?: { asset?: { _ref: string } } | null;
  description: string;
  partnershipType: string;
  websiteUrl?: string | null;
};

export const PARTNERSHIP_TYPE_LABELS: Record<string, string> = {
  "corporate-wellness": "Corporate Men's Wellness",
  "event-sponsorship": "Event Sponsorship",
  "community-initiatives": "Community Initiatives",
  "mental-health-initiatives": "Mental-Health Initiatives",
  "media-partnerships": "Media Partnerships",
  "church-partnerships": "Church Partnerships",
};

// consentGiven == true is filtered here in the query itself — defence in depth alongside the
// schema's publish-time validation (mlt-cms's story.ts), so a bug or manual API write that
// slips past that validation still can't surface an unconsented story on the site.
export const STORIES_QUERY = /* groq */ `
  *[_type == "story" && consentGiven == true] | order(publishedAt desc) {
    _id,
    name,
    ageOrCategory,
    topics,
    body,
    videoUrl,
    publishedAt
  }
`;

export type SanityStory = {
  _id: string;
  name?: string | null;
  ageOrCategory?: string | null;
  topics: string[];
  body?: unknown[] | null;
  videoUrl?: string | null;
  publishedAt: string;
};

// Homepage teaser (#23 THE FEELING WE WANT TO CREATE — the "CONNECTION" step, "there are other
// men like me"): a couple of real stories, not the full list. `pt::text(body)` then truncate in
// JS, same fix as SEARCH_QUERY/the site search bug (#49) — GROQ string slicing only works on
// arrays, not strings, and silently returns null.
export const HOME_STORIES_PREVIEW_QUERY = /* groq */ `
  *[_type == "story" && consentGiven == true] | order(publishedAt desc) [0...2] {
    _id,
    name,
    ageOrCategory,
    "excerpt": pt::text(body)
  }
`;

export type SanityStoryPreview = {
  _id: string;
  name?: string | null;
  ageOrCategory?: string | null;
  excerpt?: string | null;
};

// Searches across the 3 content types the brief names ("articles, resources, events, and
// stories" — resources are just articles). $q is passed already wildcarded (see the search
// page) — parameterized, so wildcard characters a user types can't break out of the match.
// Stories are filtered to consentGiven == true, same defence-in-depth as STORIES_QUERY.
export const SEARCH_QUERY = /* groq */ `
  {
    "articles": *[_type == "article" && (title match $q || pt::text(body) match $q)]
      | order(publishedAt desc) [0...20] {
        _id, title, "slug": slug.current, resourceType
      },
    "events": *[_type == "event" && (name match $q || description match $q || location match $q)]
      | order(date asc) [0...20] {
        _id, name, "slug": slug.current, location
      },
    "stories": *[_type == "story" && consentGiven == true && (name match $q || pt::text(body) match $q)]
      | order(publishedAt desc) [0...20] {
        _id, name, "excerpt": pt::text(body)
      }
  }
`;

export type SearchResults = {
  articles: { _id: string; title: string; slug: string; resourceType: string }[];
  events: { _id: string; name: string; slug: string; location: string }[];
  stories: { _id: string; name?: string | null; excerpt?: string | null }[];
};

// siteSettings is a Studio singleton (fixed document ID, not queried by _type — see mlt-cms's
// sanity.config.ts) holding homepage content editable without a developer. Fetched by ID rather
// than *[_type == "siteSettings"][0] to match how the Studio itself addresses it.
export const SITE_SETTINGS_QUERY = /* groq */ `
  *[_id == "siteSettings"][0] {
    heroTitle,
    heroSupportingMessage,
    heroDescription,
    heroImage,
    pillars,
    featuredTopics,
    communityFeatures
  }
`;

export type SanitySiteSettings = {
  heroTitle?: string | null;
  heroSupportingMessage?: string | null;
  heroDescription?: string | null;
  heroImage?: { asset?: { _ref: string } } | null;
  pillars?: { name: string; description: string }[] | null;
  featuredTopics?: string[] | null;
  communityFeatures?: { name: string; description: string }[] | null;
};

// Matches mlt-cms's schemaTypes/shared/topics.ts — duplicated here since this repo doesn't
// depend on that one; keep the two in sync by hand if the taxonomy changes.
export const TOPIC_LABELS: Record<string, string> = {
  pressure: "Pressure",
  failure: "Failure",
  marriage: "Marriage",
  fatherhood: "Fatherhood",
  money: "Money",
  purpose: "Purpose",
  loneliness: "Loneliness",
  grief: "Grief",
  relationships: "Relationships",
  "mental-health": "Mental Health",
  masculinity: "Masculinity",
  faith: "Faith",
  "starting-again": "Starting Again",
};
