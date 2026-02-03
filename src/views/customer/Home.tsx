import React from 'react';
import MasonryGrid from './comonents/MasonryGrids';
import { EXPLORE_PINS } from '@/utils/hero-teams';
import Hero from './comonents/HeroSection';
import FooterOverlay from './comonents/FooterOverlay';

const Home: React.FC = () => {
  return <div>
    <div>
      {/* Main Brand Intro Section */}
      <section id="hero" className="border-b border-gray-50">
        <Hero />
      </section>

      {/* Content Section: Trending and Grid */}
      <section id="explore" className="bg-white min-h-screen pt-12 lg:pt-20">
        <div className="max-w-[2000px] mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 lg:mb-8 text-black">See what's trending</h2>
            <div className="flex gap-2.5 md:gap-4 flex-wrap justify-center max-w-3xl">
              {[
                { label: 'Summer fashion', emoji: '👗' },
                { label: 'Nail art', emoji: '💅' },
                { label: 'Home office', emoji: '💻' },
                { label: 'Dessert recipes', emoji: '🍰' },
                { label: 'Travel tips', emoji: '✈️' }
              ].map(tag => (
                <button
                  key={tag.label}
                  className="group px-6 py-3.5 rounded-full bg-gray-50 font-bold hover:bg-gray-100 transition-all flex items-center gap-2 border border-transparent active:scale-95 shadow-sm hover:shadow"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{tag.emoji}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Feed */}
          <div className="relative">
            <MasonryGrid pins={EXPLORE_PINS} />

            {/* Visual anchor for loading */}
            <div className="flex justify-center py-20">
              <button className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-lg">
                Load more ideas
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    {/* Sticky Bottom Call to Action for Guests */}
    <FooterOverlay />
  </div>
};

export default Home;
