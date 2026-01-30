"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${pathname}`);
    } else if (user && !allowedRoles.includes(user.role)) {
      router.replace('/');
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname]);

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};
