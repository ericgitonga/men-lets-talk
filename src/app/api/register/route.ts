import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { writeToken } from "@/sanity/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No rate limiting on this endpoint yet — tracked under the closing adversarial security
// audit (#29, "unrated public write endpoints") rather than built ad hoc here.
export async function POST(request: Request) {
  // Input validation always runs first, regardless of configuration state — a malformed
  // request is a 400 whether or not the write token happens to be set; "service isn't
  // configured" is a distinct, separate condition from "your request was bad".
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { eventId, name, email, phone } = (body ?? {}) as Record<string, unknown>;

  if (typeof eventId !== "string" || !eventId) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (phone !== undefined && typeof phone !== "string") {
    return NextResponse.json({ error: "Invalid phone." }, { status: 400 });
  }

  if (!writeToken) {
    return NextResponse.json({ error: "Registration is not configured." }, { status: 503 });
  }

  try {
    await writeClient.create({
      _type: "registration",
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
      event: { _type: "reference", _ref: eventId },
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to create registration in Sanity:", error);
    return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
