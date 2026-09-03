// Plain GROQ strings for now — no TypeGen wired up yet (that needs typegen pointed across the
// mlt-cms/men-lets-talk repo boundary, a bigger setup left for a follow-up if the manually
// written types below drift from the schema).

export const EVENTS_QUERY = /* groq */ `
  *[_type == "event" && dateTime(date) >= dateTime(now())] | order(date asc) {
    _id,
    name,
    "slug": slug.current,
    date,
    location,
    category,
    description,
    image,
    registrationOpen
  }
`;

export type SanityEvent = {
  _id: string;
  name: string;
  slug: string;
  date: string;
  location: string;
  category: string;
  description: string;
  image?: { asset?: { _ref: string } } | null;
  registrationOpen: boolean;
};

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  "mens-breakfast": "Men's Breakfast",
  "mens-conversations": "Men's Conversations",
  "father-son": "Father & Son",
  "father-daughter": "Father & Daughter",
  "mens-dinner": "Men's Dinner",
  retreats: "Retreats",
  "special-forums": "Special Forums",
  "campus-conversations": "Campus Conversations",
  "mentorship-events": "Mentorship Events",
};
