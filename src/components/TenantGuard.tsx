"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useNotification } from '@/context/NotificationContext';

interface TenantGuardProps {
  children: React.ReactNode;
}

export interface CompanyData {
  id: string;
  name: string;
  logo?: string;
}

const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
  const params = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  useEffect(() => {
    const validateTenant = async () => {
      const tenantId = params?.tenant_id as string;
      
      if (!tenantId) {
        setIsValidating(false);
        return;
      }

      try {
        const company = await api.public.getBusiness(tenantId);
        setCompanyData(company);
        // Store company data in sessionStorage for use in layout
        sessionStorage.setItem('tenantCompany', JSON.stringify(company));
        // Dispatch event so layout can update immediately
        window.dispatchEvent(new CustomEvent('tenantCompanyLoaded', { detail: company }));
        setIsValid(true);
      } catch (error: any) {
        // Company not found or not active
        showNotification(error.message || 'This restaurant is not available', 'error');
        router.push('/');
      } finally {
        setIsValidating(false);
      }
    };

    validateTenant();
  }, [params?.tenant_id, router, showNotification]);

  if (isValidating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60023]"></div>
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return (
    <TenantContext.Provider value={companyData}>
      {children}
    </TenantContext.Provider>
  );
};

// Create a context for tenant data
export const TenantContext = React.createContext<CompanyData | null>(null);

export default TenantGuard;
