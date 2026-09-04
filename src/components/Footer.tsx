import Link from "next/link";
import { WHATSAPP_NUMBER, WHATSAPP_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/contactInfo";

export function Footer() {
  return (
    <footer data-testid="site-footer" className="border-t border-neutral-200 bg-neutral-50">
      {/* pr-24 (not just px-6): the fixed WhatsAppButton sits bottom-6 right-6 at 56px wide,
          so its footprint always coincides with this row's right edge once a visitor scrolls
          to the footer — reserve enough clearance that footer content is never covered by it. */}
      <div className="mx-auto max-w-6xl py-8 pl-6 pr-24 text-sm text-neutral-600">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>Men Let&apos;s Talk — No man should walk alone.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={WHATSAPP_URL} className="hover:underline">
              WhatsApp: {WHATSAPP_NUMBER}
            </a>
            <a href={INSTAGRAM_URL} className="hover:underline">
              Instagram: @{INSTAGRAM_HANDLE}
            </a>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
