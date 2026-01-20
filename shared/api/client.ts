/**
 * @file client.ts
 * @description HTTP Client with authentication interceptors
 *
 * Handles:
 * - Base URL configuration
 * - Authorization headers with JWT
 * - Automatic token refresh on 401
 * - Request/Response error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT, UPLOAD_TIMEOUT } from './config';
import type { ApiError, Token } from './types';

// Storage keys for tokens
export const STORAGE_KEYS = {
    ACCESS_TOKEN: '@knowit/access_token',
    REFRESH_TOKEN: '@knowit/refresh_token',
    USER: '@knowit/user',
} as const;

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = 'ApiException';
    }

    toApiError(): ApiError {
        return {
            error: this.message,
            code: this.code,
            status: this.status,
        };
    }
}

/**
 * Request configuration
 */
interface RequestConfig {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    requiresAuth?: boolean;
}

/**
 * Token management helpers
 */
export const TokenManager = {
    async getAccessToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        } catch {
            return null;
        }
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        } catch {
            return null;
        }
    },

    async setTokens(tokens: Token): Promise<void> {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token],
                [STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token],
            ]);
        } catch (error) {
            console.error('[TokenManager] Failed to store tokens:', error);
        }
    },

    async clearTokens(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.ACCESS_TOKEN,
                STORAGE_KEYS.REFRESH_TOKEN,
                STORAGE_KEYS.USER,
            ]);
        } catch (error) {
            console.error('[TokenManager] Failed to clear tokens:', error);
        }
    },
};

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshPromise: Promise<Token | null> | null = null;

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<Token | null> {
    // If already refreshing, wait for that request
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const refreshToken = await TokenManager.getRefreshToken();

            if (!refreshToken) {
                console.log('[ApiClient] No refresh token available');
                return null;
            }

            console.log('[ApiClient] Refreshing access token...');

            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                console.log('[ApiClient] Token refresh failed, status:', response.status);
                await TokenManager.clearTokens();
                return null;
            }

            const tokens: Token = await response.json();
            await TokenManager.setTokens(tokens);

            console.log('[ApiClient] Token refreshed successfully');
            return tokens;
        } catch (error) {
            console.error('[ApiClient] Token refresh error:', error);
            await TokenManager.clearTokens();
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
    endpoint: string,
    config: RequestConfig,
): Promise<T> {
    const {
        method,
        headers = {},
        body,
        timeout = API_TIMEOUT,
        requiresAuth = true,
    } = config;

    const url = `${API_BASE_URL}${endpoint}`;

    // Build headers
    const requestHeaders: Record<string, string> = {
        ...headers,
    };

    // Add Content-Type for JSON body
    if (body && !(body instanceof FormData)) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    // Add Authorization header if required
    if (requiresAuth) {
        const accessToken = await TokenManager.getAccessToken();
        if (accessToken) {
            requestHeaders['Authorization'] = `Bearer ${accessToken}`;
        }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        console.log(`[ApiClient] ${method} ${endpoint}`);

        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401 && requiresAuth) {
            console.log('[ApiClient] 401 received, attempting token refresh...');

            const newTokens = await refreshAccessToken();

            if (newTokens) {
                // Retry the request with new token
                requestHeaders['Authorization'] = `Bearer ${newTokens.access_token}`;

                const retryResponse = await fetch(url, {
                    method,
                    headers: requestHeaders,
                    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
                });

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new ApiException(
                        errorData.code || 'REQUEST_FAILED',
                        errorData.error || `Request failed with status ${retryResponse.status}`,
                        retryResponse.status,
                    );
                }

                // Handle 204 No Content
                if (retryResponse.status === 204) {
                    return {} as T;
                }

                return await retryResponse.json();
            } else {
                // Token refresh failed, user needs to re-authenticate
                throw new ApiException(
                    'AUTH_REQUIRED',
                    'Session expired. Please log in again.',
                    401,
                );
            }
        }

        // Handle other error responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiException(
                errorData.code || 'REQUEST_FAILED',
                errorData.error || `Request failed with status ${response.status}`,
                response.status,
            );
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiException) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiException('TIMEOUT', 'Request timed out', 408);
            }
            throw new ApiException('NETWORK_ERROR', error.message);
        }

        throw new ApiException('UNKNOWN_ERROR', 'An unknown error occurred');
    }
}

/**
 * Upload file with multipart/form-data
 */
export async function uploadFile<T>(
    endpoint: string,
    formData: FormData,
    requiresAuth = true,
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {};

    if (requiresAuth) {
        const accessToken = await TokenManager.getAccessToken();
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

    try {
        console.log(`[ApiClient] Uploading to ${endpoint}`);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 with refresh
        if (response.status === 401 && requiresAuth) {
            const newTokens = await refreshAccessToken();

            if (newTokens) {
                headers['Authorization'] = `Bearer ${newTokens.access_token}`;

                const retryResponse = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: formData,
                });

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new ApiException(
                        errorData.code || 'UPLOAD_FAILED',
                        errorData.error || 'Upload failed',
                        retryResponse.status,
                    );
                }

                return await retryResponse.json();
            } else {
                throw new ApiException('AUTH_REQUIRED', 'Session expired. Please log in again.', 401);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiException(
                errorData.code || 'UPLOAD_FAILED',
                errorData.error || `Upload failed with status ${response.status}`,
                response.status,
            );
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiException) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiException('TIMEOUT', 'Upload timed out', 408);
            }
            throw new ApiException('NETWORK_ERROR', error.message);
        }

        throw new ApiException('UNKNOWN_ERROR', 'An unknown error occurred');
    }
}

// Export convenience methods
export const api = {
    get: <T>(endpoint: string, requiresAuth = true) =>
        apiRequest<T>(endpoint, { method: 'GET', requiresAuth }),

    post: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
        apiRequest<T>(endpoint, { method: 'POST', body, requiresAuth }),

    patch: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
        apiRequest<T>(endpoint, { method: 'PATCH', body, requiresAuth }),

    put: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
        apiRequest<T>(endpoint, { method: 'PUT', body, requiresAuth }),

    delete: <T>(endpoint: string, requiresAuth = true) =>
        apiRequest<T>(endpoint, { method: 'DELETE', requiresAuth }),

    upload: <T>(endpoint: string, formData: FormData, requiresAuth = true) =>
        uploadFile<T>(endpoint, formData, requiresAuth),
};