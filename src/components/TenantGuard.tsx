"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useNotification } from '@/context/NotificationContext';

interface TenantGuardProps {
  children: React.ReactNode;
}

const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
  const params = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateTenant = async () => {
      const tenantId = params?.tenant_id as string;
      
      if (!tenantId) {
        setIsValidating(false);
        return;
      }

      try {
        await api.public.company.getOne(tenantId);
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

  return <>{children}</>;
};

export default TenantGuard;
