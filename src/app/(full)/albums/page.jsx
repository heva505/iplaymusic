// app/(full)/albums/page.jsx
import Link from "next/link";
import { cookies } from "next/headers";
import Header from "@/components/header";

export const metadata = {
  title: "Albums",
};

export default async function AlbumsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ipm_access_token")?.value;

  if (!accessToken) {
    return (
      <>
        <main className='albums'>
          <h2 className='albums__title'>All Albums</h2>
          <p className='albums__error'>
            No Spotify access token found. Please log in.
          </p>
        </main>
      </>
    );
  }

  const resp = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=50",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!resp.ok) {
    return (
      <>
        <main className='albums'>
          <h2 className='albums__title'>All Albums</h2>
          <p className='albums__error'>
            Spotify API error: {resp.status} {resp.statusText}
          </p>
        </main>
      </>
    );
  }

  const data = await resp.json();
  const items = data?.albums?.items ?? [];

  const featuredAlbums = items.slice(0, 6);
  const newReleases = items.slice(6);

  return (
    <>
      <Header transparent={true} search={true} dark={false} />

      <main className='albums'>
        <h2 className='albums__title'>All Albums</h2>

        <section className='albums__section'>
          <div className='albums__subheading'>
            <h3 className='albums__heading'>Featured Albums</h3>
            <a className='albums__viewall' href='#'>
              View All
            </a>
          </div>

          <div className='albums__featured'>
            {featuredAlbums.map((album) => {
              const cover =
                album.images?.[0]?.url || "/images/placeholders/album.png";
              return (
                <Link
                  href={`/albums/${album.id}`}
                  key={album.id}
                  className='albums__featured-item'
                  aria-label={`Open album ${album.name}`}
                >
                  <img
                    src={cover}
                    alt={`Cover of ${album.name}`}
                    className='albums__featured-img'
                    loading='lazy'
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* New Releases (rest) */}
        <section className='albums__section'>
          <div className='albums__subheading'>
            <h3 className='albums__heading'>New Releases</h3>
            <a className='albums__viewall' href='#'>
              View All
            </a>
          </div>

          <ul className='albums__list'>
            {newReleases.map((album) => {
              const cover =
                album.images?.[0]?.url || "/images/placeholders/album.png";
              const artistNames = (album.artists || [])
                .map((a) => a.name)
                .join(", ");
              return (
                <li className='albums__item' key={album.id}>
                  <Link
                    href={`/albums/${album.id}`}
                    className='albums__item-link'
                    aria-label={`Open album ${album.name}`}
                  >
                    <img
                      src={cover}
                      alt={`Cover of ${album.name}`}
                      className='albums__item-img'
                      loading='lazy'
                    />
                    <div className='albums__info'>
                      <h3 className='albums__name'>{album.name}</h3>
                      <p className='albums__artist'>{artistNames}</p>
                    </div>
                    <span className='albums__count'>
                      {album.total_tracks ?? "—"} tracks
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
