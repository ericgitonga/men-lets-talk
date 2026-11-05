import { describe, expect, it } from "vitest";
import {
  ABOUT_VIDEO_SRC,
  ODEK_VIDEO_SRC,
  FALLBACK_EVENTS,
  FALLBACK_GALLERY_IMAGES,
  deduplicateGalleryImages,
  filterUpcomingEvents,
} from "./defaultMedia";

describe("defaultMedia", () => {
  it("defines the About & Odek video paths and 24 unique fallback gallery photos", () => {
    expect(ABOUT_VIDEO_SRC).toBe("/videos/about-men-lets-talk.mp4");
    expect(ODEK_VIDEO_SRC).toBe("/videos/odek-the-conversation-is-growing.mp4");
    expect(FALLBACK_GALLERY_IMAGES).toHaveLength(24);
    for (const img of FALLBACK_GALLERY_IMAGES) {
      expect(img.imageUrl).toMatch(/^\/images\/gallery\/gallery-\d{2}\.jpg$/);
      expect(img.caption).toBeNull();
    }
    expect(deduplicateGalleryImages(FALLBACK_GALLERY_IMAGES)).toHaveLength(24);
    expect(
      deduplicateGalleryImages([
        ...FALLBACK_GALLERY_IMAGES,
        FALLBACK_GALLERY_IMAGES[0],
      ]),
    ).toHaveLength(24);
  });

  it("filters out past events while keeping upcoming events", () => {
    const pastEvent = {
      ...FALLBACK_EVENTS[0],
      _id: "past-event",
      date: "2020-01-01T10:00:00.000Z",
    };
    const futureEvent = {
      ...FALLBACK_EVENTS[0],
      _id: "future-event",
      date: "2099-01-01T10:00:00.000Z",
    };
    const result = filterUpcomingEvents([pastEvent, futureEvent]);
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe("future-event");
  });
});
