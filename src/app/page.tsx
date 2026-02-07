"use client"
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/HeroSection';
import FooterOverlay from '@/components/FooterOverlay';

const Home: React.FC = () => {
  return <div className="bg-white min-h-screen">
    <Navbar />
    <div>
      {/* Main Brand Intro Section */}
      <section id="hero" className="border-b border-slate-100">
        <Hero />
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Designed to Make Your Life Easier</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {["Save Time", "Reduce Waste", "Manage Anywhere", "Grow Confidently"].map((benefit) => (
              <div key={benefit} className="p-6 bg-white rounded-2xl shadow text-center">
                <h3 className="font-semibold text-lg mb-2">{benefit}</h3>
                <p className="text-gray-600 text-sm">
                  Everything updates in real time so you always stay in control.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
    {/* Sticky Bottom Call to Action for Guests */}
    <FooterOverlay />
    {/* Main Footer */}
    <Footer />
  </div>
};

export default Home;
