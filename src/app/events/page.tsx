import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import { RegisterForm } from "@/components/RegisterForm";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import {
  EVENTS_QUERY,
  EVENT_CATEGORY_LABELS,
  type SanityEvent,
} from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Events | Men Let's Talk",
  description: "Upcoming Men Let's Talk conversations, breakfasts, and retreats.",
};

async function getEvents(): Promise<SanityEvent[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no events" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(EVENTS_QUERY);
  } catch (error) {
    console.error("Failed to fetch events from Sanity:", error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main data-testid="events-page" className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Events" }]}
      />
      <h1 className="text-3xl font-bold">Upcoming Events</h1>

      {events.length === 0 ? (
        <p data-testid="events-empty-state" className="mt-8 text-neutral-600">
          No events are scheduled right now — check back soon.
        </p>
      ) : (
        <ul data-testid="events-list" className="mt-8 space-y-8">
          {events.map((event) => (
            <li id={event._id} key={event._id} data-testid="event-item" className="scroll-mt-24 border-b border-neutral-200 pb-8">
              {event.image && (
                <Image
                  src={urlForImage(event.image).width(800).height(450).url()}
                  alt={event.name}
                  width={800}
                  height={450}
                  className="mb-4 rounded-lg object-cover"
                />
              )}
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                {EVENT_CATEGORY_LABELS[event.category] ?? event.category}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{event.name}</h2>
              <p className="mt-1 text-neutral-600">
                {new Date(event.date).toLocaleDateString("en-KE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                &middot; {event.location}
              </p>
              <p className="mt-3">{event.description}</p>
              {event.registrationOpen && <RegisterForm eventId={event._id} eventName={event.name} />}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
