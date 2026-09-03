import Breadcrumb from "@/components/Breadcrumb";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { RESOURCE_TYPE_LABELS, SEARCH_QUERY, type SearchResults } from "@/sanity/lib/queries";
import { truncate } from "@/lib/text";

export const metadata = {
  title: "Search | Men Let's Talk",
  description: "Search articles, resources, events, and stories.",
};

async function search(term: string): Promise<SearchResults> {
  const empty: SearchResults = { articles: [], events: [], stories: [] };

  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no results" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return empty;

  try {
    return await client.fetch(SEARCH_QUERY, { q: `*${term}*` });
  } catch (error) {
    console.error("Failed to search Sanity:", error);
    return empty;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const results = term ? await search(term) : { articles: [], events: [], stories: [] };
  const totalCount = results.articles.length + results.events.length + results.stories.length;

  return (
    <main data-testid="search-page" className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="text-3xl font-bold">Search</h1>

      <form action="/search" method="get" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={term}
          placeholder="Search articles, resources, events, stories…"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-neutral-900 px-5 py-2 font-semibold text-white">
          Search
        </button>
      </form>

      {!term ? (
        <p data-testid="search-prompt" className="mt-8 text-neutral-600">
          Type something above to search across events, resources, and stories.
        </p>
      ) : totalCount === 0 ? (
        <p data-testid="search-empty-state" className="mt-8 text-neutral-600">
          No results for &ldquo;{term}&rdquo; — try a different word.
        </p>
      ) : (
        <div data-testid="search-results" className="mt-8 space-y-10">
          {results.events.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wide text-neutral-500">Events</h2>
              <ul className="mt-3 space-y-2">
                {results.events.map((event) => (
                  <li key={event._id}>
                    <a href={`/events#${event._id}`} className="underline">
                      {event.name}
                    </a>{" "}
                    <span className="text-sm text-neutral-500">— {event.location}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.articles.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wide text-neutral-500">Resources</h2>
              <ul className="mt-3 space-y-2">
                {results.articles.map((article) => (
                  <li key={article._id}>
                    <a href={`/resources#${article._id}`} className="underline">
                      {article.title}
                    </a>{" "}
                    <span className="text-sm text-neutral-500">
                      — {RESOURCE_TYPE_LABELS[article.resourceType] ?? article.resourceType}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.stories.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wide text-neutral-500">Stories</h2>
              <ul className="mt-3 space-y-2">
                {results.stories.map((story) => (
                  <li key={story._id}>
                    <a href={`/stories#${story._id}`} className="underline">
                      {story.name || "Anonymous"}
                    </a>
                    {story.excerpt && (
                      <span className="text-sm text-neutral-500"> — {truncate(story.excerpt, 160)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
