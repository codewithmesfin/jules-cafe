
import type { Pin } from '@/utils/hero-types';
import React from 'react';


interface MasonryGridProps {
  pins: Pin[];
  title?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ pins, title }) => {
  return (
    <div className="px-4 md:px-8 py-12">
      {title && <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>}
      <div className="columns-2 md:columns-3 lg:columns-5 xl:columns-6 gap-4 space-y-4">
        {pins.map((pin) => (
          <div key={pin.id} className="break-inside-avoid group cursor-zoom-in relative mb-4">
            <div className="relative rounded-2xl overflow-hidden bg-gray-200 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
               <img
                src={pin.url}
                alt={pin.title}
                className="w-full h-auto block transform group-hover:scale-110 group-hover:brightness-90 transition-all duration-500 ease-out"
                suppressHydrationWarning
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <button className="bg-red-600 text-white font-bold py-3 px-5 rounded-full hover:bg-red-700 transition-colors shadow-lg active:scale-95">
                    Save
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="bg-white/90 p-2 rounded-full backdrop-blur-md cursor-pointer hover:bg-white transition-all transform hover:scale-110">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div className="bg-white/90 p-2 rounded-full backdrop-blur-md cursor-pointer hover:bg-white transition-all transform hover:scale-110">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasonryGrid;
