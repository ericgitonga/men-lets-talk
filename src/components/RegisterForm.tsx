"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function RegisterForm({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
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
      <p data-testid="register-success" className="mt-4 text-sm font-semibold text-neutral-700">
        You&apos;re registered for {eventName}. See you there!
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        data-testid="register-open-button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-block rounded-md bg-neutral-900 px-5 py-2 text-white"
      >
        Register
      </button>
    );
  }

  return (
    <form data-testid="register-form" onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        name="name"
        type="text"
        placeholder="Name"
        required
        className="w-full rounded-md border border-neutral-300 px-3 py-2"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full rounded-md border border-neutral-300 px-3 py-2"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone (optional)"
        className="w-full rounded-md border border-neutral-300 px-3 py-2"
      />
      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="consentGiven" required className="mt-1" />
        <span>I consent to Men Let&apos;s Talk collecting and storing this information to process my event registration.</span>
      </label>
      {error && (
        <p data-testid="register-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-neutral-900 px-5 py-2 text-sm text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Confirm Registration"}
      </button>
    </form>
  );
}
