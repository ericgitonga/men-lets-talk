import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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

type AlbumPageProps = {
  params: Promise<{ album: string }>;
};

export function generateStaticParams() {
  return GALLERY_ALBUMS.map((album) => ({ album: album.slug }));
}

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { album } = await params;
  const albumMeta = GALLERY_ALBUMS.find((a) => a.slug === album);
  if (!albumMeta) {
    return { title: "Gallery | Men Let's Talk" };
  }
  return {
    title: `${albumMeta.title} | Gallery | Men Let's Talk`,
    description: albumMeta.description,
  };
}

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

export default async function GalleryAlbumPage({ params }: AlbumPageProps) {
  const { album } = await params;
  const albumMeta = GALLERY_ALBUMS.find((a) => a.slug === album);
  if (!albumMeta) {
    notFound();
  }

  const allImages = await getGalleryImages();
  const cmsAlbumPhotos = getGalleryImagesByAlbum(allImages, albumMeta.slug);
  const fallbackAlbumPhotos = getGalleryImagesByAlbum(
    FALLBACK_GALLERY_IMAGES,
    albumMeta.slug,
  );
  const images =
    cmsAlbumPhotos.length > 0 ? cmsAlbumPhotos : fallbackAlbumPhotos;

  return (
    <main
      data-testid="gallery-album-page"
      className="mx-auto max-w-5xl px-6 py-16"
    >
      <Breadcrumb
        data-testid="breadcrumb"
        items={[
          { label: "Home", href: "/" },
          { label: "Gallery", href: "/gallery" },
          { label: albumMeta.title },
        ]}
      />
      <h1 className="text-3xl font-bold">{albumMeta.title}</h1>
      <p className="mt-4 text-neutral-600">{albumMeta.description}</p>

      {images.length === 0 ? (
        <p data-testid="gallery-empty-state" className="mt-8 text-neutral-600">
          No photos are shared here yet — check back soon.
        </p>
      ) : (
        <div
          data-testid="gallery-grid"
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {images.map((photo) => {
            const thumbUrl = photo.image
              ? urlForImage(photo.image).width(600).height(600).url()
              : photo.imageUrl || null;
            const fullUrl = photo.image
              ? urlForImage(photo.image).width(1600).fit("max").url()
              : photo.imageUrl || null;
            return (
              <figure
                key={photo._id}
                data-testid="gallery-item"
                className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
              >
                {thumbUrl && fullUrl && (
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                  >
                    <Image
                      src={thumbUrl}
                      alt={
                        photo.caption ||
                        `Photo from ${albumMeta.title} — Men Let's Talk`
                      }
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </a>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </main>
  );
}
