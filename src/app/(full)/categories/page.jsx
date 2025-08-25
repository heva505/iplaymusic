import { cookies } from "next/headers";
import Icons from "@/utils/icons";
import Header from "@/components/header";

export const metadata = { title: "Categories" };

function getColorClass(index) {
  const order = [
    "hot-pink",
    "red",
    "orange",
    "yellow",
    "green",
    "dark-green",
    "cyan",
    "blue",
    "deep-blue",
  ];
  return order[index % order.length];
}

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ipm_access_token")?.value;

  if (!accessToken) {
    return (
      <main className='categories'>
        <h2 className='categories__title'>Categories</h2>
        <p className='categories__error'>
          No Spotify access token found. Please log in.
        </p>
      </main>
    );
  }

  const resp = await fetch(
    "https://api.spotify.com/v1/browse/categories?limit=20",
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );

  if (!resp.ok) {
    return (
      <main className='categories'>
        <h2 className='categories__title'>Categories</h2>
        <p className='categories__error'>
          Spotify API error: {resp.status} {resp.statusText}
        </p>
      </main>
    );
  }

  const data = await resp.json();
  const categories = data?.categories?.items ?? [];

  return (
    <>
      <Header transparent={true} search={true} dark={false} />

      <main className='categories'>
        <section className='categories__section'>
          <h2 className='categories__title'>Categories</h2>

          <div className='categories__wrapper'>
            {categories.map((cat, idx) => (
              <details key={cat.id} className='categories__item'>
                <summary
                  className={`categories__summary ${getColorClass(idx)}`}
                >
                  {cat.name}
                  <Icons.dots size={20} />
                </summary>

                <CategoryPlaylists
                  categoryId={cat.id}
                  accessToken={accessToken}
                />
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

async function CategoryPlaylists({ categoryId, accessToken }) {
  const resp = await fetch(
    `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=10`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );

  if (!resp.ok)
    return <p className='categories__error'>Could not load playlists.</p>;

  const data = await resp.json();
  const playlists = data?.playlists?.items ?? [];

  return (
    <div className='categories__sublist'>
      {playlists.map((pl) => (
        <details key={pl.id} className='categories__subitem'>
          <summary className='categories__subsummary'>
            {pl.name}
            <Icons.forward size={20} className='categories__arrow' />
          </summary>
          <div className='categories__subcontent'>
            <p>{pl.description || "No description"}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
