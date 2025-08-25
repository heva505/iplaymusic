"use client";

import { useContext, useMemo } from "react";
import { playerContext } from "@/providers/player-provider";
import { msToTime } from "@/utils/toTime";
import Icons from "@/utils/icons";
import MarqueeText from "@/components/marquee-text";

export default function TrackItem({ track, albumCover }) {
  const { playTrack, currentTrack, isPaused } = useContext(playerContext);

  const cover = useMemo(() => {
    const src = albumCover?.url || track?.album?.images?.[0]?.url || null;
    const width = albumCover?.width || track?.album?.images?.[0]?.width || 300;
    const height =
      albumCover?.height || track?.album?.images?.[0]?.height || 300;
    return src ? { url: src, width, height } : null;
  }, [albumCover, track]);

  const onPlay = () => {
    playTrack({
      track: {
        id: track.id,
        uri: track.uri,
        name: track.name,
      },
      cover,
    });
  };

  const isCurrent =
    (currentTrack?.uri && currentTrack.uri === track.uri) ||
    (currentTrack?.id && currentTrack.id === track.id);

  const artists = Array.isArray(track?.artists)
    ? track.artists.map((a) => a.name).join(", ")
    : "";

  return (
    <button
      type='button'
      onClick={onPlay}
      className='track-item'
      aria-pressed={isCurrent}
    >
      <article className='track-item__content'>
        <span className='track-item__icon'>
          {isCurrent && !isPaused ? (
            <Icons.pause className='track-item__icon-pause' size={22} />
          ) : (
            <Icons.play className='track-item__icon-play' size={22} />
          )}
        </span>

        <div className='track-item__info'>
          <MarqueeText name={track.name} className='track-item__title' />
          <MarqueeText name={artists} className='track-item__artist' />
        </div>

        <span className='track-item__time'>{msToTime(track.duration_ms)}</span>
      </article>
    </button>
  );
}
