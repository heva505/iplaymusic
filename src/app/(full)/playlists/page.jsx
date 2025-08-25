import { cookies } from "next/headers";
import Header from "@/components/header";
import PlaylistCarouselClient from "@/components/playlist-carousel-client";

export const metadata = { title: "Playlists" };

export default async function PlaylistsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ipm_access_token")?.value;

  if (!accessToken) {
    return (
      <>
        <main className='playlist'>
          <h2 className='playlist__title'>Playlists</h2>
          <p className='playlist__error'>
            No Spotify access token found. Please log in.
          </p>
        </main>
      </>
    );
  }

  // Featured playlists
  const listResp = await fetch(
    "https://api.spotify.com/v1/browse/featured-playlists?limit=50",
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );

  if (!listResp.ok) {
    return (
      <>
        <main className='playlist'>
          <h2 className='playlist__title'>Playlists</h2>
          <p className='playlist__error'>
            Spotify API error: {listResp.status} {listResp.statusText}
          </p>
        </main>
      </>
    );
  }

  const listData = await listResp.json();
  const rawItems = listData?.playlists?.items ?? [];

  // De‑dupe by id and drop invalids
  const seen = new Set();
  const playlists = rawItems.filter((pl) => {
    if (!pl?.id || seen.has(pl.id)) return false;
    seen.add(pl.id);
    return true;
  });

  const featured = playlists.slice(0, 12);
  const current = featured[0];

  // Preload first playlist’s tracks for instant paint
  let initialTracks = [];
  if (current?.id) {
    const tracksResp = await fetch(
      `https://api.spotify.com/v1/playlists/${current.id}/tracks?limit=50`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
    );
    if (tracksResp.ok) {
      const tData = await tracksResp.json();
      initialTracks = (tData.items || []).map((i) => i.track).filter(Boolean);
    }
  }

  return (
    <>
      <Header heading='Playlists' search={true} dark={true} />
      <main className='playlist'>
        <img
          className='playlist__background-img'
          src='/images/sound-wave.png'
          alt='Gradient background image'
        />

        <h2 className='playlist__title'>Playlists</h2>

        <PlaylistCarouselClient
          featured={featured}
          initialCurrentId={current?.id || null}
          initialTracks={initialTracks}
        />
      </main>
    </>
  );
}
