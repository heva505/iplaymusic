"use client";

import Icons from "@/utils/icons";
import { useRouter } from "next/navigation";

export default function Header({
  heading,
  search = false,
  transparent = false,
  mode = "system",
  dark,
}) {
  const router = useRouter();

  // Resolve mode class
  let modeClass = "";
  if (typeof dark === "boolean") {
    modeClass = dark ? "mode-dark" : "mode-light";
  } else if (mode === "dark") {
    modeClass = "mode-dark";
  } else if (mode === "light") {
    modeClass = "mode-light";
  }

  const handleSearch = () => {
    console.log("Search triggered");
  };

  return (
    <header
      className={`header${transparent ? " header--transparent" : ""}${
        modeClass ? ` ${modeClass}` : ""
      }`}
    >
      <div className='header__container'>
        <div className='header__icon-container'>
          <button
            className={`header__icon-button${modeClass ? ` ${modeClass}` : ""}`}
            onClick={() => router.back()}
            aria-label='Go back'
          >
            <Icons.back size={20} />
          </button>
        </div>

        <div className='header__title-container'>
          <h1 className={`header__title${modeClass ? ` ${modeClass}` : ""}`}>
            {heading}
          </h1>
        </div>

        <div className='header__actions'>
          {search && (
            <button
              className={`header__icon-button${
                modeClass ? ` ${modeClass}` : ""
              }`}
              onClick={handleSearch}
              aria-label='Search'
            >
              <Icons.search size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
