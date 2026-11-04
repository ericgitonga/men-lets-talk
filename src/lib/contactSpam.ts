import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const MIN_FILL_SECONDS = 4;
export const MAX_TOKEN_AGE_SECONDS = 7200; // 2 hours

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const MAX_PER_IP_15M = 2;
const MAX_PER_IP_24H = 5;
const MAX_GLOBAL_1H = 15;

// In-memory replay & rate-limit stores (keyed with expiry timestamps)
const usedSignatures = new Map<string, number>();
const ip15mCounts = new Map<string, { count: number; expiresAt: number }>();
const ip24hCounts = new Map<string, { count: number; expiresAt: number }>();
let global1hBucket = { count: 0, expiresAt: 0 };

function getSigningSecret(): string {
  return (
    process.env.CONTACT_FORM_SECRET ||
    process.env.SMTP_PASS ||
    process.env.SANITY_API_WRITE_TOKEN ||
    "mlt-local-dev-contact-secret-2026"
  );
}

/**
 * Generate a 16-char alphanumeric seed for a contact form render.
 */
export function generateChallengeSeed(): string {
  return randomBytes(12).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
}

/**
 * Compute an HMAC-SHA256 signature binding the render timestamp and challenge seed.
 */
export function signContactToken(ts: number | string, seed: string, secret = getSigningSecret()): string {
  return createHmac("sha256", secret).update(`${ts}|${seed}`).digest("hex");
}

/**
 * Create a fresh signed challenge payload for rendering or hydrating the contact form.
 */
export function createContactChallenge(nowSeconds = Math.floor(Date.now() / 1000)) {
  const ts = String(nowSeconds);
  const seed = generateChallengeSeed();
  const sig = signContactToken(ts, seed);
  return { ts, seed, sig };
}

/**
 * Compute the expected client-side human-interaction proof token from `ts` and `seed`.
 * Populated in the browser only after a real user interaction event (`focusin`, `keydown`,
 * `pointerdown`, `touchstart`).
 */
export function computeExpectedJsToken(ts: number | string, seed: string): string {
  const reversedSeed = String(seed).split("").reverse().join("");
  const tsSuffix = String(ts).slice(-4);
  return `${reversedSeed}-${tsSuffix}`;
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Layer 2 & Layer 3 verification:
 * - Verifies HMAC-SHA256 signature on `ts` and `seed`
 * - Enforces 4-second minimum fill time and 2-hour maximum lifetime
 * - Prevents single-use signature replay
 * - Verifies the client-side human interaction token (`jsToken`)
 */
export function verifyChallengeAndInteraction(params: {
  ts: unknown;
  seed: unknown;
  sig: unknown;
  jsToken: unknown;
  nowSeconds?: number;
  secret?: string;
}): boolean {
  const { ts, seed, sig, jsToken, nowSeconds = Math.floor(Date.now() / 1000), secret } = params;

  const tsStr = typeof ts === "number" ? String(ts) : typeof ts === "string" ? ts.trim() : "";
  const seedStr = typeof seed === "string" ? seed.trim() : "";
  const sigStr = typeof sig === "string" ? sig.trim() : "";
  const jsTokenStr = typeof jsToken === "string" ? jsToken.trim() : "";

  if (!/^\d+$/.test(tsStr) || !/^[a-zA-Z0-9]{12,32}$/.test(seedStr) || !sigStr || !jsTokenStr) {
    return false;
  }

  const expectedSig = signContactToken(tsStr, seedStr, secret);
  if (!safeEqualStrings(expectedSig, sigStr)) {
    return false;
  }

  const elapsed = nowSeconds - Number(tsStr);
  if (elapsed < MIN_FILL_SECONDS || elapsed > MAX_TOKEN_AGE_SECONDS) {
    return false;
  }

  const expectedJs = computeExpectedJsToken(tsStr, seedStr);
  if (!safeEqualStrings(expectedJs, jsTokenStr)) {
    return false;
  }

  // Prune expired signatures and enforce single-use replay lock
  const nowMs = nowSeconds * 1000;
  for (const [k, exp] of usedSignatures.entries()) {
    if (exp <= nowMs) usedSignatures.delete(k);
  }
  const replayKey = sigStr.slice(0, 32);
  const existingExp = usedSignatures.get(replayKey);
  if (existingExp && existingExp > nowMs) {
    return false;
  }
  usedSignatures.set(replayKey, nowMs + MAX_TOKEN_AGE_SECONDS * 1000);

  return true;
}

/**
 * Return true if alphabetic characters in `text` (ignoring URLs) are predominantly
 * ALL-CAPS shouting (> 60% uppercase across >= 15 letters).
 */
export function hasExcessiveCaps(text: string): boolean {
  const withoutUrls = text.replace(/https?:\/\/\S+|www\.\S+/gi, "");
  const letters = withoutUrls.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 15) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.6;
}

const SPAM_DOMAIN_RE =
  /\b(?:telegra\.ph|t\.me|telegram\.me|bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|rb\.gy|ow\.ly|tiny\.cc|shorturl\.at|vk\.com|yandex\.[a-z]+|[a-z0-9-]+\.(?:ru|su|xyz|top|click|loan|work|gq|cf|tk|ml|ga|buzz|icu|monster|rest|fit))\b/i;

