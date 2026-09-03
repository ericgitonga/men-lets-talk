import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import {
  PARTNERS_QUERY,
  PARTNERSHIP_TYPE_LABELS,
  type SanityPartner,
} from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Partners & Sponsors | Men Let's Talk",
  description: "Organisations partnering with Men Let's Talk to reach more men.",
};

async function getPartners(): Promise<SanityPartner[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no partners" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(PARTNERS_QUERY);
  } catch (error) {
    console.error("Failed to fetch partners from Sanity:", error);
    return [];
  }
}

export default async function PartnersPage() {
  const partners = await getPartners();

  return (
    <main data-testid="partners-page" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Partners &amp; Sponsors</h1>

      {partners.length === 0 ? (
        <p data-testid="partners-empty-state" className="mt-8 text-neutral-600">
          No partners listed here yet — check back soon.
        </p>
      ) : (
        <ul data-testid="partners-list" className="mt-8 space-y-8">
          {partners.map((partner) => (
            <li key={partner._id} data-testid="partner-item" className="border-b border-neutral-200 pb-8">
              {partner.logo && (
                <Image
                  src={urlForImage(partner.logo).width(200).height(120).fit("max").url()}
                  alt={partner.name}
                  width={200}
                  height={120}
                  className="mb-4 object-contain"
                />
              )}
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                {PARTNERSHIP_TYPE_LABELS[partner.partnershipType] ?? partner.partnershipType}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{partner.name}</h2>
              <p className="mt-2">{partner.description}</p>
              {partner.websiteUrl && (
                <a href={partner.websiteUrl} className="mt-3 inline-block underline">
                  Visit website
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
