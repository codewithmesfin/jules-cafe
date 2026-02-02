"use client";
import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import MenuView from "@/views/customer/MenuView";

export default function TenantMenuPage() {
  const params = useParams();
  const tenantId = params?.tenant_id as string;

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading menu...</div>}>
      <MenuView companyId={tenantId} />
    </Suspense>
  );
}
