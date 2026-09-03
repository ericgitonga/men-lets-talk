import { describe, expect, it } from "vitest";
import { getEmbedUrl } from "./VideoEmbed";

describe("getEmbedUrl", () => {
  it("resolves a youtube.com/watch?v= URL", () => {
    expect(getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("resolves a youtu.be short URL", () => {
    expect(getEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("resolves an already-embed youtube URL", () => {
    expect(getEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("resolves a vimeo.com URL", () => {
    expect(getEmbedUrl("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    );
  });

  it("returns null for an unrecognized host", () => {
    expect(getEmbedUrl("https://example.com/some-video")).toBeNull();
  });

  it("returns null for an invalid URL", () => {
    expect(getEmbedUrl("not a url")).toBeNull();
  });
});
