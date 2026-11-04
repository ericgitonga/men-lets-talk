import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { CONTACT_CONSENT_VERSION } from "@/lib/consent";
import { EMAIL } from "@/lib/contactInfo";
import {
  createContactChallenge,
  isRateLimited,
  isSpamSubmission,
  sanitizeReplyToName,
  verifyChallengeAndInteraction,
} from "@/lib/contactSpam";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 100;
const PHONE_MAX = 40;
const TOPIC_MAX = 160;
const MESSAGE_MAX = 5000;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

export async function GET() {
  return NextResponse.json(createContactChallenge(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    name,
    email,
    phone,
    topic,
    message,
    consentGiven,
    website,
    ts,
    seed,
    sig,
    jsToken,
  } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim() || name.trim().length > NAME_MAX) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (phone !== undefined && (typeof phone !== "string" || phone.trim().length > PHONE_MAX)) {
    return NextResponse.json({ error: "Invalid phone." }, { status: 400 });
  }
  if (topic !== undefined && (typeof topic !== "string" || topic.trim().length > TOPIC_MAX)) {
    return NextResponse.json({ error: "Topic is too long." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim() || message.trim().length > MESSAGE_MAX) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (consentGiven !== true) {
    return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  }

  const simulateEmails = process.env.CONTACT_SIMULATE_EMAILS === "yes";
  const smtpHost = process.env.SMTP_HOST || "mx1.angryhosting.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || EMAIL;

  if (!simulateEmails && (!smtpUser || !smtpPass)) {
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 503 });
  }

  // Layer 1 — Disguised text honeypot (`website`). Silently accept so bots cannot probe defenses.
  if (typeof website === "string" && website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Layer 2 & Layer 3 — Signed timestamp time-trap (4s–2h window + single-use replay lock)
  // and client-side human interaction proof token.
  if (!verifyChallengeAndInteraction({ ts, seed, sig, jsToken })) {
    return NextResponse.json({ ok: true });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
  const trimmedTopic = typeof topic === "string" ? topic.trim() : "";
  const trimmedMessage = message.trim();

  // Layer 4 — Heuristic content & URL filter.
  if (
    isSpamSubmission({
      name: trimmedName,
      email: trimmedEmail,
      topic: trimmedTopic,
      message: trimmedMessage,
    })
  ) {
    return NextResponse.json({ ok: true });
  }

  // Layer 5 — Per-IP (<= 2 / 15m, <= 5 / 24h) and global (<= 15 / 1h) rate limiting.
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ ok: true });
  }

  // Layer 7 — Staging / preview simulation mode (`CONTACT_SIMULATE_EMAILS=yes`).
  if (simulateEmails) {
    return NextResponse.json({ ok: true, simulated: true });
  }

  // Layer 6 — Sanitize display name in Reply-To header to prevent header injection.
  const safeReplyName = sanitizeReplyToName(trimmedName);
  const now = new Date().toISOString();
  const mailSubject = `[Men Let's Talk] ${trimmedTopic || `New message from ${safeReplyName}`}`;
  const mailText = [
    `Name: ${trimmedName}`,
    `Email: ${trimmedEmail}`,
    `Phone: ${trimmedPhone || "Not provided"}`,
    `Topic: ${trimmedTopic || "Not specified"}`,
    `Consent: ${CONTACT_CONSENT_VERSION} (${now})`,
    "",
    "Message:",
    trimmedMessage,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Men Let's Talk" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: `"${safeReplyName}" <${trimmedEmail}>`,
      subject: mailSubject,
      text: mailText,
    });
  } catch (error) {
    console.error("Failed to send contact email via SMTP:", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again or reach us on WhatsApp." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
