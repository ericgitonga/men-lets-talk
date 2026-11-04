import { beforeEach, describe, expect, it } from "vitest";
import {
  computeExpectedJsToken,
  hasExcessiveCaps,
  isRateLimited,
  isSpamSubmission,
  resetAntiSpamStores,
  sanitizeReplyToName,
  signContactToken,
  verifyChallengeAndInteraction,
} from "./contactSpam";

describe("contactSpam", () => {
  beforeEach(() => {
    resetAntiSpamStores();
  });

  describe("verifyChallengeAndInteraction", () => {
    const secret = "test-secret-key-1234";
    const ts = 1700000000;
    const seed = "AbCdEf123456GhIj";

    it("accepts a valid signed token within the 4s-2h window and blocks replay", () => {
      const sig = signContactToken(ts, seed, secret);
      const jsToken = computeExpectedJsToken(ts, seed);

      expect(
        verifyChallengeAndInteraction({
          ts,
          seed,
          sig,
          jsToken,
          nowSeconds: ts + 5,
          secret,
        }),
      ).toBe(true);

      // Replaying the exact same signature must be rejected
      expect(
        verifyChallengeAndInteraction({
          ts,
          seed,
          sig,
          jsToken,
          nowSeconds: ts + 6,
          secret,
        }),
      ).toBe(false);
    });

    it("rejects submissions completed in under 4 seconds or older than 2 hours", () => {
      const sig = signContactToken(ts, seed, secret);
      const jsToken = computeExpectedJsToken(ts, seed);

      expect(
        verifyChallengeAndInteraction({
          ts,
          seed,
          sig,
          jsToken,
          nowSeconds: ts + 2,
          secret,
        }),
      ).toBe(false);

      expect(
        verifyChallengeAndInteraction({
          ts,
          seed,
          sig,
          jsToken,
          nowSeconds: ts + 7201,
          secret,
        }),
      ).toBe(false);
    });

    it("rejects missing or invalid JS human-interaction tokens", () => {
      const sig = signContactToken(ts, seed, secret);
      expect(
        verifyChallengeAndInteraction({
          ts,
          seed,
          sig,
          jsToken: "wrong-token",
          nowSeconds: ts + 10,
          secret,
        }),
      ).toBe(false);
    });
  });

  describe("isSpamSubmission", () => {
    it("accepts a genuine human inquiry", () => {
      expect(
        isSpamSubmission({
          name: "John Kamau",
          email: "john@example.com",
          topic: "Joining a brotherhood table in Nairobi",
          message: "Hello, I would love to join the next Men Let's Talk session in Nairobi.",
        }),
      ).toBe(false);
    });

    it("allows legitimate prefixed surnames like McDonald or VanDerBerg", () => {
      expect(
        isSpamSubmission({
          name: "McDonald",
          email: "mc@example.com",
          topic: "Event inquiry",
          message: "Looking forward to attending the next men's breakfast.",
        }),
      ).toBe(false);
    });

    it("blocks single-word CamelCase bot names and names with digits", () => {
      expect(
        isSpamSubmission({
          name: "EdwardWaw",
          email: "user@example.com",
          topic: "Hello",
          message: "This is a normal looking message body.",
        }),
      ).toBe(true);

      expect(
        isSpamSubmission({
          name: "John123",
          email: "user@example.com",
          topic: "Hello",
          message: "This is a normal looking message body.",
        }),
      ).toBe(true);
    });

    it("blocks URLs in name or topic and >1 URL in message", () => {
      expect(
        isSpamSubmission({
          name: "John",
          email: "john@example.com",
          topic: "Check https://example.com",
          message: "Hello from Nairobi, I want to talk.",
        }),
      ).toBe(true);

      expect(
        isSpamSubmission({
          name: "John Kamau",
          email: "john@example.com",
          topic: "Partnership",
          message: "See https://example.com/one and https://example.com/two for details.",
        }),
      ).toBe(true);
    });

    it("blocks spam shortener/paste domains and high-abuse TLDs", () => {
      expect(
        isSpamSubmission({
          name: "John Kamau",
          email: "john@spammer.ru",
          topic: "Hello",
          message: "Let us connect soon about the upcoming event.",
        }),
      ).toBe(true);

      expect(
        isSpamSubmission({
          name: "John Kamau",
          email: "john@example.com",
          topic: "Hello",
          message: "Read my note on https://telegra.ph/some-promo-post please.",
        }),
      ).toBe(true);
    });

    it("blocks ALL-CAPS shouting and crypto/SEO scam lures", () => {
      expect(hasExcessiveCaps("THIS IS ALL CAPS SHOUTING MESSAGE HERE")).toBe(true);
      expect(
        isSpamSubmission({
          name: "John Kamau",
          email: "john@example.com",
          topic: "URGENT PARTNERSHIP OFFER FOR YOU",
          message: "Hello, let us talk about this soon.",
        }),
      ).toBe(true);

      expect(
        isSpamSubmission({
          name: "John Kamau",
          email: "john@example.com",
          topic: "Business",
          message: "We offer the best seo services and buy backlinks for your website.",
        }),
      ).toBe(true);
    });
  });

  describe("isRateLimited", () => {
    it("enforces per-IP limit of 2 submissions per 15 minutes", () => {
      const now = 1_700_000_000_000;
      expect(isRateLimited("203.0.113.10", now)).toBe(false);
      expect(isRateLimited("203.0.113.10", now + 1000)).toBe(false);
      expect(isRateLimited("203.0.113.10", now + 2000)).toBe(true);
    });
  });

  describe("sanitizeReplyToName", () => {
    it("strips CR/LF and header-delimiter characters", () => {
      expect(sanitizeReplyToName('John "The Rock"\r\nBcc: victim@example.com <test>;')).toBe(
        "John The Rock Bcc: victim@example.com test",
      );
      expect(sanitizeReplyToName("<>\",;\r\n")).toBe("Website Visitor");
    });
  });
});
