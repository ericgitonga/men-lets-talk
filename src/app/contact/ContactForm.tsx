"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

type Status = "idle" | "submitting" | "success" | "error";

interface Challenge {
  ts: string;
  seed: string;
  sig: string;
}

function buildJsToken(ts: string, seed: string): string {
  const reversed = seed.split("").reverse().join("");
  return `${reversed}-${ts.slice(-4)}`;
}

export function ContactForm() {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge>({ ts: "", seed: "", sig: "" });
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/contact", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && typeof data.ts === "string") {
          setChallenge({ ts: data.ts, seed: data.seed, sig: data.sig });
        }
      })
      .catch(() => {
        // Ignore network errors during initial challenge hydration
      });
    return () => {
      active = false;
    };
  }, []);

  function markInteracted() {
    if (!interacted) setInteracted(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const jsToken =
      interacted && challenge.ts && challenge.seed
        ? buildJsToken(challenge.ts, challenge.seed)
        : "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          topic: form.get("topic"),
          message: form.get("message"),
          consentGiven: form.get("consentGiven") === "on",
          website: form.get("website"),
          ts: challenge.ts,
          seed: challenge.seed,
          sig: challenge.sig,
          jsToken,
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
      <p data-testid="contact-form-submitted" className="mt-8 text-neutral-700">
        Thanks for reaching out — we&apos;ve received your message and will get back to you soon.
      </p>
    );
  }

  return (
    <form
      data-testid="contact-form"
      onSubmit={handleSubmit}
      onFocus={markInteracted}
      onKeyDown={markInteracted}
      onPointerDown={markInteracted}
      onTouchStart={markInteracted}
      className="mt-8 space-y-4"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
      >
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          defaultValue=""
          tabIndex={-1}
          autoComplete="nope"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-name`} className="block text-sm font-medium">
          Name
        </label>
        <input
          id={`${uid}-name`}
          name="name"
          type="text"
          required
          maxLength={100}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-email`} className="block text-sm font-medium">
          Email
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-phone`} className="block text-sm font-medium">
          Phone
        </label>
        <input
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          maxLength={40}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-topic`} className="block text-sm font-medium">
          What would you like to talk to us about?
        </label>
        <input
          id={`${uid}-topic`}
          name="topic"
          type="text"
          maxLength={160}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-message`} className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          required
          maxLength={5000}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="consentGiven" required className="mt-1" />
        <span>
          I consent to Men Let&apos;s Talk collecting and using this information to respond to my
          enquiry, as described in our{" "}
          <Link href="/privacy" className="underline">
            Privacy Notice
          </Link>
          .
        </span>
      </label>

      {error && (
        <p data-testid="contact-error" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
