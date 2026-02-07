"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Utensils, Users, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

const TOP_FEATURES = [
  {
    icon: Utensils,
    title: "Orders & POS",
    description: "Take orders fast. Track every sale. Manage tables and kitchen from one screen.",
  },
  {
    icon: Users,
    title: "Customers & Loyalty",
    description: "Know your customers. Build loyalty. Send promotions that actually get redeemed.",
  },
  {
    icon: TrendingUp,
    title: "Inventory & Reports",
    description: "Never run out of stock. Know what is selling. Spot trends before they cost you.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Everything you need to run your cafe
          </h1>
          <p className="text-xl text-slate-600">
            No more juggling apps. One platform for orders, customers, inventory, and reports.
          </p>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {TOP_FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Plus all the essentials
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Menu & recipe management",
              "Staff scheduling & tracking",
              "Kitchen display system",
              "Online ordering portal",
              "Waste tracking",
              "Multi-location support",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your operations?</h2>
          <p className="text-slate-300 mb-8">Start for just 100 Br/day. No credit card required.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            Start for 100 Br/day
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Common Footer */}
      <Footer />
    </div>
  );
}
