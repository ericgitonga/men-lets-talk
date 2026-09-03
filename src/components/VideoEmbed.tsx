// Recognizes YouTube and Vimeo URLs (the platforms the brief names — "YouTube videos and
// other video content") and returns an embeddable iframe src, or null if the URL doesn't
// match a known pattern — callers should fall back to a plain outbound link in that case,
// since we can't force-embed an arbitrary site.
export function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const match = parsed.pathname.match(/^\/embed\/([^/]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
      return null;
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.slice(1);
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a href={url} data-testid="video-fallback-link" className="mt-3 inline-block underline">
        Watch / Listen
      </a>
    );
  }

  return (
    <div data-testid="video-embed" className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
