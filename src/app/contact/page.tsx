import Breadcrumb from "@/components/Breadcrumb";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Let's Talk. | Men Let's Talk",
  description: "Contact Men Let's Talk.",
};

// Real WhatsApp number and Instagram handle confirmed from the client's own event flyers
// (extras/clients/mlt/assets/). No email address or physical location has been provided by
// the client yet — deliberately not shown here rather than fabricated; add once supplied.
const WHATSAPP_NUMBER = "+254720450565";
const INSTAGRAM_HANDLE = "menletstalk254";

export default function ContactPage() {
  return (
    <main data-testid="contact-page" className="mx-auto max-w-2xl px-6 py-16">
      <Breadcrumb data-testid="breadcrumb" items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="text-3xl font-bold">Let&apos;s Talk.</h1>

      <div className="mt-6 space-y-2 text-neutral-700">
        <p>
          WhatsApp:{" "}
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`} className="underline">
            {WHATSAPP_NUMBER}
          </a>
        </p>
        <p>
          Instagram:{" "}
          <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} className="underline">
            @{INSTAGRAM_HANDLE}
          </a>
        </p>
      </div>

      <ContactForm />
    </main>
  );
}
