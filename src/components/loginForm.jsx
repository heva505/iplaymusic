"use client";

import { useState } from "react";
import Icons from "@/utils/icons";
import Spotify from "@/components/spotify-login";

export default function LoginForm() {
  const [showLogin, setShowLogin] = useState(true);
  const [startFadeOut, setStartFadeOut] = useState(false);

  return (
    <>
      {showLogin && (
        <section
          className={`login__section ${startFadeOut ? "fade-out" : "fade-in"}`}
        >
          <header className='login__header'>
            <h1 className='login__title'>Log In</h1>
          </header>

          <form className='login__form' onSubmit={(e) => e.preventDefault()}>
            <div className='form__group'>
              <label htmlFor='username' className='form__label'>
                Username
              </label>
              <div className='form__input-wrapper'>
                <input
                  type='text'
                  id='username'
                  name='username'
                  placeholder='Enter your username'
                  className='form__input'
                />
                <span className='form__icon'>
                  <Icons.user size={21} aria-label='username icon' />
                </span>
              </div>
            </div>

            <div className='form__group'>
              <label htmlFor='password' className='form__label'>
                Password
              </label>
              <div className='form__input-wrapper'>
                <input
                  type='password'
                  id='password'
                  name='password'
                  placeholder='Enter your password'
                  className='form__input'
                />
                <span className='form__icon'>
                  <Icons.key size={21} aria-label='password icon' />
                </span>
              </div>
            </div>

            <button type='submit' className='login__button'>
              Log In
            </button>
          </form>

          <Spotify />
        </section>
      )}
    </>
  );
}
