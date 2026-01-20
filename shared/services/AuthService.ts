/**
 * @file AuthService.ts
 * @description Authentication Service - Handles user authentication flows
 *
 * Responsibilities:
 * - User registration
 * - User login/logout
 * - Token management
 * - User profile operations
 * - Password management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    api,
    API_ENDPOINTS,
    TokenManager,
    STORAGE_KEYS,
    ApiException,
} from '@/shared/api';
import type {
    UserCreate,
    UserLogin,
    UserRead,
    UserUpdate,
    Token,
    AuthResponse,
    PasswordChange,
    MessageResponse,
} from '@/shared/api';

export const AuthService = {
    /**
     * Register a new user
     * @param data - User registration data
     * @returns AuthResponse with user and tokens
     */
    async register(data: UserCreate): Promise<AuthResponse> {
        console.log('[AuthService] Registering new user:', data.email);

        const response = await api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data,
            false, // No auth required for registration
        );

        // Store tokens and user data
        await TokenManager.setTokens(response.tokens);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

        console.log('[AuthService] Registration successful');
        return response;
    },

    /**
     * Login with email and password
     * @param data - Login credentials
     * @returns AuthResponse with user and tokens
     */
    async login(data: UserLogin): Promise<AuthResponse> {
        console.log('[AuthService] Logging in user:', data.email);

        const response = await api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            data,
            false, // No auth required for login
        );

        // Store tokens and user data
        await TokenManager.setTokens(response.tokens);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

        console.log('[AuthService] Login successful');
        return response;
    },

    /**
     * Refresh access token
     * @param refreshToken - Current refresh token
     * @returns New tokens
     */
    async refreshTokens(refreshToken: string): Promise<Token> {
        console.log('[AuthService] Refreshing tokens');

        const response = await api.post<Token>(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh_token: refreshToken },
            false, // Use refresh token, not access token
        );

        // Store new tokens
        await TokenManager.setTokens(response);

        console.log('[AuthService] Token refresh successful');
        return response;
    },

    /**
     * Get current user profile
     * @returns User profile data
     */
    async getCurrentUser(): Promise<UserRead> {
        console.log('[AuthService] Fetching current user');

        const user = await api.get<UserRead>(API_ENDPOINTS.AUTH.ME);

        // Update cached user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        return user;
    },

    /**
     * Update current user profile
     * @param data - Update data
     * @returns Updated user profile
     */
    async updateProfile(data: UserUpdate): Promise<UserRead> {
        console.log('[AuthService] Updating user profile');

        const user = await api.patch<UserRead>(API_ENDPOINTS.AUTH.ME, data);

        // Update cached user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        console.log('[AuthService] Profile updated successfully');
        return user;
    },

    /**
     * Change user password
     * @param data - Current and new password
     * @returns Success message
     */
    async changePassword(data: PasswordChange): Promise<MessageResponse> {
        console.log('[AuthService] Changing password');

        const response = await api.post<MessageResponse>(
            API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
            data,
        );

        console.log('[AuthService] Password changed successfully');
        return response;
    },

    /**
     * Logout current user
     * Clears all stored tokens and user data
     */
    async logout(): Promise<void> {
        console.log('[AuthService] Logging out user');

        try {
            // Notify server (optional, tokens are stateless)
            await api.post<MessageResponse>(API_ENDPOINTS.AUTH.LOGOUT, {});
        } catch (error) {
            // Ignore errors during logout API call
            console.log('[AuthService] Logout API call failed, continuing with local logout');
        }

        // Clear local storage
        await TokenManager.clearTokens();

        console.log('[AuthService] Logout complete');
    },

    /**
     * Check if user is currently authenticated
     * @returns true if access token exists
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await TokenManager.getAccessToken();
        return token !== null;
    },

    /**
     * Get cached user from storage
     * @returns Cached user or null
     */
    async getCachedUser(): Promise<UserRead | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            if (userData) {
                return JSON.parse(userData) as UserRead;
            }
            return null;
        } catch {
            return null;
        }
    },

    /**
     * Initialize auth state from storage
     * Checks if user has valid session
     * @returns User if authenticated, null otherwise
     */
    async initializeAuth(): Promise<UserRead | null> {
        console.log('[AuthService] Initializing auth state');

        const isAuth = await this.isAuthenticated();

        if (!isAuth) {
            console.log('[AuthService] No stored auth found');
            return null;
        }

        try {
            // Try to get fresh user data
            const user = await this.getCurrentUser();
            console.log('[AuthService] Auth initialized for user:', user.email);
            return user;
        } catch (error) {
            if (error instanceof ApiException && error.code === 'AUTH_REQUIRED') {
                console.log('[AuthService] Stored tokens invalid, clearing auth');
                await TokenManager.clearTokens();
            }
            return null;
        }
    },
} as const;