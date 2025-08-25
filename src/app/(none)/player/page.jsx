"use client";

import Image from "next/image";
import Header from "@/components/header";
import Icons from "@/utils/icons";

export default function PlayerPage() {
  return (
    <>
      <Header heading='Playing' search={false} dark={false} />
      <main className='player'>
        <section className='player__section'>
          <article className='player__vinyl-wrapper'>
            <figure className='player__vinyl'>
              <Image
                src='/images/vinyl.png'
                alt='Rotating vinyl record'
                width={320}
                height={320}
                priority
              />
            </figure>
          </article>

          <div className='player__info'>
            <h2 className='player__title'>Don't Call Me Up</h2>
            <p className='player__artist'>Mabel</p>
          </div>

          <div className='player__progress'>
            <input
              type='range'
              className='player__slider'
              min={0}
              max={220} // 3:40 = 220s (tweak if you wire it up)
              defaultValue={0}
              aria-label='Seek position'
            />
            <div className='player__time-wrapper'>
              <span className='player__time player__time--start'>0:00</span>
              <span className='player__time player__time--end'>3:40</span>
            </div>
          </div>

          <nav className='player__controls' aria-label='Player controls'>
            <button
              className='player__button player__button--skip-back'
              aria-label='Skip to beginning'
              type='button'
            >
              <Icons.skipb size={30} />
            </button>

            <button
              className='player__button player__button--prev'
              aria-label='Previous track'
              type='button'
            >
              <Icons.prev size={30} />
            </button>

            <button
              className='player__button player__button--play'
              aria-label='Play or pause'
              type='button'
            >
              <Icons.play size={50} />
            </button>

            <button
              className='player__button player__button--next'
              aria-label='Next track'
              type='button'
            >
              <Icons.next size={30} />
            </button>

            <button
              className='player__button player__button--skip-forward'
              aria-label='Skip to end'
              type='button'
            >
              <Icons.skipf size={30} />
            </button>
          </nav>
        </section>
      </main>
    </>
  );
}
