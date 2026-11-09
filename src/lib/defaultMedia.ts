import type { SanityEvent, SanityGalleryImage } from "@/sanity/lib/queries";

export const ABOUT_VIDEO_SRC = "/videos/about-men-lets-talk.mp4";
export const ODEK_VIDEO_SRC = "/videos/odek-the-conversation-is-growing.mp4";

export const FALLBACK_EVENTS: SanityEvent[] = [
  {
    _id: "event-mens-garage-2026-11-08",
    name: "Men's Garage: What's Under the Hood?",
    slug: "mens-garage-whats-under-the-hood",
    date: "2026-11-08T10:00:00.000Z",
    location: "Junction Mall",
    category: "special-forums",
    description:
      "The Junction (All About Men) x Men Let's Talk x JimmiGathu Connects presents Men's Garage: What's Under the Hood? Real conversations. Beyond the surface. Tickets KES 1,000 (KES 500 redeemable). Men-only space till 6 PM; free arcade games, F&B offers & Man Utd vs Aston Villa at 19:30.",
    image: null,
    imageUrl: "/images/events/mens-garage-flier.jpg",
    registrationOpen: false,
  },
  {
    _id: "event-son-and-father-dinner-2026-12-12",
    name: "Son & Father Dinner",
    slug: "son-and-father-dinner",
    date: "2026-12-12T15:00:00.000Z",
    location: "Heri Heights Hotel, Kolobot Drive",
    category: "father-son",
    description:
      '"Sons take your fathers out for dinner." An intentional evening of conversation, connection and honour for fathers and sons at Heri Heights Hotel, Kolobot Drive. KES 2,500 per person — limited slots.',
    image: null,
    imageUrl: "/images/events/son-and-father-dinner-flier.jpg",
    registrationOpen: true,
  },
];

export type GalleryAlbumSlug = "mens-garage" | "community-gatherings";

export type GalleryAlbumMeta = {
  slug: GalleryAlbumSlug;
  title: string;
  description: string;
};

export const GALLERY_ALBUMS: GalleryAlbumMeta[] = [
  {
    slug: "mens-garage",
    title: "Men's Garage",
    description:
      "Moments from Men's Garage: What's Under the Hood? at Junction Mall.",
  },
  {
    slug: "community-gatherings",
    title: "Community Gatherings",
    description:
      "Moments from Men Let's Talk conversation circles, breakfasts and brotherhood gatherings.",
  },
];

const MENS_GARAGE_IMAGE_NUMBERS = Array.from({ length: 64 }, (_, idx) =>
  String(idx + 1).padStart(2, "0"),
);

const GALLERY_IMAGE_NUMBERS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "13",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
];

export const FALLBACK_MENS_GARAGE_IMAGES: SanityGalleryImage[] =
  MENS_GARAGE_IMAGE_NUMBERS.map((num) => ({
    _id: `gallery-mens-garage-${num}`,
    album: "mens-garage",
    image: null,
    imageUrl: `/images/gallery/mens-garage/mlt-mg_${num}.jpg`,
    caption: null,
  }));

export const FALLBACK_COMMUNITY_GATHERINGS_IMAGES: SanityGalleryImage[] =
  GALLERY_IMAGE_NUMBERS.map((num) => ({
    _id: `gallery-image-${num}`,
    album: "community-gatherings",
    image: null,
    imageUrl: `/images/gallery/gallery-${num}.jpg`,
    caption: null,
  }));

export const FALLBACK_GALLERY_IMAGES: SanityGalleryImage[] = [
  ...FALLBACK_MENS_GARAGE_IMAGES,
  ...FALLBACK_COMMUNITY_GATHERINGS_IMAGES,
];

export function resolveGalleryAlbum(
  item: SanityGalleryImage,
): GalleryAlbumSlug {
  if (
    item.album === "mens-garage" ||
    item._id.startsWith("gallery-mens-garage-") ||
    item.imageUrl?.includes("/mens-garage/")
  ) {
    return "mens-garage";
  }
  return "community-gatherings";
}

export function getGalleryImagesByAlbum(
  images: SanityGalleryImage[],
  album: GalleryAlbumSlug,
): SanityGalleryImage[] {
  return deduplicateGalleryImages(images).filter(
    (img) => resolveGalleryAlbum(img) === album,
  );
}

export function deduplicateGalleryImages(
  images: SanityGalleryImage[],
): SanityGalleryImage[] {
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const unique: SanityGalleryImage[] = [];

  for (const item of images) {
    const id = item._id;
    const assetRef =
      item.image &&
      typeof item.image === "object" &&
      "asset" in item.image &&
      item.image.asset &&
      typeof item.image.asset === "object" &&
      "_ref" in item.image.asset
        ? String(item.image.asset._ref)
        : null;
    const urlKey = assetRef || item.imageUrl || id;

    if (seenIds.has(id) || seenUrls.has(urlKey)) {
      continue;
    }
    seenIds.add(id);
    seenUrls.add(urlKey);
    unique.push(item);
  }

  return unique;
}

export function filterUpcomingEvents(events: SanityEvent[]): SanityEvent[] {
  const nowMs = Date.now();
  return events.filter((ev) => {
    const ts = Date.parse(ev.date);
    return Number.isNaN(ts) || ts >= nowMs;
  });
}

export function filterPastEvents(events: SanityEvent[]): SanityEvent[] {
  const nowMs = Date.now();
  return events
    .filter((ev) => {
      const ts = Date.parse(ev.date);
      return !Number.isNaN(ts) && ts < nowMs;
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
