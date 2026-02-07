'use client';

import Link from 'next/link';
import React from 'react';

const Hero: React.FC = () => {
  return <section className="bg-gradient-to-br from-amber-50 to-white">
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Run Your Cafe or Restaurant <span className="text-amber-600">Simply</span>.
          <br /> Manage Everything from One Place.
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          An easy-to-use, affordable software built for cafes, coffee shops, and restaurants.
          Manage menus, inventory, orders, and multiple locations — all from your phone.
        </p>
        <div className="flex item-center gap-4">
          <Link href={"/signup"} className="px-3 md:px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold shadow-lg hover:bg-amber-700 transition">
            Start for 100 Br
          </Link>
          <Link href={"/login"} className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50 transition">
            Get a demo
          </Link>
        </div>
      </div>
      <div className="relative">
        <div className="rounded-2xl shadow-xl bg-gray-100 h-80 flex items-center justify-center text-gray-400">
          Product Dashboard Preview
        </div>
      </div>
    </div>
  </section>
};

export default Hero;
