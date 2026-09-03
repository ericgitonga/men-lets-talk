import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import { VideoEmbed } from "@/components/VideoEmbed";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import {
  ARTICLES_QUERY,
  ARTICLES_BY_TOPIC_QUERY,
  RESOURCE_TYPE_LABELS,
  TOPIC_LABELS,
  type SanityArticle,
} from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Resources | Men Let's Talk",
  description: "Articles, videos, podcasts, and discussion guides for men navigating life together.",
};

async function getArticles(topic?: string): Promise<SanityArticle[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no resources" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    if (topic) {
      return await client.fetch(ARTICLES_BY_TOPIC_QUERY, { topic });
    }
    return await client.fetch(ARTICLES_QUERY);
  } catch (error) {
    console.error("Failed to fetch resources from Sanity:", error);
    return [];
  }
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const articles = await getArticles(topic);

  return (
    <main data-testid="resources-page" className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      />
      <h1 className="text-3xl font-bold">You don&apos;t have to figure it all out alone.</h1>

      <nav data-testid="topic-filter" className="mt-6 flex flex-wrap gap-2">
        <a
          href="/resources"
          className={`rounded-full border px-3 py-1 text-sm ${!topic ? "bg-neutral-900 text-white" : "border-neutral-300"}`}
        >
          All
        </a>
        {Object.entries(TOPIC_LABELS).map(([value, label]) => (
          <a
            key={value}
            href={`/resources?topic=${value}`}
            className={`rounded-full border px-3 py-1 text-sm ${topic === value ? "bg-neutral-900 text-white" : "border-neutral-300"}`}
          >
            {label}
          </a>
        ))}
      </nav>

      {articles.length === 0 ? (
        <p data-testid="resources-empty-state" className="mt-8 text-neutral-600">
          No resources here yet — check back soon.
        </p>
      ) : (
        <ul data-testid="resources-list" className="mt-8 space-y-8">
          {articles.map((article) => (
            <li key={article._id} data-testid="resource-item" className="border-b border-neutral-200 pb-8">
              {article.featuredImage && (
                <Image
                  src={urlForImage(article.featuredImage).width(800).height(450).url()}
                  alt={article.title}
                  width={800}
                  height={450}
                  className="mb-4 rounded-lg object-cover"
                />
              )}
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                {RESOURCE_TYPE_LABELS[article.resourceType] ?? article.resourceType}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{article.title}</h2>
              <p className="mt-2 flex flex-wrap gap-2">
                {article.topics.map((t) => (
                  <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {TOPIC_LABELS[t] ?? t}
                  </span>
                ))}
              </p>
              {article.videoUrl && <VideoEmbed url={article.videoUrl} title={article.title} />}
              {article.downloadUrl && (
                <a href={article.downloadUrl} download className="mt-3 inline-block underline">
                  Download
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
