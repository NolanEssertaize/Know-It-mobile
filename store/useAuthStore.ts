/**
 * @file useAuthStore.ts
 * @description Auth store with secure token storage
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, AuthTokens } from '@/types';
import type { AuthState } from './types';

// Storage keys
const AUTH_TOKENS_KEY = 'knowit_auth_tokens';
const USER_KEY = 'knowit_user';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const saveToSecureStore = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('[Auth] Error saving to secure store:', error);
  }
};

const getFromSecureStore = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('[Auth] Error reading from secure store:', error);
    return null;
  }
};

const deleteFromSecureStore = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('[Auth] Error deleting from secure store:', error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  // ─────────────────────────────────────────────────────────────────────────
  // Initialize auth state from secure storage
  // ─────────────────────────────────────────────────────────────────────────
  initialize: async () => {
    console.log('[Auth] Initializing...');
    try {
      const [tokensJson, userJson] = await Promise.all([
        getFromSecureStore(AUTH_TOKENS_KEY),
        getFromSecureStore(USER_KEY),
      ]);

      if (tokensJson && userJson) {
        const tokens: AuthTokens = JSON.parse(tokensJson);
        const user: User = JSON.parse(userJson);

        // Check if token is expired
        if (tokens.expiresAt > Date.now()) {
          console.log('[Auth] Valid session found');
          set({
            tokens,
            user,
            isAuthenticated: true,
            isInitialized: true,
          });
          return;
        }
        console.log('[Auth] Token expired, clearing...');
      }

      // No valid session
      set({ isInitialized: true });
    } catch (error) {
      console.error('[Auth] Initialize error:', error);
      set({ isInitialized: true });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const user: User = {
        id: 'mock-user-id',
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      const tokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      // Save to secure storage
      await Promise.all([
        saveToSecureStore(AUTH_TOKENS_KEY, JSON.stringify(tokens)),
        saveToSecureStore(USER_KEY, JSON.stringify(user)),
      ]);

      console.log('[Auth] Login successful');
      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Auth] Login error:', error);
      set({
        error: 'Login failed. Please check your credentials.',
        isLoading: false,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────────────────────
  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration
      const user: User = {
        id: 'mock-user-id',
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      const tokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      await Promise.all([
        saveToSecureStore(AUTH_TOKENS_KEY, JSON.stringify(tokens)),
        saveToSecureStore(USER_KEY, JSON.stringify(user)),
      ]);

      console.log('[Auth] Registration successful');
      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      set({
        error: 'Registration failed. Please try again.',
        isLoading: false,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────────────────
  logout: async () => {
    set({ isLoading: true });

    try {
      await Promise.all([
        deleteFromSecureStore(AUTH_TOKENS_KEY),
        deleteFromSecureStore(USER_KEY),
      ]);

      console.log('[Auth] Logout successful');
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      set({ isLoading: false });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Clear error
  // ─────────────────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsAuthLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
