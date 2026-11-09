import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import {
  FALLBACK_GALLERY_IMAGES,
  GALLERY_ALBUMS,
  deduplicateGalleryImages,
  getGalleryImagesByAlbum,
} from "@/lib/defaultMedia";
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
  if (!readToken) return FALLBACK_GALLERY_IMAGES;

  try {
    const images = await client.fetch<SanityGalleryImage[]>(GALLERY_QUERY);
    return deduplicateGalleryImages(
      images.length > 0 ? images : FALLBACK_GALLERY_IMAGES,
    );
  } catch (error) {
    console.error("Failed to fetch gallery images from Sanity:", error);
    return FALLBACK_GALLERY_IMAGES;
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

      <div
        data-testid="gallery-albums"
        className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2"
      >
        {GALLERY_ALBUMS.map((album) => {
          const albumPhotos = getGalleryImagesByAlbum(images, album.slug);
          const fallbackPhotos = getGalleryImagesByAlbum(
            FALLBACK_GALLERY_IMAGES,
            album.slug,
          );
          const photos =
            albumPhotos.length > 0 ? albumPhotos : fallbackPhotos;
          const coverPhoto = photos[0];
          const coverUrl = coverPhoto?.image
            ? urlForImage(coverPhoto.image).width(900).height(600).url()
            : coverPhoto?.imageUrl || null;

          return (
            <Link
              key={album.slug}
              href={`/gallery/${album.slug}`}
              data-testid="gallery-album-card"
              className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-400 hover:shadow-sm"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100">
                {coverUrl && (
                  <Image
                    src={coverUrl}
                    alt={`${album.title} gallery cover`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-xl font-bold group-hover:underline">
                    {album.title}
                  </h2>
                  <span
                    data-testid="gallery-album-count"
                    className="text-sm font-medium text-neutral-500"
                  >
                    {photos.length} {photos.length === 1 ? "photo" : "photos"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                  {album.description}
                </p>
                <p className="mt-4 text-sm font-semibold text-neutral-900">
                  Open gallery →
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
