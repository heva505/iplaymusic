// middleware.js
import { NextResponse } from "next/server";

export const config = {
  // Don’t run middleware on assets, CSS/JS, fonts, images, API, etc.
  matcher: [
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|assets/|images/|fonts/|.*\\.(?:css|js|map|png|jpg|jpeg|gif|webp|svg|ico|mp4|mp3|txt|xml)$).*)",
  ],
};

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Quick bypass (extra safety even though matcher already excludes)
  if (pathname.startsWith("/api")) return NextResponse.next();

  const hasAccess = request.cookies.has("ipm_access_token");
  const hasRefresh = request.cookies.has("ipm_refresh_token");

  // /login is only for logged-out users
  if (pathname.startsWith("/login")) {
    if (hasAccess) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If logged in, allow everything (and keep "/" as the actual homepage)
  if (hasAccess) {
    return NextResponse.next();
  }

  // Not logged in
  console.log("middleware: no access token");

  // No refresh either -> straight to login
  if (!hasRefresh) {
    console.log("middleware: no refresh token -> /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Try to refresh
  console.log("middleware: attempting refresh with refresh_token");
  try {
    const refreshToken = request.cookies.get("ipm_refresh_token").value;

    // Prefer Basic auth if you have a client secret; else fallback to PKCE body param.
    const clientId =
      process.env.SPOTIFY_CLIENT_ID ||
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (clientId && clientSecret) {
      // Edge runtime has btoa
      headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    // PKCE case (no secret): Spotify wants client_id in the body
    if (!headers.Authorization && clientId) {
      body.set("client_id", clientId);
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      console.log("middleware: refresh failed with status", response.status);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const data = await response.json();

    if (!data.access_token) {
      console.log("middleware: refresh response missing access_token");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Success: set cookies then send user to "/"
    const res = NextResponse.redirect(new URL("/", request.url));

    res.cookies.set("ipm_access_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: typeof data.expires_in === "number" ? data.expires_in : 3600,
    });

    if (data.refresh_token) {
      res.cookies.set("ipm_refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // (Don’t log token contents)
    console.log("middleware: refresh succeeded");
    return res;
  } catch (err) {
    console.log("middleware: refresh error", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
