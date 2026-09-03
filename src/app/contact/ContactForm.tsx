"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  // No email-delivery backend wired up yet (issue #66) — the form is fully built but
  // submission is a no-op that shows this message, same pattern as event registration.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p data-testid="contact-form-submitted" className="mt-8 text-neutral-700">
        Thanks for reaching out — form submission isn&apos;t wired up yet, but you can reach us
        on WhatsApp in the meantime.
      </p>
    );
  }

  return (
    <form data-testid="contact-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="topic" className="block text-sm font-medium">
          What would you like to talk to us about?
        </label>
        <input
          id="topic"
          name="topic"
          type="text"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-6 py-3 font-semibold text-white"
      >
        Send
      </button>
    </form>
  );
}
