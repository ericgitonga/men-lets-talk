import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { ContactForm } from "./ContactForm";
import { WHATSAPP_NUMBER, WHATSAPP_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/contactInfo";

export const metadata = {
  title: "Let's Talk. | Men Let's Talk",
  description: "Contact Men Let's Talk.",
};

export default function ContactPage() {
  return (
    <main data-testid="contact-page" className="mx-auto max-w-2xl px-6 py-16">
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="text-3xl font-bold">Let&apos;s Talk.</h1>

      <div className="mt-6 space-y-2 text-neutral-700">
        <p>
          WhatsApp:{" "}
          <a href={WHATSAPP_URL} className="underline">
            {WHATSAPP_NUMBER}
          </a>
        </p>
        <p>
          Instagram:{" "}
          <a href={INSTAGRAM_URL} className="underline">
            @{INSTAGRAM_HANDLE}
          </a>
        </p>
      </div>

      <ContactForm />

      <p className="mt-6 text-sm text-neutral-500">
        See our <Link href="/privacy" className="underline">Privacy Notice</Link> for how we
        handle the information you share with us.
      </p>
    </main>
  );
}
