import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { writeToken } from "@/sanity/env";
import { SUBSCRIBE_CONSENT_VERSION } from "@/lib/consent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_INTERESTS = new Set(["events", "resources", "conversations", "newsletter"]);

// No rate limiting on this endpoint yet — tracked under the closing adversarial security
// audit (#29, "unrated public write endpoints") rather than built ad hoc here.
export async function POST(request: Request) {
  // Input validation always runs first, regardless of configuration state — see #46's
  // registration route for the same fix (a bad request is a 400 either way).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, interests, consentGiven } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (interests !== undefined) {
    if (!Array.isArray(interests) || !interests.every((i) => typeof i === "string" && VALID_INTERESTS.has(i))) {
      return NextResponse.json({ error: "Invalid interests." }, { status: 400 });
    }
  }
  if (consentGiven !== true) {
    return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  }

  if (!writeToken) {
    return NextResponse.json({ error: "Subscriptions are not configured." }, { status: 503 });
  }

  try {
    const now = new Date().toISOString();
    await writeClient.create({
      _type: "subscriber",
      email: email.trim(),
      interests: Array.isArray(interests) ? interests : [],
      subscribedAt: now,
      consentGiven: true,
      consentVersion: SUBSCRIBE_CONSENT_VERSION,
      consentedAt: now,
    });
  } catch (error) {
    console.error("Failed to create subscriber in Sanity:", error);
    return NextResponse.json({ error: "Could not save your subscription. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
