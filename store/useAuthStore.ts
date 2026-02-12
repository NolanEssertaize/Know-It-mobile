/**
 * @file useAuthStore.ts
 * @description Authentication Store - Global auth state management
 * 
 * Requires API connection to be established before initialization.
 * Uses expo-secure-store for token storage.
 */

import { create } from 'zustand';
import { AuthService } from '@/shared/services';
import { ApiException } from '@/shared/api';
import type { UserRead, UserCreate, UserLogin, UserUpdate } from '@/shared/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AuthState {
  user: UserRead | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  login: (data: UserLogin) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UserUpdate) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

type AuthStore = AuthState & AuthActions;

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isInitialized: false,

  /**
   * Initialize auth state from stored tokens
   * Called after API connection is established
   */
  initialize: async () => {
    if (get().isInitialized) return;

    console.log('[AuthStore] Initializing...');
    set({ isLoading: true, error: null });

    try {
      const user = await AuthService.initializeAuth();
      
      set({
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        isInitialized: true,
      });

      console.log('[AuthStore] Initialized, authenticated:', user !== null);
    } catch (error) {
      console.error('[AuthStore] Initialization failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: error instanceof Error ? error.message : 'Initialization failed',
      });
    }
  },

  /**
   * Register a new user
   */
  register: async (data: UserCreate) => {
    console.log('[AuthStore] Registering...');
    set({ isLoading: true, error: null });

    try {
      const response = await AuthService.register(data);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('[AuthStore] Registration successful');
    } catch (error) {
      const message = error instanceof ApiException
        ? error.message
        : 'Registration failed';
      
      console.error('[AuthStore] Registration failed:', message);
      set({
        isLoading: false,
        error: message,
      });
      
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  login: async (data: UserLogin) => {
    console.log('[AuthStore] Logging in...');
    set({ isLoading: true, error: null });

    try {
      const response = await AuthService.login(data);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('[AuthStore] Login successful');
    } catch (error) {
      const message = error instanceof ApiException
        ? error.message
        : 'Login failed';
      
      console.error('[AuthStore] Login failed:', message);
      set({
        isLoading: false,
        error: message,
      });
      
      throw error;
    }
  },

  /**
   * Login with Google ID token
   */
  googleLogin: async (idToken: string) => {
    console.log('[AuthStore] Google login...');
    set({ isLoading: true, error: null });

    try {
      const response = await AuthService.googleLogin(idToken);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('[AuthStore] Google login successful');
    } catch (error) {
      const message = error instanceof ApiException
        ? error.message
        : 'Google sign-in failed';

      console.error('[AuthStore] Google login failed:', message);
      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: async () => {
    console.log('[AuthStore] Logging out...');
    set({ isLoading: true });

    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('[AuthStore] Logout API failed, clearing local state');
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    console.log('[AuthStore] Logout complete');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UserUpdate) => {
    console.log('[AuthStore] Updating profile...');
    set({ isLoading: true, error: null });

    try {
      const user = await AuthService.updateProfile(data);
      
      set({
        user,
        isLoading: false,
      });

      console.log('[AuthStore] Profile updated');
    } catch (error) {
      const message = error instanceof ApiException
        ? error.message
        : 'Profile update failed';
      
      console.error('[AuthStore] Profile update failed:', message);
      set({
        isLoading: false,
        error: message,
      });
      
      throw error;
    }
  },

  /**
   * Refresh user data from server
   */
  refreshUser: async () => {
    if (!get().isAuthenticated) return;

    console.log('[AuthStore] Refreshing user...');

    try {
      const user = await AuthService.getCurrentUser();
      set({ user });
      console.log('[AuthStore] User refreshed');
    } catch (error) {
      console.error('[AuthStore] User refresh failed:', error);
      
      if (error instanceof ApiException && error.code === 'AUTH_REQUIRED') {
        await get().logout();
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setError: (error: string) => {
    set({ error });
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectAuthError = (state: AuthStore) => state.error;
export const selectIsInitialized = (state: AuthStore) => state.isInitialized;
