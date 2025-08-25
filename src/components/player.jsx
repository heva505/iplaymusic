"use client";

import { useContext, useEffect, useReducer, useRef } from "react";
import Image from "next/image";

import { playerContext } from "@/providers/player-provider";
import { msToTime } from "@/utils/toTime";
import Icons from "@/utils/icons";

function reducer(state, action) {
  switch (action.type) {
    case "setController":
      return { ...state, controller: action.controller };
    case "setDuration":
      return { ...state, duration: action.duration };
    case "setPosition":
      return { ...state, position: action.position };
    case "setLocalPosition":
      return { ...state, localPosition: action.localPosition };
    case "setPaused":
      return { ...state, isPaused: action.isPaused };
    case "startSeeking":
      return { ...state, isSeeking: true };
    case "stopSeeking":
      return { ...state, isSeeking: false };
    case "setDurationAndPosition":
      return { ...state, duration: action.duration, position: action.position };
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

export default function Player() {
  const { showPlayer, currentTrack, albumCover, setIsPaused } =
    useContext(playerContext);

  const controlRef = useRef(null);
  const apiRef = useRef(null); // <- keep IFrame API
  const listenerAttachedRef = useRef(false); // <- avoid duplicate listeners

  const [playerState, dispatch] = useReducer(reducer, {
    controller: null,
    isPaused: true,
    duration: 0,
    position: 0,
    localPosition: 0,
    isSeeking: false,
  });

  // Keep slider synced with playback unless user is seeking
  useEffect(() => {
    if (!playerState.isSeeking) {
      dispatch({
        type: "setLocalPosition",
        localPosition: playerState.position,
      });
    }
  }, [playerState.position, playerState.isSeeking]);

  // Ensure the Spotify script is present and capture the API once
  useEffect(() => {
    if (
      !document.querySelector(
        "script[src='https://open.spotify.com/embed/iframe-api/v1']"
      )
    ) {
      const s = document.createElement("script");
      s.src = "https://open.spotify.com/embed/iframe-api/v1";
      s.async = true;
      document.body.appendChild(s);
    }

    const handleReady = (IFrameAPI) => {
      apiRef.current = IFrameAPI;
    };
    // only set if not already set by someone else
    if (!window.onSpotifyIframeApiReady) {
      window.onSpotifyIframeApiReady = handleReady;
    }

    return () => {
      if (window.onSpotifyIframeApiReady === handleReady) {
        window.onSpotifyIframeApiReady = undefined;
      }
    };
  }, []);

  // Helper: attach one playback_update listener
  function attachPlaybackListenerOnce(ctrl) {
    if (listenerAttachedRef.current) return;
    ctrl.addListener("playback_update", (event) => {
      const {
        duration = 0,
        position = 0,
        isPaused = false,
      } = event?.data || {};
      dispatch({ type: "setDurationAndPosition", duration, position });
      dispatch({ type: "setPaused", isPaused: !!isPaused });
      setIsPaused?.(!!isPaused);
    });
    listenerAttachedRef.current = true;
  }

  // Helper: create controller
  function createControllerFor(uri) {
    if (!apiRef.current || !controlRef.current) return;
    const options = { uri, width: 0, height: 0 };
    const callback = (EmbedController) => {
      dispatch({ type: "setController", controller: EmbedController });
      attachPlaybackListenerOnce(EmbedController);
      EmbedController.play();
    };
    apiRef.current.createController(controlRef.current, options, callback);
  }

  // On every track change, either load into existing controller or create a new one
  useEffect(() => {
    if (!currentTrack) return;

    // reset UI immediately so the bar jumps to 0 while new song prepares
    dispatch({ type: "stopSeeking" });
    dispatch({ type: "setDurationAndPosition", duration: 0, position: 0 });
    dispatch({ type: "setPaused", isPaused: false });
    setIsPaused?.(false);

    if (playerState.controller) {
      // Fast path: reuse existing controller
      try {
        playerState.controller.loadUri(currentTrack.uri);
        playerState.controller.play();
      } catch {
        // Some environments don’t support loadUri reliably -> recreate
        createControllerFor(currentTrack.uri);
      }
    } else {
      // First time: create
      createControllerFor(currentTrack.uri);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // ==== SEEK LOGIC ====
  function handleSeekPointerDown() {
    if (!playerState.isSeeking) dispatch({ type: "startSeeking" });
  }

  function handleSeekChange(e) {
    const value = Number(e.target.value) || 0;
    dispatch({ type: "setLocalPosition", localPosition: value });
  }

  function handleSeekPointerUp(e) {
    const value = Number(e.target.value) || 0;
    const controller = playerState.controller;
    if (controller && Number.isFinite(value)) {
      controller.seek(Math.floor(value / 1000)); // ms -> seconds
    }
    dispatch({ type: "stopSeeking" });
  }

  function handleSeekKeyUp(e) {
    const keysToCommit = [
      "Enter",
      " ",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    if (keysToCommit.includes(e.key)) {
      const value = Number(e.currentTarget.value) || 0;
      const controller = playerState.controller;
      if (controller) controller.seek(Math.floor(value / 1000));
    }
  }

  if (!showPlayer || !currentTrack || !albumCover) return null;

  return (
    <>
      <script src='https://open.spotify.com/embed/iframe-api/v1' async></script>

      <div id='embed-iframe' ref={controlRef} />

      <section className='player'>
        <div className='player__left'>
          <Image
            src={albumCover.url}
            width={48}
            height={48}
            alt=''
            className='player__cover'
          />

          <button
            className='player__toggle'
            onClick={() =>
              playerState.controller && playerState.controller.togglePlay()
            }
            aria-label={playerState.isPaused ? "Play" : "Pause"}
            type='button'
          >
            {playerState.isPaused ? <Icons.play /> : <Icons.pause />}
          </button>
        </div>

        <div className='player__middle'>
          <p className='player__title' title={currentTrack.name}>
            {currentTrack.name}
          </p>

          <div className='player__seek'>
            <input
              type='range'
              className='player__range'
              value={playerState.localPosition}
              max={playerState.duration || 0}
              onPointerDown={handleSeekPointerDown}
              onChange={handleSeekChange}
              onPointerUp={handleSeekPointerUp}
              onKeyUp={handleSeekKeyUp}
            />
          </div>
        </div>

        <div className='player__right'>
          <span className='player__time'>
            {msToTime(
              Math.max(
                0,
                (playerState.duration || 0) - (playerState.position || 0)
              )
            )}
          </span>
        </div>
      </section>
    </>
  );
}
