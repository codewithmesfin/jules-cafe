'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const FooterOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center animate-slide-up pointer-events-none">
      <div className="glass px-8 py-5 rounded-[2rem] shadow-premium flex flex-col md:flex-row items-center gap-6 max-w-3xl w-full border border-white/50 pointer-events-auto">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-slate-900 mb-0.5">Ready to transform your business?</h3>
          <p className="text-sm text-slate-500">Join Quick Serve today and experience the future of POS.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-6 py-3 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">
            Log in
          </Link>
          <Link href="/signup" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 text-sm flex items-center gap-2">
            Sign up <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FooterOverlay;