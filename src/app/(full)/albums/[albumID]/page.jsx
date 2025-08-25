import { cookies } from "next/headers";
import Header from "@/components/header";
import TrackItem from "@/components/track-item";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { albumID } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ipm_access_token")?.value;

  if (!accessToken) return { title: "Album" };

  const res = await fetch(`https://api.spotify.com/v1/albums/${albumID}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return { title: "Album" };

  const data = await res.json();
  return { title: data.name };
}

export default async function AlbumDetailPage({ params }) {
  const { albumID } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ipm_access_token")?.value;

  if (!accessToken) {
    return (
      <main className='album-details'>
        <h2 className='album-details__heading'>Album</h2>
        <p className='album-details__error'>
          No Spotify access token found. Please log in.
        </p>
      </main>
    );
  }

  // Fetch album
  const res = await fetch(
    `https://api.spotify.com/v1/albums/${albumID}?market=from_token`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );
  if (!res.ok) {
    return (
      <main className='album-details'>
        <h2 className='album-details__heading'>Album</h2>
        <p className='album-details__error'>
          Spotify API error: {res.status} {res.statusText}
        </p>
      </main>
    );
  }

  const album = await res.json();

  const heroImg = album.images?.[0] || {
    url: "/images/placeholders/album-details.png",
    width: 500,
    height: 500,
  };
  const trackCount = album.total_tracks ?? album.tracks?.items?.length ?? 0;

  return (
    <>
      <Header transparent={true} dark={true} />
      <main className='album-details'>
        {/* Hero Section */}
        <div className='album-details__hero'>
          <img
            src={heroImg.url}
            alt={`Album cover for ${album.name}`}
            className='album-details__background'
          />
          <div className='album-details__overlay'></div>
          <div className='album-details__content'>
            <h2 className='album-details__title'>{album.name}</h2>
            <span className='album-details__songs-count'>
              {trackCount} {trackCount === 1 ? "Song" : "Songs"}
            </span>
          </div>
        </div>

        {/* Track List */}
        <ul className='album-details__track-list'>
          {album.tracks?.items.map((track) => (
            <li key={track.id} className='album-details__track'>
              <TrackItem track={track} albumCover={heroImg} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
