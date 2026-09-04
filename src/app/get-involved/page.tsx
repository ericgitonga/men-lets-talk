import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import getInvolvedGathering from "@/assets/community/get-involved-gathering.jpg";

const OPTIONS = [
  { name: "Attend", description: "Come to a conversation or event.", cta: "Attend an Event", href: "/events" },
  {
    name: "Volunteer",
    description: "Use your skills and time to serve the movement.",
    cta: "Get in Touch",
    href: "/contact",
  },
  { name: "Mentor", description: "Walk alongside another man.", cta: "Get in Touch", href: "/contact" },
  {
    name: "Partner",
    description: "Partner with Men Let's Talk through your organisation.",
    cta: "Become a Partner",
    href: "/partners",
  },
  {
    name: "Sponsor",
    description: "Help make conversations and programmes accessible to more men.",
    cta: "Become a Sponsor",
    href: "/partners",
  },
  {
    name: "Support",
    description: "Financially support the work of the movement.",
    cta: "Get in Touch",
    href: "/contact",
  },
];

export const metadata = {
  title: "Get Involved | Men Let's Talk",
  description: "There's a place for you here.",
};

export default function GetInvolvedPage() {
  return (
    <main data-testid="get-involved-page" className="mx-auto max-w-4xl px-6 py-16">
      <div className="relative -mx-6 mb-10 h-56 overflow-hidden rounded-lg sm:h-72">
        <Image
          src={getInvolvedGathering}
          alt="A small group of Men Let's Talk members gathered around a table at an evening event"
          fill
          placeholder="blur"
          className="object-cover"
        />
      </div>
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: "Get Involved" }]} />
      <h1 className="text-3xl font-bold">There&apos;s a Place for You Here.</h1>

      <p data-testid="signature-statement" className="mt-10 text-center text-xl font-bold text-neutral-800">
        There is strength in speaking.
      </p>

      <div data-testid="get-involved-options" className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {OPTIONS.map((option) => (
          <div key={option.name} className="rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide">{option.name}</h2>
            <p className="mt-2 text-sm text-neutral-600">{option.description}</p>
            <Link href={option.href} className="mt-4 inline-block text-sm font-semibold underline">
              {option.cta} →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
