/**
 * @file useAuthStore.ts
 * @description Authentication Store - Global auth state management with Zustand
 *
 * Manages:
 * - Current user state
 * - Authentication status
 * - Login/Logout/Register actions
 * - Token refresh
 */

import { create } from 'zustand';
import { AuthService } from '@/shared/services';
import { ApiException } from '@/shared/api';
import type { UserRead, UserCreate, UserLogin, UserUpdate } from '@/shared/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AuthState {
    /** Current authenticated user */
    user: UserRead | null;
    /** Whether auth is being checked */
    isLoading: boolean;
    /** Whether user is authenticated */
    isAuthenticated: boolean;
    /** Current error message */
    error: string | null;
    /** Whether initial auth check is complete */
    isInitialized: boolean;
}

interface AuthActions {
    /** Initialize auth state from storage */
    initialize: () => Promise<void>;
    /** Register new user */
    register: (data: UserCreate) => Promise<void>;
    /** Login with email/password */
    login: (data: UserLogin) => Promise<void>;
    /** Logout current user */
    logout: () => Promise<void>;
    /** Update user profile */
    updateProfile: (data: UserUpdate) => Promise<void>;
    /** Refresh user data from server */
    refreshUser: () => Promise<void>;
    /** Clear error state */
    clearError: () => void;
    /** Set error message */
    setError: (error: string) => void;
}

type AuthStore = AuthState & AuthActions;

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthStore>((set, get) => ({
    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    isInitialized: false,

    // ─────────────────────────────────────────────────────────────────────────
    // ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initialize auth state from stored tokens
     * Should be called on app startup
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
                error: 'Failed to restore session',
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
     * Logout current user
     */
    logout: async () => {
        console.log('[AuthStore] Logging out...');
        set({ isLoading: true });

        try {
            await AuthService.logout();
        } catch (error) {
            // Ignore logout errors, still clear local state
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

            // If refresh fails due to auth, log out
            if (error instanceof ApiException && error.code === 'AUTH_REQUIRED') {
                await get().logout();
            }
        }
    },

    /**
     * Clear error state
     */
    clearError: () => {
        set({ error: null });
    },

    /**
     * Set error message
     */
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