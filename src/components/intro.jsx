"use client";
import { useEffect, useState } from "react";
import "@/styles/components/_intro.scss";

export default function Intro() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHide(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`intro ${hide ? "intro--hide" : ""}`}>
      <div className='intro__content'>
        <img
          src='/images/music-logo-solid.png'
          alt='iPlayMusic logo'
          className='intro__logo'
        />
        <h1 className='intro__title'>iPlayMusic</h1>
      </div>
    </section>
  );
}
