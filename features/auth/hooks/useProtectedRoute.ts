/**
 * @file useProtectedRoute.ts
 * @description Hook for protecting routes that require authentication
 */

import { useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/store';

interface UseProtectedRouteReturn {
  /** Whether the route check is complete */
  isReady: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Hook to protect routes and handle auth-based navigation
 * 
 * - Redirects unauthenticated users to /auth/login
 * - Redirects authenticated users away from auth screens
 */
export function useProtectedRoute(): UseProtectedRouteReturn {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Auth state
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  // Track if we've done the initial redirect check
  const [isReady, setIsReady] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Handle navigation based on auth state
  useEffect(() => {
    // Wait for navigation to be ready
    if (!navigationState?.key) return;

    // Wait for auth to be initialized
    if (!isInitialized) return;

    // Check if we're in the auth group
    const inAuthGroup = segments[0] === 'auth' || segments[0] === '(auth)';

    console.log('[useProtectedRoute] Checking route:', {
      segments,
      isAuthenticated,
      inAuthGroup,
    });

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      console.log('[useProtectedRoute] Redirecting to login');
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated but in auth group
      console.log('[useProtectedRoute] Redirecting to home');
      router.replace('/');
    }

    // Mark as ready after first check
    setIsReady(true);
  }, [isAuthenticated, isInitialized, segments, navigationState?.key, router]);

  return {
    isReady: isReady && isInitialized,
    isAuthenticated,
  };
}
