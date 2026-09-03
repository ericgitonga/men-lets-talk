import Image from "next/image";
import Link from "next/link";
import heroImage from "@/assets/hero-men-talking.jpg";
import { SubscribeForm } from "@/components/SubscribeForm";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { HOME_STORIES_PREVIEW_QUERY, type SanityStoryPreview } from "@/sanity/lib/queries";
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
  const storyPreviews = await getStoryPreviews();

  return (
    <main data-testid="homepage">
      {/* Hero */}
      <section data-testid="hero-section" className="relative px-6 py-32 text-center text-white">
        <Image
          src={heroImage}
          alt="Men gathered in conversation at a Men Let's Talk event"
          fill
          priority
          placeholder="blur"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/70" />
        <div className="relative">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">No man should walk alone.</h1>
          <p
            data-testid="supporting-message"
            className="mx-auto mt-4 text-sm font-semibold tracking-widest text-neutral-300 uppercase"
          >
            Talk. Listen. Heal. Grow. Lead.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-200">
            Men Let&apos;s Talk creates safe spaces where men can be honest, heard, supported and
            equipped to navigate life together.
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
      </section>

      {/* Real stories teaser (#23 THE FEELING WE WANT TO CREATE — "there are other men like
          me"). Hidden entirely rather than showing an empty state — a homepage teaser with
          nothing to preview should just not appear, unlike a dedicated /stories page. */}
      {storyPreviews.length > 0 && (
        <section data-testid="stories-preview-section" className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Real Men. Real Stories.</h2>
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
