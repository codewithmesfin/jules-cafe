"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const bgClass = isLanding ? 'bg-white border-t border-slate-100' : 'bg-white border-t border-slate-100';
  const textClass = isLanding ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-slate-900';
  const headingClass = isLanding ? 'text-slate-900' : 'text-slate-900';

  return (
    <footer className={bgClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Mevin Cafe. All rights reserved.
          </p>
          
          {/* Powered By */}
          <p className="text-sm text-slate-500">
            Powered by <span className="font-semibold text-slate-700">Mevinai PLC</span>
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className={`text-sm ${textClass} transition-colors`}>
              Home
            </Link>
            <Link href="/businesses" className={`text-sm ${textClass} transition-colors`}>
              Clients
            </Link>
            <Link href="/pricing" className={`text-sm ${textClass} transition-colors`}>
              Pricing
            </Link>
            <Link href="/features" className={`text-sm ${textClass} transition-colors`}>
              Feature
            </Link>
            <Link href="/login" className={`text-sm ${textClass} transition-colors`}>
              Login
            </Link>
            <Link href="/signup" className={`text-sm ${textClass} transition-colors`}>
              Signup
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
