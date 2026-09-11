import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import { GALLERY_QUERY, type SanityGalleryImage } from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Gallery | Men Let's Talk",
  description: "Photos from Men Let's Talk events, gatherings and community.",
};

async function getGalleryImages(): Promise<SanityGalleryImage[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no photos" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(GALLERY_QUERY);
  } catch (error) {
    console.error("Failed to fetch gallery images from Sanity:", error);
    return [];
  }
}

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <main data-testid="gallery-page" className="mx-auto max-w-5xl px-6 py-16">
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="mt-4 text-neutral-600">
        Moments from Men Let&apos;s Talk events, gatherings and community.
      </p>

      {images.length === 0 ? (
        <p data-testid="gallery-empty-state" className="mt-8 text-neutral-600">
          No photos are shared here yet — check back soon.
        </p>
      ) : (
        <div
          data-testid="gallery-grid"
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {images.map((photo) => (
            <figure
              key={photo._id}
              data-testid="gallery-item"
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
            >
              {photo.image && (
                <Image
                  src={urlForImage(photo.image).width(600).height(600).url()}
                  alt={photo.caption || "Photo from a Men Let's Talk event"}
                  fill
                  className="object-cover"
                />
              )}
              {photo.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-neutral-900/60 px-2 py-1 text-xs text-white">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
