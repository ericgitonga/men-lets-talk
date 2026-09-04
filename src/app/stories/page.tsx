import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { PortableText } from "next-sanity";
import { VideoEmbed } from "@/components/VideoEmbed";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import {
  STORIES_QUERY,
  TOPIC_LABELS,
  type SanityStory,
} from "@/sanity/lib/queries";
import storiesLaughing from "@/assets/community/stories-laughing.jpg";

export const revalidate = 60;

export const metadata = {
  title: "Real Men. Real Stories. Real Conversations. | Men Let's Talk",
  description: "Stories from men navigating life, shared with their consent.",
};

async function getStories(): Promise<SanityStory[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no stories" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(STORIES_QUERY);
  } catch (error) {
    console.error("Failed to fetch stories from Sanity:", error);
    return [];
  }
}

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <main data-testid="stories-page" className="mx-auto max-w-3xl px-6 py-16">
      <div className="relative -mx-6 mb-10 h-56 overflow-hidden rounded-lg sm:h-72">
        <Image
          src={storiesLaughing}
          alt="A group of Men Let's Talk members laughing together at a table"
          fill
          placeholder="blur"
          className="object-cover"
        />
      </div>
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Stories" }]}
      />
      <h1 className="text-3xl font-bold">Real Men. Real Stories. Real Conversations.</h1>

      <p data-testid="signature-statement" className="mt-6 text-center text-xl font-bold text-neutral-800">
        Your story matters.
      </p>

      <div className="mt-6 text-center">
        <Link
          href="/share-your-story"
          className="inline-block rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white"
        >
          Share Your Story →
        </Link>
      </div>

      {stories.length === 0 ? (
        <p data-testid="stories-empty-state" className="mt-8 text-neutral-600">
          No stories are shared here yet — check back soon.
        </p>
      ) : (
        <ul data-testid="stories-list" className="mt-8 space-y-10">
          {stories.map((story) => (
            <li id={story._id} key={story._id} data-testid="story-item" className="scroll-mt-24 border-b border-neutral-200 pb-10">
              <p className="mt-1 flex flex-wrap gap-2">
                {story.topics.map((t) => (
                  <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {TOPIC_LABELS[t] ?? t}
                  </span>
                ))}
              </p>
              <p className="mt-3 text-sm font-medium text-neutral-500">
                {story.name || "Anonymous"}
                {story.ageOrCategory ? `, ${story.ageOrCategory}` : ""}
              </p>
              {story.body && story.body.length > 0 && (
                <div className="prose prose-neutral mt-3 max-w-none">
                  <PortableText value={story.body as never} />
                </div>
              )}
              {story.videoUrl && (
                <VideoEmbed url={story.videoUrl} title={`${story.name || "Anonymous"}'s story`} />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
