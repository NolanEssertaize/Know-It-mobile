/**
 * @file useGoogleAuth.ts
 * @description Google Sign-In hook using backend OAuth flow
 *
 * Opens a browser to the backend's Google OAuth endpoint.
 * The backend handles the full OAuth exchange with Google,
 * then redirects back to the app via deep link with JWT tokens.
 */

import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_ENDPOINTS } from '@/shared/api';
import { SecureTokenManager } from '@/shared/api/SecureStorage';
import { useAuthStore } from '@/store';
import type { UserRead } from '@/shared/api';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResult {
  success: boolean;
  error?: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async (): Promise<GoogleAuthResult> => {
    try {
      setIsLoading(true);

      // Build the return URL the backend will redirect to after OAuth
      const returnUrl = Linking.createURL('auth');

      // Always use the VPS for Google OAuth (Google rejects raw IPs)
      const OAUTH_BASE_URL = 'https://essertaize.com';
      const backendUrl =
        `${OAUTH_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_MOBILE}` +
        `?redirect_uri=${encodeURIComponent(returnUrl)}`;

      if (__DEV__) {
        console.log('[useGoogleAuth] Opening:', backendUrl);
        console.log('[useGoogleAuth] Return URL:', returnUrl);
      }

      // Open browser → backend → Google → backend callback → redirect back to app
      const result = await WebBrowser.openAuthSessionAsync(backendUrl, returnUrl);

      if (result.type !== 'success') {
        // User dismissed or cancelled
        return { success: false };
      }

      // Parse tokens and user from the redirect URL
      const parsed = Linking.parse(result.url);
      const params = parsed.queryParams ?? {};

      const errorParam = params.error as string | undefined;
      if (errorParam) {
        return { success: false, error: decodeURIComponent(errorParam) };
      }

      const accessToken = params.access_token as string | undefined;
      const refreshToken = params.refresh_token as string | undefined;
      const userParam = params.user as string | undefined;

      if (!accessToken || !refreshToken) {
        return { success: false, error: 'No tokens received from server' };
      }

      // Store tokens securely
      await SecureTokenManager.setTokens({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
      });

      // Parse and store user data
      let user: UserRead | null = null;
      if (userParam) {
        try {
          user = JSON.parse(decodeURIComponent(userParam));
          await SecureTokenManager.setUser(user);
        } catch {
          console.warn('[useGoogleAuth] Failed to parse user data');
        }
      }

      // Update auth store
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('[useGoogleAuth] Google login successful');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      console.error('[useGoogleAuth] Error:', message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { handleGoogleSignIn, isLoading };
}
