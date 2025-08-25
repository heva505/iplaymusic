"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TrackItem from "@/components/track-item";
import { msToTime } from "@/utils/toTime";

export default function PlaylistCarouselClient({
  featured,
  initialCurrentId,
  initialTracks,
}) {
  const scrollRef = useRef(null);
  const [currentId, setCurrentId] = useState(initialCurrentId ?? null);
  const [tracks, setTracks] = useState(initialTracks ?? []);
  const [isLoading, setIsLoading] = useState(false);

  const current = useMemo(
    () => featured.find((p) => p.id === currentId) || featured[0],
    [featured, currentId]
  );

  // Center-focused detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        let closestId = null;
        let closestDist = Infinity;

        for (const child of Array.from(el.children)) {
          const node = child;
          const cRect = node.getBoundingClientRect();
          const cCenter = cRect.left + cRect.width / 2;
          const dist = Math.abs(cCenter - centerX);
          const pid = node.dataset.pid;
          if (pid && dist < closestDist) {
            closestDist = dist;
            closestId = pid;
          }
        }
        if (closestId && closestId !== currentId) setCurrentId(closestId);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial focused
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [currentId]);

  // Fetch tracks when focused playlist changes
  useEffect(() => {
    if (!currentId) return;
    let ignore = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/spotify/playlist?playlistId=${currentId}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error("Failed getting tracks");
        const data = await res.json();
        if (!ignore) setTracks(data.tracks || []);
      } catch (e) {
        if (!ignore) setTracks([]);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    const t = setTimeout(run, 120); // small debounce during scroll
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [currentId]);

  const currentCover =
    current?.images?.[0]?.url || "/images/placeholders/album.png";
  const currentTitle = current?.name || "Playlist";
  const currentSubtitle =
    current?.owner?.display_name ||
    (current?.description ? current.description.replace(/<[^>]*>/g, "") : "");

  return (
    <>
      {/* Carousel */}
      <section className='playlist__carousel' aria-label='Featured playlists'>
        <div className='playlist__scroll hide-scrollbar' ref={scrollRef}>
          {featured.map((pl) => {
            const cover =
              pl.images?.[0]?.url || "/images/placeholders/note.jpg";
            return (
              <button
                key={pl.id} // unique
                data-pid={pl.id}
                type='button'
                className='playlist__carousel-item'
                aria-label={`Select playlist ${pl.name}`}
                onClick={() => setCurrentId(pl.id)}
              >
                <img src={cover} alt={`Cover of ${pl.name}`} loading='lazy' />
              </button>
            );
          })}
        </div>
      </section>

      {/* Current details */}
      <section className='playlist__details' aria-labelledby='playlist-heading'>
        <div className='playlist__hero'>
          <img
            className='playlist__cover'
            src={currentCover}
            alt={`Cover of ${currentTitle}`}
            loading='lazy'
          />
          <div>
            <h2 id='playlist-heading' className='playlist__name'>
              {currentTitle}
            </h2>
            {currentSubtitle && (
              <p className='playlist__subtitle'>{currentSubtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* Tracks list */}
      <section className='playlist__tracklist' aria-label='Playlist songs'>
        {isLoading ? (
          <p className='playlist__empty'>Loading…</p>
        ) : tracks.length === 0 ? (
          <p className='playlist__empty'>No tracks found.</p>
        ) : (
          <ol className='playlist__songs'>
            {tracks.map((track, index) => (
              <li
                key={track?.id ?? `${currentId}-${index}`} // unique per playlist
                className='playlist__song'
              >
                <TrackItem track={track} index={index} />
                <span className='playlist__song-time'>
                  {msToTime(track?.duration_ms)}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className='playlist__actions'>
          <a
            className='playlist__listen-all'
            href={`/playlists/${current?.id || ""}`}
          >
            Open in details
          </a>
        </div>
      </section>
    </>
  );
}
