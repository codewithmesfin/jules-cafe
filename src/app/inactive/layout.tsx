"use client";

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Layout for the inactive page - does not include sidebar
 * This ensures inactive users only see the inactive page without any dashboard elements
 */
export default function InactiveLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [storedUser, setStoredUser] = useState<any>(null);

  // Check localStorage only on client side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setStoredUser(JSON.parse(savedUser));
        }
      } catch (e) {
        // Ignore errors
      }
      setCheckedStorage(true);
    }
  }, []);

  // Immediate redirect for active users - runs before any rendering
  useLayoutEffect(() => {
    // Check stored user first
    if (typeof window !== 'undefined' && storedUser) {
      if (storedUser.status === 'active') {
        router.replace('/dashboard');
        return;
      }
      // Inactive user - allow them to see the page
      return;
    }

    // Wait for AuthContext if no stored user
    if (!loading && user) {
      if (user.status === 'active') {
        let redirectPath = '/dashboard';
        router.replace(redirectPath);
      }
    } else if (!loading && !user && checkedStorage) {
      router.replace('/login');
    }
  }, [user, router, loading, storedUser, checkedStorage]);

  // Show loading until we've checked storage and auth is loaded
  if (!checkedStorage || (loading && !storedUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60023]"></div>
      </div>
    );
  }

  // If stored user is active, show loading (will redirect via useLayoutEffect)
  if (storedUser && storedUser.status === 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60023]"></div>
      </div>
    );
  }

  // If user from AuthContext is active, don't render (will redirect)
  if (user && user.status === 'active') {
    return null;
  }

  // If no user from both sources, don't render (will redirect)
  if (!user && !storedUser) {
    return null;
  }

  // Render the inactive page content without sidebar
  return <>{children}</>;
}
