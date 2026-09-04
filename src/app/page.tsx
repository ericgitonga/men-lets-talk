import Image from "next/image";
import Link from "next/link";
import heroImage from "@/assets/hero-men-talking.jpg";
import { SubscribeForm } from "@/components/SubscribeForm";
import { RegisterForm } from "@/components/RegisterForm";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import {
  EVENTS_QUERY,
  EVENT_CATEGORY_LABELS,
  HOME_STORIES_PREVIEW_QUERY,
  SITE_SETTINGS_QUERY,
  type SanityEvent,
  type SanitySiteSettings,
  type SanityStoryPreview,
} from "@/sanity/lib/queries";
import { truncate } from "@/lib/text";

export const revalidate = 60;

const PILLARS = [
  { name: "Talk", description: "Create safe spaces for honest conversations." },
  { name: "Connect", description: "Build meaningful relationships and community." },
  { name: "Grow", description: "Equip men to become healthier men, fathers, husbands, leaders and friends." },
  { name: "Lead", description: "Raise men who positively influence their families and communities." },
];

const CARRYING_TOPICS = [
  { label: "Pressure", value: "pressure" },
  { label: "Failure", value: "failure" },
  { label: "Marriage", value: "marriage" },
  { label: "Fatherhood", value: "fatherhood" },
  { label: "Money", value: "money" },
  { label: "Purpose", value: "purpose" },
  { label: "Loneliness", value: "loneliness" },
  { label: "Grief", value: "grief" },
  { label: "Relationships", value: "relationships" },
  { label: "Mental Health", value: "mental-health" },
  { label: "Faith", value: "faith" },
  { label: "Starting Again", value: "starting-again" },
];

// Brief section 8 (OUR COMMUNITY): static "feature" categories, not CMS-driven — same pattern
// as PILLARS/CARRYING_TOPICS above. The 3 audience-specific ones intentionally match mlt-cms's
// communityGroup schema's `audience` enum wording exactly.
const COMMUNITY_FEATURES = [
  {
    name: "No Man Walks Alone",
    description: "A space where men support one another through life's different seasons.",
  },
  {
    name: "Older Men Mentoring the Young",
    description: "Creating intentional relationships between older and younger men.",
  },
  {
    name: "Men with Children & Families",
    description: "Conversations around fatherhood, marriage and family.",
  },
  {
    name: "Men in Campus",
    description: "Helping young men navigate identity, relationships, purpose and life.",
  },
];

// Brief section 7 (UPCOMING EVENTS): "Display the next 3-4 events prominently." Reuses the
// same EVENTS_QUERY as the /events page (already ordered soonest-first) rather than a near-
// duplicate GROQ string, since the only difference is how many of the result are shown.
async function getUpcomingEvents(): Promise<SanityEvent[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no events" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(EVENTS_QUERY);
  } catch (error) {
    console.error("Failed to fetch events from Sanity:", error);
    return [];
  }
}

// Homepage hero content (title, supporting message, description, image) is editable in Studio
// via the siteSettings singleton (mlt-cms#21, men-lets-talk#94) — falls back to the brief's
// original copy/image below whenever the document doesn't exist yet or a field is left empty,
// so the homepage never breaks or goes blank before an admin fills it in.
async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  if (!readToken) return null;

  try {
    return await client.fetch(SITE_SETTINGS_QUERY);
  } catch (error) {
    console.error("Failed to fetch site settings from Sanity:", error);
    return null;
  }
}

async function getStoryPreviews(): Promise<SanityStoryPreview[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no stories" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(HOME_STORIES_PREVIEW_QUERY);
  } catch (error) {
    console.error("Failed to fetch story previews from Sanity:", error);
    return [];
  }
}

