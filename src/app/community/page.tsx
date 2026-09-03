import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import {
  COMMUNITY_GROUPS_QUERY,
  AUDIENCE_LABELS,
  type SanityCommunityGroup,
} from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Find Your Space | Men Let's Talk",
  description: "Not every man needs the same kind of community — find yours.",
};

async function getCommunityGroups(): Promise<SanityCommunityGroup[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no groups" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(COMMUNITY_GROUPS_QUERY);
  } catch (error) {
    console.error("Failed to fetch community groups from Sanity:", error);
    return [];
  }
}

export default async function CommunityPage() {
  const groups = await getCommunityGroups();

  return (
    <main data-testid="community-page" className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Community" }]}
      />
      <h1 className="text-3xl font-bold">Find Your Space.</h1>
      <p className="mt-4 text-neutral-600">
        Not every man needs the same kind of community — a space where men support one another
        through life&apos;s different seasons.
      </p>

      {groups.length === 0 ? (
        <p data-testid="community-empty-state" className="mt-8 text-neutral-600">
          No community groups listed here yet — check back soon.
        </p>
      ) : (
        <ul data-testid="community-list" className="mt-8 space-y-8">
          {groups.map((group) => (
            <li key={group._id} data-testid="community-item" className="border-b border-neutral-200 pb-8">
              {group.image && (
                <Image
                  src={urlForImage(group.image).width(800).height(450).url()}
                  alt={group.name}
                  width={800}
                  height={450}
                  className="mb-4 rounded-lg object-cover"
                />
              )}
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                {AUDIENCE_LABELS[group.audience] ?? group.audience}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{group.name}</h2>
              <p className="mt-2">{group.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
