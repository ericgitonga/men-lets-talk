import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import talkListening from "@/assets/community/talk-listening.jpg";

const CATEGORIES = [
  {
    label: "Mental Health",
    topic: "mental-health",
    subtopics: ["Stress", "Anxiety", "Burnout", "Asking for help", "Emotional health"],
  },
  {
    label: "Relationships",
    topic: "relationships",
    subtopics: ["Marriage", "Dating", "Friendship", "Communication", "Conflict"],
  },
  {
    label: "Fatherhood",
    topic: "fatherhood",
    subtopics: ["Being present", "Raising sons", "Raising daughters", "Parenting", "Legacy"],
  },
  {
    label: "Purpose",
    topic: "purpose",
    subtopics: ["Identity", "Career", "Failure", "Starting again", "Leadership"],
  },
  {
    label: "Money",
    topic: "money",
    subtopics: ["Financial pressure", "Work", "Debt", "Investments", "Providing"],
  },
  {
    label: "Masculinity",
    topic: "masculinity",
    subtopics: [
      "What does it mean to be a man?",
      "Vulnerability",
      "Strength",
      "Responsibility",
      "Emotional expression",
    ],
  },
  {
    label: "Faith",
    topic: "faith",
    subtopics: ["God and manhood", "Faith during difficult seasons", "Spiritual leadership", "Purpose"],
  },
];

export const metadata = {
  title: "Let's Talk | Men Let's Talk",
  description: "The content hub — find articles, videos, podcasts and guides on what you're carrying.",
};

export default function TalkPage() {
  return (
    <main data-testid="talk-page" className="mx-auto max-w-4xl px-6 py-16">
      <div className="relative -mx-6 mb-10 h-56 overflow-hidden rounded-lg sm:h-72">
        <Image
          src={talkListening}
          alt="A circle of men in quiet conversation, listening closely to one another"
          fill
          placeholder="blur"
          className="object-cover"
        />
      </div>
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: "Let's Talk" }]} />
      <h1 className="text-3xl font-bold">Let&apos;s Talk</h1>
      <p className="mt-4 text-neutral-600">
        This is the content hub — real conversations, organised by what you&apos;re actually
        carrying.
      </p>

      <p data-testid="signature-statement" className="mt-10 text-center text-xl font-bold text-neutral-800">
        You don&apos;t have to carry it alone.
      </p>

      <div data-testid="talk-categories" className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <div key={category.topic} className="rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide">{category.label}</h2>
            <ul className="mt-3 space-y-1 text-sm text-neutral-600">
              {category.subtopics.map((subtopic) => (
                <li key={subtopic}>{subtopic}</li>
              ))}
            </ul>
            <Link
              href={`/resources?topic=${category.topic}`}
              className="mt-4 inline-block text-sm font-semibold underline"
            >
              See {category.label} resources →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
