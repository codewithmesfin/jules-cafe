'use client';

import React, { useEffect, useState } from 'react';
import { HERO_THEMES } from '@/utils/hero-teams';
import Link from 'next/link';

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentTheme = HERO_THEMES[currentIndex];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_THEMES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="pb-24 relative min-h-full bg-white overflow-hidden flex items-center">

      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 px-6 md:px-12 lg:px-20 items-center">
        {/* LEFT CONTENT */}
        <div className="order-2 lg:order-1 z-20 space-y-8 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold">
            Explore flavors of
          </h1>

          {/* Animated keyword */}
          <div className="relative h-[60px] lg:h-[90px] overflow-hidden -mt-5">
            {HERO_THEMES.map((theme, i) => (
              <div
                key={i}
                className={`absolute inset-0 text-4xl md:text-5xl lg:text-[64px] font-bold
                  transition-all duration-[900ms]
                  ease-[cubic-bezier(0.19,1,0.22,1)]
                  ${i === currentIndex
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'}
                  ${theme.color}`}
              >
                {theme.keyword}
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center lg:justify-start gap-3">
            {HERO_THEMES.map((theme, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsPlaying(false);
                }}
                className="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor:
                    i === currentIndex ? theme.accent : '#e5e5e5',
                  transform: i === currentIndex ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-6 items-center justify-center lg:justify-start">
            <Link href={"/signup"} className="bg-[#e60023] text-white px-8 py-4 rounded-3xl font-bold">
              Join Quick Serve for free
            </Link>
            <Link href={"/login"} className="font-bold cursor-pointer">
              I already have an account
            </Link>
          </div>
        </div>

        {/* RIGHT – PINTEREST IMAGE STACK */}
        <div className="order-1 lg:order-2 relative h-[480px] lg:h-[660px] flex justify-center items-center">

          <div className="relative w-[280px] md:w-[360px] lg:w-[400px] aspect-[4/5]">
            {HERO_THEMES.map((theme, i) => {
              const isActive = i === currentIndex;

              return (
                <React.Fragment key={i}>

                  {/* MAIN IMAGE */}
                  <div
                  >
                    <div
                      className={`absolute inset-0 rounded-[52px] overflow-hidden shadow-xl
                      transition-all duration-[1100ms]
                      ease-[cubic-bezier(0.19,1,0.22,1)] -rotate-[5deg]
                      ${isActive
                          ? 'opacity-100 translate-y-0 scale-100 z-20'
                          : 'opacity-0 translate-y-12 scale-[0.97] z-10'}
                    `}
                    >
                      <img
                        src={theme.mainImage}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>

                    {/* PIN BUBBLE (image-aligned) */}
                    <div
                      className={`absolute top-2 right-0 lg:-top-10 lg:-right-6
                        w-11 h-11 lg:w-18 lg:h-18 z-50
                        rounded-2xl lg:rounded-[20px]
                        flex items-center justify-center shadow-xl
                        transition-all duration-700
                        ease-[cubic-bezier(0.19,1,0.22,1)]
                        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                      `}
                      style={{ backgroundColor: theme.accent }}
                    >
                      <svg
                        className="w-5 h-5 lg:w-7 lg:h-7 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.72 2.03C10.53 2.03 8.44 2.89 6.89 4.44c-1.55 1.55-2.41 3.64-2.41 5.83 0 1.63.48 3.16 1.3 4.45L2 22l7.72-3.73c1.29.82 2.82 1.3 4.45 1.3 2.19 0 4.28-.86 5.83-2.41s2.41-3.64 2.41-5.83c0-2.19-.86-4.28-2.41-5.83s-3.64-2.41-5.83-2.41z" />
                      </svg>
                    </div>
                  </div>

                  {/* SECONDARY IMAGE */}
                  <div
                    className={`absolute right-[-80px] bottom-[-80px]
                      w-[250px] h-[300px]
                      rounded-[36px] overflow-hidden
                      border-[8px] border-white shadow-xl
                      transition-all duration-[1300ms]
                      ease-[cubic-bezier(0.19,1,0.22,1)]
                      ${isActive
                        ? 'opacity-100 translate-y-0 rotate-[20deg] scale-100 z-30'
                        : 'opacity-0 translate-y-14 rotate-[12deg] scale-[0.95] z-10'}
                    `}
                  >
                    <img
                      src={theme.subImage}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* PLAY / PAUSE BUTTON */}
      <div className="absolute bottom-6 right-6 lg:bottom-24 lg:right-20 z-40">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-11 h-11 border border-gray-200
                    rounded-xl bg-gray-200 backdrop-blur-md
                    hover:bg-gray-100 transition-colors
                    flex items-center justify-center shadow-sm"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

    </div>
  );
};

export default Hero;
