import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import aboutBrotherhood from "@/assets/community/about-brotherhood.jpg";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { SITE_SETTINGS_QUERY, type SanitySiteSettings } from "@/sanity/lib/queries";

export const revalidate = 60;

// Fallback only — rendered when siteSettings.values is empty/unset. Editable in Studio via the
// siteSettings singleton (mlt-cms#31, men-lets-talk#105), same pattern as pillars (#95).
const FALLBACK_VALUES = [
  { name: "Honesty", description: "We tell the truth about our journeys." },
  { name: "Community", description: "No man should walk alone." },
  { name: "Growth", description: "We believe men can change and become better." },
  { name: "Responsibility", description: "We take ownership of our lives and influence." },
  { name: "Legacy", description: "We live beyond ourselves." },
  {
    name: "Faith",
    description: "Where appropriate, we recognise the role of faith and spiritual formation in a man's journey.",
  },
];

export const metadata = {
  title: "About | Men Let's Talk",
  description:
    "Men Let's Talk is a digital home where men can find honest conversations, meaningful community, practical resources and opportunities to grow.",
};

// Only siteSettings.values is used on this page — fetching the same shared query as the
// homepage (rather than a narrower one) since it's the canonical query for this singleton.
async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "not configured" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return null;

  try {
    return await client.fetch(SITE_SETTINGS_QUERY);
  } catch (error) {
    console.error("Failed to fetch site settings from Sanity:", error);
    return null;
  }
}

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();
  const values =
    siteSettings?.values && siteSettings.values.length > 0 ? siteSettings.values : FALLBACK_VALUES;

  return (
    <main data-testid="about-page" className="mx-auto max-w-3xl px-6 py-16">
      <div className="relative -mx-6 mb-10 h-56 overflow-hidden rounded-lg sm:h-72">
        <Image
          src={aboutBrotherhood}
          alt="Five Men Let's Talk members standing together, arms around each other's shoulders, laughing"
          fill
          placeholder="blur"
          className="object-cover object-top"
        />
      </div>
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      <h1 className="text-3xl font-bold">About Men Let&apos;s Talk</h1>
      <p className="mt-4 text-lg text-neutral-700">
        Men Let&apos;s Talk is a digital home where men can find honest conversations,
        meaningful community, practical resources and opportunities to grow.
      </p>

      <section data-testid="our-story-section" className="mt-12">
        <h2 className="text-2xl font-bold">Our Story</h2>
        <p className="mt-3 text-neutral-700">
          Men Let&apos;s Talk began as a response to a simple but urgent problem: many men have
          been taught to be strong, provide, protect and remain silent — but very few spaces
          teach men how to process what they carry. What started as a handful of men choosing to
          talk honestly, over tea and around ordinary tables, has grown into a movement — regular
          conversations, breakfasts and retreats where men show up for each other, season after
          season.
        </p>
      </section>

      <section data-testid="our-why-section" className="mt-10">
        <h2 className="text-2xl font-bold">Our Why</h2>
        <p className="mt-3 text-neutral-700">
          Many men have been taught to be strong, provide, protect and remain silent — but very
          few spaces teach men how to process what they carry.
        </p>
      </section>

      <section data-testid="our-vision-section" className="mt-10">
        <h2 className="text-2xl font-bold">Our Vision</h2>
        <p className="mt-3 text-neutral-700">
          A generation of men who are emotionally healthy, connected, responsible and
          intentional about the lives they influence.
        </p>
      </section>

      <p data-testid="signature-statement" className="mt-10 text-center text-xl font-bold text-neutral-800">
        Your next chapter can be different.
      </p>

      <section data-testid="our-mission-section" className="mt-10">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="mt-3 text-neutral-700">
          To create safe spaces where men can talk honestly, build meaningful community and grow
          into healthier men who positively impact their families and communities.
        </p>
      </section>

      <section data-testid="our-values-section" className="mt-10">
        <h2 className="text-2xl font-bold">Our Values</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((value) => (
            <div key={value.name}>
              <h3 className="font-bold uppercase tracking-wide">{value.name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
