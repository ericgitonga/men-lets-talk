"use client";

import { useState } from "react";

const INTERESTS = [
  { value: "events", label: "Upcoming events" },
  { value: "resources", label: "New resources" },
  { value: "conversations", label: "Men's conversations" },
  { value: "newsletter", label: "Newsletters" },
];

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const interests = INTERESTS.map((i) => i.value).filter((v) => form.get(v) === "on");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), interests }),
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
      <p data-testid="subscribe-success" className="text-sm font-semibold text-neutral-700">
        You&apos;re on the list — thanks for staying connected.
      </p>
    );
  }

  return (
    <form data-testid="subscribe-form" onSubmit={handleSubmit} className="space-y-3">
      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600">
        {INTERESTS.map((interest) => (
          <label key={interest.value} className="flex items-center gap-2">
            <input type="checkbox" name={interest.value} />
            {interest.label}
          </label>
        ))}
      </div>
      {error && (
        <p data-testid="subscribe-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
