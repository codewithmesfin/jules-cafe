"use client";
import React, { Suspense } from 'react';
import MenuView from "@/views/customer/MenuView";

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading menu...</div>}>
      <MenuView />
    </Suspense>
  );
}
