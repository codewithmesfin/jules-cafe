"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireOnboardingComplete?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  requireOnboardingComplete = true
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (!isAuthenticated) {
      router.replace(`/login?from=${pathname}`);
      return;
    }

    // Check role authorization
    if (user && !allowedRoles.includes(user.role)) {
      router.replace('/');
      return;
    }

    // Check onboarding status (for admin users)
    if (requireOnboardingComplete && user?.role === 'admin' && user.status === 'onboarding') {
      // Allow access to company-setup page
      if (pathname !== '/company-setup') {
        router.replace('/company-setup');
      }
      return;
    }

    // Check if account is inactive/suspended
    if (user && user.role !== 'customer') {
      const inactiveStatuses = ['inactive', 'pending', 'suspended'];
      if (inactiveStatuses.includes(user.status)) {
        router.replace('/inactive');
        return;
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname, loading, requireOnboardingComplete]);

  if (loading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Don't render for onboarding users (except on company-setup)
  if (user?.role === 'admin' && user.status === 'onboarding' && pathname !== '/company-setup') {
    return null;
  }

  return <>{children}</>;
};

/**
 * OnboardingGuard - Ensures user has completed onboarding
 * Redirects to company-setup if onboarding is not complete
 */
export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    // For admin users, check onboarding status
    if (user?.role === 'admin' && user.status === 'onboarding') {
      // Allow access to company-setup page
      if (pathname !== '/company-setup') {
        router.replace('/company-setup');
      }
    }
  }, [isAuthenticated, user, router, pathname, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Don't render for onboarding users (except on company-setup)
  if (user?.role === 'admin' && user.status === 'onboarding' && pathname !== '/company-setup') {
    return null;
  }

  return <>{children}</>;
};

/**
 * TenantGuard - Ensures user has an active company
 * Used to protect tenant-scoped routes
 */
export const TenantGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return;

    // Check if user has a company_id
    if (!user?.company_id && user?.role === 'admin') {
      router.replace('/company-setup');
    }
  }, [isAuthenticated, user, router, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
