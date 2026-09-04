import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import "./globals.css";

// Brief section 20 (TYPOGRAPHY): one bold/impactful headline font, one clean/readable body
// font, nothing more (#20). Oswald's condensed weight carries the brief's own headline example
// ("NO MAN SHOULD WALK ALONE") without tipping into a novelty display face; Inter stays out of
// the way for body copy.
const oswald = Oswald({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Men Let's Talk",
  description:
    "No man should walk alone. Men Let's Talk creates safe spaces where men can be honest, heard, supported and equipped to navigate life together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <WhatsAppButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
