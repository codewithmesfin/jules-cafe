'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat, ArrowRight, Play } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative pt-20 pb-16 lg:pt-32 lg:pb-32 flex items-center">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Modern POS for Smart Businesses
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Manage your <span className="text-primary italic">Restaurant</span> with confidence.
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The all-in-one platform for modern gastronomy. streamline orders, track inventory, and grow your revenue with Quick Serve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-hover transition-all shadow-xl hover:shadow-primary/20 transform hover:-translate-y-1"
              >
                Start for Free <ArrowRight size={20} />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all border border-slate-200 group">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Play size={14} fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900">Join 500+ businesses</p>
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="lg:col-span-5 relative animate-slide-in-right delay-200">
            <div className="relative z-10 w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center">
              {/* Main App Mockup Container */}
              <div className="relative w-full h-full max-w-[450px] mx-auto bg-slate-900 rounded-[3rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-slate-800">
                <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden relative">
                  {/* Mock App Header */}
                  <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                    <ChefHat size={18} className="text-primary" />
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  {/* Mock App Content */}
                  <div className="p-4 space-y-4">
                    <div className="h-24 bg-primary/5 rounded-2xl border border-primary/10 p-3">
                      <div className="w-2/3 h-3 bg-primary/20 rounded-full mb-2"></div>
                      <div className="w-full h-8 bg-primary/10 rounded-xl"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-square bg-slate-50 rounded-2xl"></div>
                      <div className="aspect-square bg-slate-50 rounded-2xl"></div>
                      <div className="aspect-square bg-slate-50 rounded-2xl"></div>
                      <div className="aspect-square bg-slate-50 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10"></div>

              {/* Floating stats card */}
              <div className="absolute top-1/4 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ArrowRight size={20} className="-rotate-45" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Revenue</p>
                    <p className="text-xl font-extrabold text-slate-900">+24.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;