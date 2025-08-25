# iPlayMusic —

Marks Galkins - WU12

---

## Overview
A simple Spotify-powered music web app built with **Next.js (App Router)** and **React**. It shows featured playlists in a **center‑focus carousel** and a mini **audio player** that supports play/pause, seeking, and switching tracks. Styling uses **SCSS with BEM** classes.

## Tech Stack
- Next.js (SSR + client components)
- React 19
- Spotify Web API + Spotify IFrame Embed
- SCSS (BEM naming)

## What it does
- **Login with Spotify**, store tokens in httpOnly cookies
- **Featured Playlists** → horizontal carousel; the one in the **middle** is the active playlist
- **Tracks list** updates to the focused playlist
- **Player**: play/pause, drag-to-seek (commit on release), and switch to another song instantly

## How it works (short)
- **Auth**: Spotify Authorization Code → server exchanges `code` → sets `ipm_access_token` (+ `ipm_refresh_token`) cookies
- **Fetching**: Server page preloads featured playlists and the first playlist’s tracks; client fetches new tracks when the carousel focus changes
- **Playback**: Spotify IFrame controller; listens to `playback_update` and uses `loadUri(uri)` to switch songs
- **Hydration‑safe nav**: Dock uses `usePathname()` and stable keys; no client‑only logic during first render

## Folder Map (important bits)
```
app/
  playlists/
    page.jsx                    # SSR: featured + initial tracks
    playlist-carousel-client.jsx# Client: center focus + fetch tracks
  api/
    spotify/playlist/route.js   # Proxy: get tracks for a playlist
    auth/callback/route.js      # OAuth callback (sets cookies)
components/
  player.jsx                    # IFrame controller + seek + switch
  track-item.jsx                # Track row UI
  dock.jsx                      # Bottom nav (hydration-safe)
utils/
  toTime.js                     # ms → mm:ss
styles/                         # SCSS (BEM)
```

## Setup
1. `.env.local`
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
```
2. Install & run
```
npm i
npm run dev
```

## Key Snippet (Player – seek + track switch)
```jsx
// components/player.jsx (excerpt)
"use client";
import { useContext, useEffect, useReducer, useRef } from "react";
import { playerContext } from "@/providers/player-provider";
import { msToTime } from "@/utils/toTime";
import Icons from "@/utils/icons";

function reducer(s, a){
  switch(a.type){
    case "setController": return {...s, controller:a.controller};
    case "setDurationAndPosition": return {...s, duration:a.duration, position:a.position};
    case "setPaused": return {...s, isPaused:a.isPaused};
    case "startSeeking": return {...s, isSeeking:true};
    case "stopSeeking": return {...s, isSeeking:false};
    case "setLocalPosition": return {...s, localPosition:a.localPosition};
    default: return s;
  }
}

export default function Player(){
  const { showPlayer, currentTrack, albumCover, setIsPaused } = useContext(playerContext);
  const controlRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, { controller:null, isPaused:true, duration:0, position:0, localPosition:0, isSeeking:false });

  // Load or switch track
  useEffect(()=>{
    if(!currentTrack) return;
    const mount = (API)=>{
      const opts = { uri: currentTrack.uri, width:0, height:0 };
      const cb = (ctrl)=>{
        dispatch({type:"setController", controller:ctrl});
        ctrl.addListener("playback_update", (e)=>{
          const { duration=0, position=0, isPaused=false } = e?.data||{};
          dispatch({type:"setDurationAndPosition", duration, position});
          dispatch({type:"setPaused", isPaused:!!isPaused});
          setIsPaused?.(!!isPaused);
        });
        ctrl.play();
      };
      if(state.controller){
        try{ state.controller.loadUri(currentTrack.uri); state.controller.play(); }
        catch{ API.createController(controlRef.current, opts, cb); }
      } else {
        API.createController(controlRef.current, opts, cb);
      }
    };

    if(!document.querySelector("script[src='https://open.spotify.com/embed/iframe-api/v1']")){
      const s=document.createElement("script"); s.src="https://open.spotify.com/embed/iframe-api/v1"; s.async=true; document.body.appendChild(s);
    }
    window.onSpotifyIframeApiReady = mount;
    return ()=>{ if(window.onSpotifyIframeApiReady===mount) window.onSpotifyIframeApiReady=undefined; };
  },[currentTrack]);

  // Seek: press→drag→release
  const onDown=()=>dispatch({type:"startSeeking"});
  const onChange=(e)=>dispatch({type:"setLocalPosition", localPosition:Number(e.target.value)||0});
  const onUp=(e)=>{ const v=Number(e.target.value)||0; state.controller?.seek(Math.floor(v/1000)); dispatch({type:"stopSeeking"}); };

  if(!showPlayer||!currentTrack||!albumCover) return null;
  return (
    <section className="player">
      <div id="embed-iframe" ref={controlRef} />
      <button className="player__toggle" onClick={()=>state.controller?.togglePlay()} aria-label={state.isPaused?"Play":"Pause"}>
        {state.isPaused ? <Icons.play/> : <Icons.pause/>}
      </button>
      <input type="range" className="player__range" value={state.localPosition} max={state.duration||0}
        onPointerDown={onDown} onChange={onChange} onPointerUp={onUp} />
      <span className="player__time">{msToTime(Math.max(0,(state.duration||0)-(state.position||0)))}</span>
    </section>
  );
}
```

## Notes
- Keep nav items static and compute `active` with `usePathname()`.
- Only include the Spotify script **once** (layout or guarded `useEffect`).
- Use stable keys: `pl.id` for playlists; `track.id || `${currentId}-${i}`` for tracks.

## Future (nice to have)
- Silent token refresh route
- Playlist pagination
- Artist/Album detail pages

