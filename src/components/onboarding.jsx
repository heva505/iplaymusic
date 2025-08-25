"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icons from "@/utils/icons";

const slides = [
  {
    border: "blob-1",
    title: "Where Words Fail,\nMusic Speaks",
    text: "Listen in, link up, and discover what others are vibing to, connect through pure sound.",
    icon: "signal",
  },
  {
    border: "blob-2",
    title: "No Music,\nNo Life",
    text: "Your music says who you are. Build your vibe, find your rhythm, and stay in the groove.",
    icon: "heart",
  },
  {
    border: "blob-3",
    title: "Peace, Love, Music",
    text: "Bring the good vibes. Share tracks, spread love, and let music do the talking.",
    icon: "note",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const handleChange = (i) => {
    if (i !== index) {
      setFading(true);
      const t = setTimeout(() => {
        setIndex(i);
        setFading(false);
      }, 300);
      // safety in case the component unmounts mid-fade
      return () => clearTimeout(t);
    }
  };

  const current = slides[index];

  return (
    <section className='onboarding' aria-live='polite'>
      <div className={`onboarding__image-wrapper ${current.border}`}>
        <Image
          src='/images/blob.png'
          alt='Abstract music blob'
          width={512}
          height={512}
          priority
        />
      </div>

      <div className={`onboarding__content ${fading ? "fade" : ""}`}>
        <h2 className='onboarding__title'>
          {current.title.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <p className='onboarding__text'>{current.text}</p>
      </div>

      <div
        className='onboarding__buttons'
        role='tablist'
        aria-label='Onboarding slides'
      >
        {slides.map((slide, i) => (
          <button
            key={i}
            className={`onboarding__icon-button ${i === index ? "active" : ""}`}
            onClick={() => handleChange(i)}
            aria-label={`Select: ${slide.title.replace("\n", " ")}`}
            aria-selected={i === index}
            role='tab'
          >
            {slide.icon === "signal" && <Icons.signal aria-hidden />}
            {slide.icon === "heart" && <Icons.heart aria-hidden />}
            {slide.icon === "note" && <Icons.note aria-hidden />}
          </button>
        ))}
      </div>

      <Link href='/' className='onboarding__skip' aria-label='Skip onboarding'>
        SKIP
      </Link>
    </section>
  );
}
