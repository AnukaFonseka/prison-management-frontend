'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/utils/constants';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== ROUTES.LOGIN) {
      router.push(ROUTES.LOGIN);
    }

    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && pathname === ROUTES.LOGIN) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, show nothing (will redirect)
  if (!isAuthenticated && pathname !== ROUTES.LOGIN) {
    return null;
  }

  // If authenticated and on login page, show nothing (will redirect)
  if (isAuthenticated && pathname === ROUTES.LOGIN) {
    return null;
  }

  // Render children if authentication check passes
  return <>{children}</>;
}