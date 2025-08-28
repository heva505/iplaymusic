"use client";
 
import Icons from "@/utils/icons";
import "@/styles/pages/_login.scss";
 
function makeState(len = 32) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const buf = new Uint8Array(len);
    window.crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, len);
  }
  return Math.random()
    .toString(36)
    .slice(2, 2 + len);
}
 
export default function SpotifyLogin() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
 
  if (!clientId || !redirectUri) {
    if (typeof window !== "undefined") {
      console.error("Missing NEXT_PUBLIC_SPOTIFY_* env vars");
    }
    return null;
  }
 
  const handleLogin = () => {
    const state = makeState();
    try {
      sessionStorage.setItem("spotify_oauth_state", state);
    } catch {}
 
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user-read-private user-read-email",
      state,
    });
 
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };
 
  return (
    <div className='login__biometric'>
      <button
        type='button'
        onClick={handleLogin}
        className='biometric__button'
        aria-label='Log ind med Spotify'
      >
        <Icons.fingerPrint aria-label='Finger print icon' />
      </button>
      <p className='biometric__label'>One-Touch Login</p>
    </div>
  );
}
 