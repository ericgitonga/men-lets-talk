import { describe, expect, it } from "vitest";
import {
  ABOUT_VIDEO_SRC,
  ODEK_VIDEO_SRC,
  FALLBACK_EVENTS,
  FALLBACK_GALLERY_IMAGES,
  FALLBACK_MENS_GARAGE_IMAGES,
  FALLBACK_COMMUNITY_GATHERINGS_IMAGES,
  GALLERY_ALBUMS,
  deduplicateGalleryImages,
  getGalleryImagesByAlbum,
  resolveGalleryAlbum,
  filterUpcomingEvents,
  filterPastEvents,
} from "./defaultMedia";

describe("defaultMedia", () => {
  it("defines the About & Odek video paths and 88 unique fallback gallery photos across 2 albums", () => {
    expect(ABOUT_VIDEO_SRC).toBe("/videos/about-men-lets-talk.mp4");
    expect(ODEK_VIDEO_SRC).toBe("/videos/odek-the-conversation-is-growing.mp4");
    expect(GALLERY_ALBUMS.map((a) => a.slug)).toEqual([
      "mens-garage",
      "community-gatherings",
    ]);
    expect(FALLBACK_MENS_GARAGE_IMAGES).toHaveLength(64);
    for (const img of FALLBACK_MENS_GARAGE_IMAGES) {
      expect(img.imageUrl).toMatch(
        /^\/images\/gallery\/mens-garage\/mlt-mg_\d{2}\.jpg$/,
      );
      expect(resolveGalleryAlbum(img)).toBe("mens-garage");
    }
    expect(FALLBACK_COMMUNITY_GATHERINGS_IMAGES).toHaveLength(24);
    for (const img of FALLBACK_COMMUNITY_GATHERINGS_IMAGES) {
      expect(img.imageUrl).toMatch(/^\/images\/gallery\/gallery-\d{2}\.jpg$/);
      expect(resolveGalleryAlbum(img)).toBe("community-gatherings");
    }
    expect(FALLBACK_GALLERY_IMAGES).toHaveLength(88);
    expect(
      getGalleryImagesByAlbum(FALLBACK_GALLERY_IMAGES, "mens-garage"),
    ).toHaveLength(64);
    expect(
      getGalleryImagesByAlbum(FALLBACK_GALLERY_IMAGES, "community-gatherings"),
    ).toHaveLength(24);
    expect(deduplicateGalleryImages(FALLBACK_GALLERY_IMAGES)).toHaveLength(88);
    expect(
      deduplicateGalleryImages([
        ...FALLBACK_GALLERY_IMAGES,
        FALLBACK_GALLERY_IMAGES[0],
      ]),
    ).toHaveLength(88);
  });

  it("separates upcoming and past events accurately", () => {
    const olderPastEvent = {
      ...FALLBACK_EVENTS[0],
      _id: "past-event-1",
      date: "2020-01-01T10:00:00.000Z",
    };
    const newerPastEvent = {
      ...FALLBACK_EVENTS[0],
      _id: "past-event-2",
      date: "2024-06-01T10:00:00.000Z",
    };
    const futureEvent = {
      ...FALLBACK_EVENTS[0],
      _id: "future-event",
      date: "2099-01-01T10:00:00.000Z",
    };
    const all = [olderPastEvent, futureEvent, newerPastEvent];

    const upcoming = filterUpcomingEvents(all);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]._id).toBe("future-event");

    const past = filterPastEvents(all);
    expect(past.map((e) => e._id)).toEqual(["past-event-2", "past-event-1"]);
  });
});
