import Breadcrumb from "@/components/Breadcrumb";
import { WHATSAPP_URL, WHATSAPP_NUMBER } from "@/lib/contactInfo";

export const metadata = {
  title: "Privacy Notice | Men Let's Talk",
  description: "How Men Let's Talk collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main data-testid="privacy-page" className="mx-auto max-w-2xl px-6 py-16">
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
      <h1 className="text-3xl font-bold">Privacy Notice</h1>
      <p className="mt-4 text-neutral-600">
        This notice explains what personal data Men Let&apos;s Talk collects through this
        website, why, and what rights you have over it. It follows Kenya&apos;s Data Protection
        Act, 2019.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Who we are</h2>
        <p className="mt-3 text-neutral-700">
          Men Let&apos;s Talk is the data controller for the information described here. Reach us
          on{" "}
          <a href={WHATSAPP_URL} className="underline">
            WhatsApp ({WHATSAPP_NUMBER})
          </a>{" "}
          with any question about your data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">What we collect, and why</h2>
        <ul className="mt-3 list-disc space-y-3 pl-5 text-neutral-700">
          <li>
            <strong>Event registration</strong> — your name, email, and phone (optional), so we
            can confirm your place and reach you about the event.
          </li>
          <li>
            <strong>Staying connected</strong> — your email and the update types you choose, so
            we can send you what you&apos;ve asked for and nothing else.
          </li>
          <li>
            <strong>Sharing a story</strong> — your name and age/category (both optional), the
            topics your story covers, and the story itself (text and/or a video link). Every
            story is reviewed by our team before publishing, and only published with your
            explicit consent.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Who else sees it</h2>
        <p className="mt-3 text-neutral-700">
          We use Sanity to store this information and Vercel to host this website. Both are
          based outside Kenya, so your information is processed abroad as part of running this
          site — we rely on their standard data-processing terms as a safeguard for that
          transfer. We don&apos;t sell your data or share it with anyone else.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">How long we keep it</h2>
        <p className="mt-3 text-neutral-700">
          We keep your information only for as long as it&apos;s needed for the purpose it was
          collected. We&apos;re finalising specific retention periods for each type of data
          above — check back here for the confirmed timelines.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Your rights</h2>
        <p className="mt-3 text-neutral-700">
          You can ask us to access, correct, or delete the information we hold about you at any
          time by{" "}
          <a href={WHATSAPP_URL} className="underline">
            messaging us on WhatsApp
          </a>
          . We&apos;ll respond within 14 days.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Website analytics</h2>
        <p className="mt-3 text-neutral-700">
          We use Vercel Analytics and Speed Insights to understand how this site is used and how
          well it performs. These tools collect aggregate visit data, not information that
          identifies you personally.
        </p>
      </section>
    </main>
  );
}
