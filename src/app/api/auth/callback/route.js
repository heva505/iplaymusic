"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request) {
  const cookieStore = await cookies();
  const code = request.nextUrl.searchParams.get("code");

  const response = await fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID +
          ":" +
          process.env.SPOTIFY_CLIENT_SECRET
      )}`,
    },
    body:
      `grant_type=authorization_code` +
      `&code=${code}` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}`,
  });

  const data = await response.json();

  cookieStore.set({
    name: "ipm_access_token",
    value: data.access_token,
    maxAge: data.expires_in,
  });

  cookieStore.set({
    name: "ipm_refresh_token",
    value: data.refresh_token,
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/onboarding");
}
