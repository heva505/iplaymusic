# iPlayMusic —

Heva - WU12

---

## Oversigt
En simpel musik-webapp drevet af Spotify, bygget med **Next.js (App Router)** og **React**. Den viser udvalgte playlister i en **centreret karussel** og en mini **audioafspiller** der understøtter afspil/pause, søgning og skift mellem numre. Stilarten bruger **SCSS med BEM** klasser.

## Teknologisk Stak
- Next.js (SSR + klientkomponenter)
- React 19
- Spotify Web API + Spotify IFrame Embed
- SCSS (BEM navngivning)

## Hvad den gør
- **Login med Spotify**, gemmer tokens i httpOnly cookies
- **Udvalgte playlister** → horisontal karussel; den i **midten** er den aktive playliste
- **Nummerliste** opdateres til den fokuserede playliste
- **Afspiller**: afspil/pause, træk for at søge (gem ved slip), og skift til et andet nummer øjeblikkeligt

## Hvordan det virker (kort)
- **Auth**: Spotify Autorisationskode → server udveksler `code` → sætter `ipm_access_token` (+ `ipm_refresh_token`) cookies
- **Hentning**: Serverside forudindlæser udvalgte playlister og det første playlists numre; klienten henter nye numre når karusselens fokus ændres
- **Afspilning**: Spotify IFrame kontroller; lytter til `playback_update` og bruger `loadUri(uri)` til at skifte sange
- **Hydreringssikker navigation**: Dock bruger `usePathname()` og stabile nøgler; ingen klient-kun logik under første rendering

## Mappestruktur (vigtige dele)
```
app/
  playlists/
    page.jsx                    # SSR: udvalgte + initielle numre
    playlist-carousel-client.jsx# Klient: center fokus + hent numre
  api/
    spotify/playlist/route.js   # Proxy: hent numre til en playliste
    auth/callback/route.js      # OAuth callback (sætter cookies)
components/
  player.jsx                    # IFrame kontroller + søg + skift
  track-item.jsx                # Nummer række UI
  dock.jsx                      # Bund navigation (hydreringssikker)
utils/
  toTime.js                     # ms → mm:ss
styles/                         # SCSS (BEM)
```

## Opsætning
1. `.env.local`
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=din_klient_id
SPOTIFY_CLIENT_SECRET=din_klient_hemmelighed
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
```
2. Installer & kør
```
npm i
npm run dev
```

## Nøgleuddrag (Afspiller – søgning + nummerskift)
```jsx
// components/player.jsx (uddrag)
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

  // Indlæs eller skift nummer
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

  // Søg: tryk→træk→slip
  const onDown=()=>dispatch({type:"startSeeking"});
  const onChange=(e)=>dispatch({type:"setLocalPosition", localPosition:Number(e.target.value)||0});
  const onUp=(e)=>{ const v=Number(e.target.value)||0; state.controller?.seek(Math.floor(v/1000)); dispatch({type:"stopSeeking"}); };

  if(!showPlayer||!currentTrack||!albumCover) return null;
  return (
    <section className="player">
      <div id="embed-iframe" ref={controlRef} />
      <button className="player__toggle" onClick={()=>state.controller?.togglePlay()} aria-label={state.isPaused?"Afspil":"Pause"}>
        {state.isPaused ? <Icons.play/> : <Icons.pause/>}
      </button>
      <input type="range" className="player__range" value={state.localPosition} max={state.duration||0}
        onPointerDown={onDown} onChange={onChange} onPointerUp={onUp} />
      <span className="player__time">{msToTime(Math.max(0,(state.duration||0)-(state.position||0)))}</span>
    </section>
  );
}
```

## Noter
- Hold navigationspunkter statiske og beregn `active` med `usePathname()`.
- Inkluder kun Spotify-scriptet **én gang** (layout eller guarded `useEffect`).
- Brug stabile nøgler: `pl.id` for playlister; `track.id || `${currentId}-${i}`` for numre.

## Fremtid (rart at have)
- Stil tavs tokenopdateringsrute
- Playlist-sideinddeling
- Kunstner/Album detaljesider
