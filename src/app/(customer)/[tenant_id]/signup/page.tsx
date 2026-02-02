"use client";
import Signup from "@/views/customer/Signup";
import { Suspense } from 'react';

export default function TenantSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}
