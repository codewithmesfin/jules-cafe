"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckIcon, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const PRICING_PLAN = {
  name: "Standard Plan",
  description: "Everything you need to run your cafe or restaurant",
  dailyPrice: 100,
  features: [
    "Unlimited staff accounts",
    "Full POS system",
    "Inventory management",
    "Order tracking & history",
    "Analytics & reports",
    "Customer database",
    "Table management",
    "Recipe & menu builder",
    "Multi-payment support",
    "Email & chat support",
    "Daily cloud backup",
    "Auto updates",
  ],
};

const PRICINGPage: React.FC = () => {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState<string | null>(null);

  const VAT_RATE = 15;
  const YEARLY_DISCOUNT = 20;

  const calculateSubtotal = (priceWithVAT: number): number => {
    return priceWithVAT / (1 + VAT_RATE / 100);
  };

  const calculatePeriodSubtotal = (dailyPrice: number, interval: "month" | "year"): number => {
    const days = interval === "year" ? 365 : 30;
    const dailySubtotal = calculateSubtotal(dailyPrice);
    return dailySubtotal * days;
  };

  const calculateTotalWithVAT = (dailyPrice: number, interval: "month" | "year"): number => {
    const subtotal = calculatePeriodSubtotal(dailyPrice, interval);
    if (interval === "year") {
      const discount = subtotal * (YEARLY_DISCOUNT / 100);
      return subtotal - discount;
    }
    return subtotal + subtotal * (VAT_RATE / 100);
  };

  const handleSelectPlan = () => {
    setLoading("standard");
    router.push("/dashboard/billing");
  };

  const totalWithVAT = calculateTotalWithVAT(PRICING_PLAN.dailyPrice, billingInterval);
  const yearlyDiscount =
    billingInterval === "year"
      ? calculatePeriodSubtotal(PRICING_PLAN.dailyPrice, "year") * (YEARLY_DISCOUNT / 100)
      : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Simple pricing. One plan. All features.
          </h1>
          <p className="text-xl text-slate-600">
            No hidden fees. No surprises. Just everything you need.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Billing Toggle */}
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <div className="inline-flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                <button
                  onClick={() => setBillingInterval("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    billingInterval === "month"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval("year")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    billingInterval === "year"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Yearly
                  <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{PRICING_PLAN.name}</h3>
              <p className="text-slate-500 mb-6">{PRICING_PLAN.description}</p>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-slate-900">
                    {PRICING_PLAN.dailyPrice}
                  </span>
                  <span className="text-slate-500 text-lg">ETB/day</span>
                </div>
              </div>

              {/* Period Total */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {billingInterval === "year" ? "Yearly" : "Monthly"} payment
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {totalWithVAT.toFixed(0)} ETB
                  </span>
                </div>
                {billingInterval === "year" && (
                  <div className="flex items-center gap-2 text-emerald-600 mt-2">
                    <CheckIcon size={16} />
                    <span className="text-sm font-medium">
                      You save {yearlyDiscount.toFixed(0)} ETB!
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSelectPlan}
                disabled={loading === "standard"}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading === "standard" ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-400 mt-4">
                15% VAT included. Cancel anytime.
              </p>
            </div>

            {/* Features */}
            <div className="px-8 pb-8">
              <p className="text-sm font-semibold text-slate-700 mb-4">Everything included:</p>
              <div className="grid grid-cols-2 gap-3">
                {PRICING_PLAN.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-300 mb-8">Join cafes already using our platform.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            Start for 100 ETB/day
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Common Footer */}
      <Footer />
    </div>
  );
};

export default PRICINGPage;
