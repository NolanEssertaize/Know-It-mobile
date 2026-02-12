/**
 * @file AuthService.ts
 * @description Authentication Service
 * 
 * Handles user authentication flows.
 * Uses expo-secure-store for encrypted token storage.
 * Assumes API connection is already established.
 */

import {
  api,
  API_ENDPOINTS,
  ApiException,
} from '@/shared/api';
import { SecureTokenManager } from '@/shared/api/SecureStorage';
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
   */
  async register(data: UserCreate): Promise<AuthResponse> {
    console.log('[AuthService] Registering:', data.email);

    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data,
      false,
    );

    // Store tokens securely
    await SecureTokenManager.setTokens(response.tokens);
    await SecureTokenManager.setUser(response.user);

    console.log('[AuthService] Registration successful');
    return response;
  },

  /**
   * Login with email and password
   */
  async login(data: UserLogin): Promise<AuthResponse> {
    console.log('[AuthService] Logging in:', data.email);

    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
      false,
    );

    // Store tokens securely
    await SecureTokenManager.setTokens(response.tokens);
    await SecureTokenManager.setUser(response.user);

    console.log('[AuthService] Login successful');
    return response;
  },

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<Token> {
    console.log('[AuthService] Refreshing tokens');

    const response = await api.post<Token>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken },
      false,
    );

    await SecureTokenManager.setTokens(response);

    console.log('[AuthService] Token refresh successful');
    return response;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserRead> {
    console.log('[AuthService] Fetching current user');

    const user = await api.get<UserRead>(API_ENDPOINTS.AUTH.ME);

    await SecureTokenManager.setUser(user);

    return user;
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: UserUpdate): Promise<UserRead> {
    console.log('[AuthService] Updating profile');

    const user = await api.patch<UserRead>(API_ENDPOINTS.AUTH.ME, data);

    await SecureTokenManager.setUser(user);

    console.log('[AuthService] Profile updated');
    return user;
  },

  /**
   * Change user password
   */
  async changePassword(data: PasswordChange): Promise<MessageResponse> {
    console.log('[AuthService] Changing password');

    const response = await api.post<MessageResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data,
    );

    console.log('[AuthService] Password changed');
    return response;
  },

  /**
   * Login with Google ID token
   */
  async googleLogin(idToken: string): Promise<AuthResponse> {
    console.log('[AuthService] Google login');

    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE_TOKEN,
      { id_token: idToken },
      false,
    );

    await SecureTokenManager.setTokens(response.tokens);
    await SecureTokenManager.setUser(response.user);

    console.log('[AuthService] Google login successful');
    return response;
  },

  /**
   * Request a password reset code
   */
  async forgotPassword(email: string): Promise<MessageResponse> {
    console.log('[AuthService] Requesting password reset for:', email);

    return await api.post<MessageResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email },
      false,
    );
  },

  /**
   * Verify reset code and get reset token
   */
  async verifyResetCode(email: string, code: string): Promise<{ reset_token: string; expires_in: number }> {
    console.log('[AuthService] Verifying reset code');

    return await api.post<{ reset_token: string; expires_in: number }>(
      API_ENDPOINTS.AUTH.VERIFY_RESET_CODE,
      { email, code },
      false,
    );
  },

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<MessageResponse> {
    console.log('[AuthService] Resetting password');

    return await api.post<MessageResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { reset_token: resetToken, new_password: newPassword },
      false,
    );
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    console.log('[AuthService] Logging out');

    try {
      await api.post<MessageResponse>(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.log('[AuthService] Logout API failed, clearing local');
    }

    await SecureTokenManager.clearTokens();

    console.log('[AuthService] Logout complete');
  },

  /**
   * Check if user has stored tokens
   */
  async hasStoredAuth(): Promise<boolean> {
    return await SecureTokenManager.hasTokens();
  },

  /**
   * Initialize auth state from stored tokens
   * Validates tokens with backend
   */
  async initializeAuth(): Promise<UserRead | null> {
    console.log('[AuthService] Initializing auth');

    const hasTokens = await SecureTokenManager.hasTokens();
    
    if (!hasTokens) {
      console.log('[AuthService] No stored tokens');
      return null;
    }

    try {
      // Validate tokens by fetching user
      const user = await this.getCurrentUser();
      console.log('[AuthService] Auth valid for:', user.email);
      return user;
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.code === 'AUTH_REQUIRED' || error.status === 401) {
          console.log('[AuthService] Tokens invalid, clearing');
          await SecureTokenManager.clearTokens();
        }
      }
      return null;
    }
  },
} as const;
