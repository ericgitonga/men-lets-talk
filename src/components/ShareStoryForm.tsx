"use client";

import { useState } from "react";
import { WHATSAPP_URL } from "@/lib/contactInfo";
import { TOPIC_LABELS } from "@/sanity/lib/queries";

type Status = "idle" | "submitting" | "success" | "error";

export function ShareStoryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const topics = Object.keys(TOPIC_LABELS).filter((value) => form.get(value) === "on");

    try {
      const res = await fetch("/api/share-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name") || undefined,
          ageOrCategory: form.get("ageOrCategory") || undefined,
          topics,
          storyText: form.get("storyText") || undefined,
          videoUrl: form.get("videoUrl") || undefined,
          processingConsentGiven: form.get("processingConsentGiven") === "on",
          consentGiven: form.get("consentGiven") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <p data-testid="share-story-success" className="mt-8 text-neutral-700">
        Thank you for sharing — your story has been submitted for review. Our team will read it,
        and once approved, it&apos;ll appear on our Stories page.
      </p>
    );
  }

  return (
    <form data-testid="share-story-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name (optional — leave blank to stay anonymous)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={100}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="ageOrCategory" className="block text-sm font-medium">
          Age / category (optional, e.g. &ldquo;34, father of two&rdquo;)
        </label>
        <input
          id="ageOrCategory"
          name="ageOrCategory"
          type="text"
          maxLength={100}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">What&apos;s your story about? (choose at least one)</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-neutral-600 sm:grid-cols-3">
          {Object.entries(TOPIC_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input type="checkbox" name={value} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="storyText" className="block text-sm font-medium">
          Your story (text, video link below, or both)
        </label>
        <textarea
          id="storyText"
          name="storyText"
          rows={6}
          maxLength={5000}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium">
          Video link (optional, e.g. YouTube or Vimeo)
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div className="space-y-3 rounded-md bg-neutral-100 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Before you submit</p>
        <p>
          Every story is reviewed by our team before it&apos;s published — it won&apos;t appear on
          the site right away.
        </p>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="processingConsentGiven" required className="mt-1" />
          <span>I consent to Men Let&apos;s Talk collecting and storing the information I submit in this form.</span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="consentGiven" required className="mt-1" />
          <span>
            I consent to Men Let&apos;s Talk publishing this story — including my name and
            category, if I&apos;ve provided them — on the website and its social channels. It may
            be lightly edited for length or clarity, and I can ask for it to be removed at any
            time by{" "}
            <a href={WHATSAPP_URL} className="underline">
              contacting Men Let&apos;s Talk on WhatsApp
            </a>
            .
          </span>
        </label>
      </div>
      {error && (
        <p data-testid="share-story-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Share Your Story"}
      </button>
    </form>
  );
}
