import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { writeToken } from "@/sanity/env";
import { STORY_CONSENT_VERSION } from "@/lib/consent";

const VALID_TOPICS = new Set([
  "pressure",
  "failure",
  "marriage",
  "fatherhood",
  "money",
  "purpose",
  "loneliness",
  "grief",
  "relationships",
  "mental-health",
  "masculinity",
  "faith",
  "starting-again",
]);

const NAME_MAX = 100;
const AGE_OR_CATEGORY_MAX = 100;
const STORY_MAX = 5000;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// No rate limiting on this endpoint yet — same tracked-under-#29 situation as /api/register
// and /api/subscribe. The load-bearing control here is that every submission lands as a
// Sanity draft (never published), so unmoderated public narrative never reaches the live
// site regardless of what's submitted — see the Kenya DPA 2019 compliance review (#28 §8).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    name,
    ageOrCategory,
    topics,
    storyText,
    videoUrl,
    processingConsentGiven,
    consentGiven,
  } = (body ?? {}) as Record<string, unknown>;

  if (name !== undefined && (typeof name !== "string" || name.length > NAME_MAX)) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }
  if (
    ageOrCategory !== undefined &&
    (typeof ageOrCategory !== "string" || ageOrCategory.length > AGE_OR_CATEGORY_MAX)
  ) {
    return NextResponse.json({ error: "Invalid age/category." }, { status: 400 });
  }
  if (
    !Array.isArray(topics) ||
    topics.length === 0 ||
    !topics.every((t) => typeof t === "string" && VALID_TOPICS.has(t))
  ) {
    return NextResponse.json({ error: "At least one topic is required." }, { status: 400 });
  }
  if (storyText !== undefined && (typeof storyText !== "string" || storyText.length > STORY_MAX)) {
    return NextResponse.json({ error: "Story text is too long." }, { status: 400 });
  }
  if (videoUrl !== undefined && (typeof videoUrl !== "string" || !isValidHttpUrl(videoUrl))) {
    return NextResponse.json({ error: "Invalid video URL." }, { status: 400 });
  }
  const hasStoryText = typeof storyText === "string" && storyText.trim().length > 0;
  const hasVideoUrl = typeof videoUrl === "string" && videoUrl.trim().length > 0;
  if (!hasStoryText && !hasVideoUrl) {
    return NextResponse.json({ error: "Share your story as text or a video link." }, { status: 400 });
  }
  if (processingConsentGiven !== true || consentGiven !== true) {
    return NextResponse.json({ error: "Both consent checkboxes are required." }, { status: 400 });
  }

  if (!writeToken) {
    return NextResponse.json({ error: "Story submission is not configured." }, { status: 503 });
  }

  const now = new Date().toISOString();

  try {
    await writeClient.create({
      // Draft, never published directly — the MLT team reviews and publishes in Studio.
      // See #28 §8: this is the load-bearing moderation control for this endpoint.
      _id: `drafts.${randomUUID()}`,
      _type: "story",
      name: typeof name === "string" && name.trim() ? name.trim() : undefined,
      ageOrCategory:
        typeof ageOrCategory === "string" && ageOrCategory.trim() ? ageOrCategory.trim() : undefined,
      topics,
      body: hasStoryText
        ? [
            {
              _type: "block",
              _key: randomUUID(),
              children: [{ _type: "span", _key: randomUUID(), text: (storyText as string).trim() }],
            },
          ]
        : undefined,
      videoUrl: hasVideoUrl ? (videoUrl as string).trim() : undefined,
      consentGiven: true,
      processingConsentGiven: true,
      consentVersion: STORY_CONSENT_VERSION,
      consentedAt: now,
      publishedAt: now,
    });
  } catch (error) {
    console.error("Failed to create story draft in Sanity:", error);
    return NextResponse.json({ error: "Could not save your story. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