const SCAM_LURE_RE =
  /(?:\bearn\s+\$?\d[\d,.]*|\bmake\s+\$?\d[\d,.]*|\$\d[\d,]*\s*(?:per|a|in\s+a)\s*(?:month|week|day|hour)|\bpassive\s+income\b|\bfinancial\s+freedom\b|\bcrypto(?:currency)?\s+(?:invest|trading|airdrop|giveaway)\b|\bbitcoin\s+(?:invest|mining|generator)\b|\bonline\s+casino\b|\bsports\s+betting\b|\bbuy\s+backlinks\b|\bseo\s+services\b|\bguest\s+post\s+service\b|\bviagra\b|\bcialis\b)/i;

const CAMEL_CASE_BOT_NAME_RE = /^[A-Z][a-z]{2,15}[A-Z][a-z]{1,15}$/;
const LEGIT_SURNAME_PREFIX_RE = /^(?:Mc|Mac|De|Di|Du|La|Le|Van|Von|Fitz)[A-Z]/;

/**
 * Layer 4 — Heuristic and content-based anti-spam filter.
 * Returns true if the submission matches spam heuristics and should be silently dropped.
 */
export function isSpamSubmission(params: {
  name: string;
  email: string;
  topic?: string;
  message: string;
}): boolean {
  const name = params.name.trim();
  const email = params.email.trim();
  const topic = (params.topic ?? "").trim();
  const message = params.message.trim();

  // 1. Field length bounds
  if (name.length > 100 || topic.length > 160 || message.length < 5 || message.length > 5000) {
    return true;
  }

  // 2. Disallow any URLs in Name or Topic, and allow at most 1 URL in Message
  if (/https?:\/\/|www\./i.test(`${name} ${topic}`)) {
    return true;
  }
  const messageUrlMatches = message.match(/https?:\/\/|www\./gi);
  if (messageUrlMatches && messageUrlMatches.length > 1) {
    return true;
  }

  const combined = `${topic}\n${message}`;

  // 3. Block known spam paste/shortener hosts and high-abuse TLDs
  if (SPAM_DOMAIN_RE.test(`${email}\n${combined}`)) {
    return true;
  }

  // 4. Block ALL-CAPS shouting in Topic or Message
  if (hasExcessiveCaps(topic) || hasExcessiveCaps(message)) {
    return true;
  }

  // 5. Block bot-generated Name patterns (digits in name, or single-word CamelCase like "EdwardWaw")
  if (/\d/.test(name)) {
    return true;
  }
  if (CAMEL_CASE_BOT_NAME_RE.test(name) && !LEGIT_SURNAME_PREFIX_RE.test(name)) {
    return true;
  }

  // 6. Block common financial/crypto/SEO/adult scam lures
  if (SCAM_LURE_RE.test(combined)) {
    return true;
  }

  return false;
}

/**
 * Layer 5 — Per-IP (<= 2 / 15m, <= 5 / 24h) and global (<= 15 / 1h) rate limiting.
 * Returns true if the submission exceeds rate limits and should be silently dropped.
 */
export function isRateLimited(ip: string, nowMs = Date.now()): boolean {
  const ipHash = createHmac("sha256", getSigningSecret()).update(ip || "0.0.0.0").digest("hex").slice(0, 16);

  const entry15m = ip15mCounts.get(ipHash);
  const count15m = entry15m && entry15m.expiresAt > nowMs ? entry15m.count : 0;

  const entry24h = ip24hCounts.get(ipHash);
  const count24h = entry24h && entry24h.expiresAt > nowMs ? entry24h.count : 0;

  const countGlob = global1hBucket.expiresAt > nowMs ? global1hBucket.count : 0;

  if (count15m >= MAX_PER_IP_15M || count24h >= MAX_PER_IP_24H || countGlob >= MAX_GLOBAL_1H) {
    return true;
  }

  ip15mCounts.set(ipHash, {
    count: count15m + 1,
    expiresAt: entry15m && entry15m.expiresAt > nowMs ? entry15m.expiresAt : nowMs + FIFTEEN_MINUTES_MS,
  });
  ip24hCounts.set(ipHash, {
    count: count24h + 1,
    expiresAt: entry24h && entry24h.expiresAt > nowMs ? entry24h.expiresAt : nowMs + TWENTY_FOUR_HOURS_MS,
  });
  global1hBucket = {
    count: countGlob + 1,
    expiresAt: global1hBucket.expiresAt > nowMs ? global1hBucket.expiresAt : nowMs + ONE_HOUR_MS,
  };

  return false;
}

/**
 * Reset rate-limit and replay stores (used in unit tests).
 */
export function resetAntiSpamStores(): void {
  usedSignatures.clear();
  ip15mCounts.clear();
  ip24hCounts.clear();
  global1hBucket = { count: 0, expiresAt: 0 };
}

/**
 * Layer 6 — Sanitize user-supplied display name for safe use in a Reply-To header.
 */
export function sanitizeReplyToName(name: string): string {
  const cleaned = name.replace(/[\r\n<>",;]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "Website Visitor";
}
