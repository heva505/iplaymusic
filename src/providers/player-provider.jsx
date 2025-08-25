"use client";

import { createContext, useCallback, useMemo, useState } from "react";

export const playerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [albumCover, setAlbumCover] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [trackNonce, setTrackNonce] = useState(0);

  const playTrack = useCallback(({ track, cover }) => {
    if (!track?.uri) return;
    setCurrentTrack({ ...track });
    if (cover) setAlbumCover({ ...cover });
    setShowPlayer(true);
    setIsPaused(false);
    // bump nonce so the Player knows to reload/seek to 0 even if URI matches
    setTrackNonce((n) => (n + 1) % 1_000_000);
  }, []);

  const value = useMemo(
    () => ({
      showPlayer,
      setShowPlayer,
      currentTrack,
      setCurrentTrack,
      albumCover,
      setAlbumCover,
      isPaused,
      setIsPaused,
      trackNonce,
      playTrack,
    }),
    [showPlayer, currentTrack, albumCover, isPaused, trackNonce, playTrack]
  );

  return (
    <playerContext.Provider value={value}>{children}</playerContext.Provider>
  );
}
