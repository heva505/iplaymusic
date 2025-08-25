import FeaturedAlbumCard from "@/components/featuredAlbumCard";
import { cookies } from "next/headers";
import Header from "@/components/header";
import Dock from "@/components/dock";

export const metadata = {
  title: "Featured",
};

export default async function FeaturedPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ipm_access_token")?.value;

  if (!accessToken) {
    // optional: show fallback; middleware should already redirect
    return (
      <>
        <Header heading='Featured' search={true} dark={true} />
        <main className='featured'>
          <section className='featured__section'>
            <h2 className='featured__title'>Featured</h2>
            <p className='featured__error'>
              No Spotify access token found. Please log in.NPM
            </p>
          </section>
        </main>
        <Dock />
      </>
    );
  }

  const resp = await fetch("https://api.spotify.com/v1/browse/new-releases", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!resp.ok) {
    return (
      <>
        <Header search={true} transparent={true} dark={false} />
        <main className='featured'>
          <section className='featured__section'>
            <h2 className='featured__title'>Featured</h2>
            <p className='featured__error'>
              Spotify API error: {resp.status} {resp.statusText}
            </p>
          </section>
        </main>
        <Dock />
      </>
    );
  }

  const data = await resp.json();
  const items = data?.albums?.items ?? [];

  return (
    <>
      <Header search={true} transparent={true} dark={false} />
      <main className='featured'>
        <section className='featured__section'>
          <h2 className='featured__title'>Featured</h2>
          <div className='featured__grid'>
            {items.map((album) => (
              <FeaturedAlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      </main>
      <Dock />
    </>
  );
}
