"use client";

import Icons from "@/utils/icons";
import "@/styles/pages/_login.scss";
import { useMemo } from "react";

export default function SpotifyLogin() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Missing NEXT_PUBLIC_SPOTIFY_* env vars");
    return null;
  }

  const authUrl = useMemo(() => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "user-read-private user-read-email",
      redirect_uri: redirectUri,
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }, [clientId, redirectUri]);

  return (
    <div className='login__biometric'>
      <a href={authUrl} className='biometric__button'>
        <Icons.fingerPrint aria-label='Finger print icon' />
      </a>
      <p className='biometric__label'>One-Touch Login</p>
    </div>
  );
}
