import { describe, expect, it } from "vitest";
import {
  ABOUT_VIDEO_SRC,
  FALLBACK_EVENTS,
  FALLBACK_GALLERY_IMAGES,
  filterUpcomingEvents,
} from "./defaultMedia";

describe("defaultMedia", () => {
  it("defines the About video path and 17 fallback gallery photos", () => {
    expect(ABOUT_VIDEO_SRC).toBe("/videos/about-men-lets-talk.mp4");
    expect(FALLBACK_GALLERY_IMAGES).toHaveLength(17);
    for (const img of FALLBACK_GALLERY_IMAGES) {
      expect(img.imageUrl).toMatch(/^\/images\/gallery\/gallery-\d{2}\.jpg$/);
      expect(img.caption).toBeNull();
    }
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