export default async function Home() {
  const upcomingEvents = (await getUpcomingEvents()).slice(0, 3);
  const storyPreviews = await getStoryPreviews();
  const siteSettings = await getSiteSettings();
  const heroImageUrl = siteSettings?.heroImage
    ? urlForImage(siteSettings.heroImage).width(1600).height(1200).url()
    : null;

  return (
    <main data-testid="homepage">
      {/* Hero */}
      <section data-testid="hero-section" className="relative px-6 py-32 text-center text-white">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Men gathered in conversation at a Men Let's Talk event"
            fill
            priority
            className="object-cover"
          />
        ) : (
          <Image
            src={heroImage}
            alt="Men gathered in conversation at a Men Let's Talk event"
            fill
            priority
            placeholder="blur"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-neutral-900/70" />
        <div className="relative">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
            {siteSettings?.heroTitle || "No man should walk alone."}
          </h1>
          <p
            data-testid="supporting-message"
            className="mx-auto mt-4 text-sm font-semibold tracking-widest text-neutral-300 uppercase"
          >
            {siteSettings?.heroSupportingMessage || "Talk. Listen. Heal. Grow. Lead."}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-200">
            {siteSettings?.heroDescription ||
              "Men Let's Talk creates safe spaces where men can be honest, heard, supported and equipped to navigate life together."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/get-involved"
              className="rounded-md bg-white px-6 py-3 font-semibold text-neutral-900"
            >
              Join the Conversation
            </Link>
            <Link
              href="/events"
              className="rounded-md border border-white px-6 py-3 font-semibold text-white"
            >
              See Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* What is Men Let's Talk */}
      <section data-testid="what-is-mlt-section" className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-center text-lg text-neutral-700">
          Men Let&apos;s Talk is a movement creating spaces where men can have honest conversations
          about the things we often struggle to talk about.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.name} className="text-center">
              <h3 className="text-lg font-bold uppercase tracking-wide">{pillar.name}</h3>
              <p className="mt-2 text-sm text-neutral-600">{pillar.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/about" className="font-semibold underline">
            Our Story →
          </Link>
        </div>
      </section>

      {/* Signature statement visual break */}
      <section data-testid="signature-statement" className="bg-neutral-100 px-6 py-16 text-center">
        <p className="text-2xl font-bold sm:text-3xl">Strong men need strong community.</p>
      </section>

      {/* What Are You Carrying? */}
      <section data-testid="carrying-section" className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">What Are You Carrying?</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-neutral-600">
          Sometimes the hardest thing for a man is finding a place to say, &ldquo;I&apos;m not
          okay.&rdquo;
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {CARRYING_TOPICS.map((topic) => (
            <Link
              key={topic.value}
              href={`/resources?topic=${topic.value}`}
              className="rounded-lg border border-neutral-200 px-4 py-6 text-center font-medium hover:border-neutral-400"
            >
              {topic.label}
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/resources" className="font-semibold underline">
            Explore Resources →
          </Link>
        </div>
      </section>

      {/* Upcoming events (#7 UPCOMING EVENTS — "display the next 3-4 events prominently").
          Hidden entirely rather than showing an empty state, same reasoning as the stories
          teaser below. */}
      {upcomingEvents.length > 0 && (
        <section data-testid="home-events-section" className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Upcoming Events</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="rounded-lg border border-neutral-200 p-6">
                {event.image && (
                  <Image
                    src={urlForImage(event.image).width(400).height(225).url()}
                    alt={event.name}
                    width={400}
                    height={225}
                    className="mb-4 rounded-lg object-cover"
                  />
                )}
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {EVENT_CATEGORY_LABELS[event.category] ?? event.category}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{event.name}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {new Date(event.date).toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  &middot; {event.location}
                </p>
                <p className="mt-3 text-sm">{event.description}</p>
                {event.registrationOpen && <RegisterForm eventId={event._id} eventName={event.name} />}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/events"
              className="rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white"
            >
              View All Events →
            </Link>
          </div>
        </section>
      )}

      {/* Real stories teaser (#23 THE FEELING WE WANT TO CREATE — "there are other men like
          me"). Hidden entirely rather than showing an empty state — a homepage teaser with
          nothing to preview should just not appear, unlike a dedicated /stories page. */}
      {storyPreviews.length > 0 && (
        <section data-testid="stories-preview-section" className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Real Men. Real Stories. Real Conversations.</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-neutral-600">
            You&apos;re not the only one carrying this. Here&apos;s what other men have shared.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {storyPreviews.map((story) => (
              <div key={story._id} className="rounded-lg border border-neutral-200 p-6">
                <p className="text-sm font-medium text-neutral-500">
                  {story.name || "Anonymous"}
                  {story.ageOrCategory ? `, ${story.ageOrCategory}` : ""}
                </p>
                {story.excerpt && (
                  <p className="mt-3 text-neutral-700">{truncate(story.excerpt, 160)}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/stories" className="font-semibold underline">
              Read more stories →
            </Link>
          </div>
        </section>
      )}

      {/* Find Your Space (#8 OUR COMMUNITY). Static feature categories, not CMS-driven, so —
          unlike the events/stories previews above — this always renders regardless of whether
          any real community groups exist yet in Sanity. */}
      <section data-testid="find-your-space-section" className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Find Your Space.</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-neutral-600">
          Not every man needs the same kind of community.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {COMMUNITY_FEATURES.map((feature) => (
            <div key={feature.name} className="rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-bold uppercase tracking-wide">{feature.name}</h3>
              <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/community"
            className="rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white"
          >
            Find Your Community →
          </Link>
        </div>
      </section>

      {/* Stay Connected — email database (brief section 17) */}
      <section data-testid="stay-connected-section" className="bg-neutral-100 px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-2xl font-bold">Stay Connected</h2>
          <p className="mt-2 text-neutral-600">
            Get updates on events, new resources, and conversations — pick what matters to you.
          </p>
          <div className="mt-6 text-left">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </main>
  );
}
