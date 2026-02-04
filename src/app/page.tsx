"use client"
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/HeroSection';
import FooterOverlay from '@/components/FooterOverlay';
import {
  Zap,
  BarChart3,
  Layers,
  Smartphone,
  ShieldCheck,
  Clock
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="hero" className="overflow-hidden">
          <Hero />
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
              <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Powerful Features</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need to run your business</h3>
              <p className="text-lg text-slate-600">
                Quick Serve provides a comprehensive suite of tools designed specifically for modern restaurants and cafes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Lightning Fast POS',
                  desc: 'Process orders in seconds with our intuitive, touch-optimized point of sale interface.',
                  icon: Zap,
                  color: 'bg-blue-50 text-blue-600'
                },
                {
                  title: 'Inventory Control',
                  desc: 'Track ingredients, manage stock levels, and get automated low-stock alerts.',
                  icon: Layers,
                  color: 'bg-rose-50 text-rose-600'
                },
                {
                  title: 'Real-time Analytics',
                  desc: 'Gain deep insights into your sales performance, popular items, and peak hours.',
                  icon: BarChart3,
                  color: 'bg-emerald-50 text-emerald-600'
                },
                {
                  title: 'Mobile First',
                  desc: 'Manage your business from anywhere. Our platform is fully responsive and mobile-optimized.',
                  icon: Smartphone,
                  color: 'bg-purple-50 text-purple-600'
                },
                {
                  title: 'Secure & Reliable',
                  desc: 'Your data is safe with enterprise-grade security and 99.9% uptime guarantee.',
                  icon: ShieldCheck,
                  color: 'bg-amber-50 text-amber-600'
                },
                {
                  title: 'Order Queue',
                  desc: 'Keep your kitchen organized with a real-time order tracking and management system.',
                  icon: Clock,
                  color: 'bg-indigo-50 text-indigo-600'
                }
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 animate-slide-up`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Showcase Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 animate-slide-up">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
                  Designed for the <span className="text-primary">Modern Gastronomy</span>
                </h2>
                <div className="space-y-6">
                  {[
                    "Intuitive interface requires minimal staff training",
                    "Multi-business management from a single dashboard",
                    "Automated ingredient tracking and recipe costing",
                    "Real-time kitchen display and order status"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 bg-primary/10 p-1 rounded-full text-primary">
                        <ShieldCheck size={18} />
                      </div>
                      <p className="text-lg text-slate-700 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-10">
                  <button className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary-hover transition-all transform hover:-translate-y-1">
                    Get Started Now
                  </button>
                </div>
              </div>
              <div className="flex-1 relative animate-slide-in-right">
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-900/5">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-630566e4a021?auto=format&fit=crop&q=80&w=1000"
                    alt="POS System"
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)]"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to grow your restaurant business?</h2>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                  Join hundreds of businesses that use Quick Serve to streamline operations and increase revenue.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-all shadow-xl">
                    Start Free Trial
                  </button>
                  <button className="bg-slate-800 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700">
                    Schedule Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterOverlay />
    </div>
  );
};

export default Home;