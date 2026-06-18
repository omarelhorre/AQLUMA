/**
 * Defer a (scroll-scrubbed) video's download until its section is approaching the
 * viewport, then fully buffer it. Scrubbed clips MUST be loaded to seek smoothly,
 * but they don't all need to download on first page load — this fetches each one
 * ~1.5 viewports ahead of arrival so it's ready by the time you reach it.
 *
 * Pair with `preload="metadata"` on the <video>; this flips it to "auto" + load()
 * when near. Returns a disconnect fn for effect cleanup.
 */
export function lazyPreloadVideo(
  section: Element | null,
  video: HTMLVideoElement | null
): () => void {
  if (!section || !video) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        video.preload = "auto";
        video.load();
        io.disconnect();
      }
    },
    { rootMargin: "150% 0px" }
  );
  io.observe(section);
  return () => io.disconnect();
}
