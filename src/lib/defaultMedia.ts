import type { SanityEvent, SanityGalleryImage } from "@/sanity/lib/queries";

export const ABOUT_VIDEO_SRC = "/videos/about-men-lets-talk.mp4";

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
    registrationOpen: true,
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
];

export const FALLBACK_GALLERY_IMAGES: SanityGalleryImage[] =
  GALLERY_IMAGE_NUMBERS.map((num) => ({
    _id: `gallery-image-${num}`,
    image: null,
    imageUrl: `/images/gallery/gallery-${num}.jpg`,
    caption: null,
  }));

export function filterUpcomingEvents(events: SanityEvent[]): SanityEvent[] {
  const nowMs = Date.now();
  return events.filter((ev) => {
    const ts = Date.parse(ev.date);
    return Number.isNaN(ts) || ts >= nowMs;
  });
}
