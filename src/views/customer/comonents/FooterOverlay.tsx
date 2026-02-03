
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const FooterOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center animate-slide-up pointer-events-none">
      <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-6 max-w-2xl w-full border border-gray-100 pointer-events-auto">
        <div className="text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold mb-1">Start Exploring Restaurants</h3>
          <p className="text-gray-500">Discover new dishes, favorite spots, and culinary inspiration.</p>
        </div>
        <div className="flex gap-4">
          <Link href={"/signup"} className="bg-[#e60023] text-white px-6 py-3 rounded-full font-bold hover:bg-[#ad081b] transition-colors whitespace-nowrap">
            Sign up
          </Link>
          <Link href={"/login"} className="bg-[#efefef] text-black px-6 py-3 rounded-full font-bold hover:bg-[#e2e2e2] transition-colors whitespace-nowrap">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FooterOverlay;
