import Breadcrumb from "@/components/Breadcrumb";
import { ShareStoryForm } from "@/components/ShareStoryForm";

export const metadata = {
  title: "Share Your Story | Men Let's Talk",
  description: "Your story matters. Share it, with your consent, to help another man feel less alone.",
};

export default function ShareYourStoryPage() {
  return (
    <main data-testid="share-your-story-page" className="mx-auto max-w-2xl px-6 py-16">
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Stories", href: "/stories" }, { label: "Share Your Story" }]}
      />
      <h1 className="text-3xl font-bold">Share Your Story</h1>
      <p className="mt-4 text-neutral-600">
        For the first time, another man might realise he&apos;s not the only one going through
        this — because you shared yours. Your name is optional, and nothing is published without
        your consent.
      </p>

      <ShareStoryForm />
    </main>
  );
}
