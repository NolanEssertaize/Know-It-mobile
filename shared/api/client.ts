/**
 * @file client.ts
 * @description HTTP Client with authentication and retry policy
 * 
 * Features:
 * - Secure token storage (expo-secure-store)
 * - Automatic token refresh on 401
 * - Retry policy with exponential backoff
 * - Network connectivity handling
 */

import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT, UPLOAD_TIMEOUT } from './config';
import { SecureTokenManager, STORAGE_KEYS } from './SecureStorage';
import type { ApiError, Token } from './types';

// Re-export for convenience
export { SecureTokenManager as TokenManager, STORAGE_KEYS };

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
} as const;

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly isRetryable: boolean = false,
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
  retryCount?: number;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay,
  );
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(status?: number, error?: Error): boolean {
  if (status && RETRY_CONFIG.retryableStatuses.includes(status)) {
    return true;
  }
  if (error?.name === 'AbortError') {
    return true;
  }
  if (error?.message?.includes('Network request failed')) {
    return true;
  }
  return false;
}

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshPromise: Promise<Token | null> | null = null;

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<Token | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await SecureTokenManager.getRefreshToken();
      
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
        await SecureTokenManager.clearTokens();
        return null;
      }

      const tokens: Token = await response.json();
      await SecureTokenManager.setTokens(tokens);
      
      console.log('[ApiClient] Token refreshed successfully');
      return tokens;
    } catch (error) {
      console.error('[ApiClient] Token refresh error:', error);
      await SecureTokenManager.clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Make an authenticated API request with retry logic
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
    retryCount = 0,
  } = config;

  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const accessToken = await SecureTokenManager.getAccessToken();
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`[ApiClient] ${method} ${endpoint} (attempt ${retryCount + 1})`);

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

        if (retryResponse.status === 204) {
          return {} as T;
        }

        return await retryResponse.json();
      } else {
        throw new ApiException(
          'AUTH_REQUIRED',
          'Session expired. Please log in again.',
          401,
        );
      }
    }

    // Handle 429 - distinguish quota exceeded from generic rate limit
    if (response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      const detail = typeof errorData.detail === 'string' ? errorData.detail : '';

      if (detail.toLowerCase().includes('limit')) {
        // Quota exceeded — show paywall, don't retry
        console.log('[ApiClient] Quota exceeded, showing paywall');
        try {
          const { useSubscriptionStore } = require('@/store/useSubscriptionStore');
          useSubscriptionStore.getState().showPaywall();
        } catch (e) {
          // Store may not be available yet
        }
        throw new ApiException(
          'QUOTA_EXCEEDED',
          errorData.error || detail || 'Daily limit reached',
          429,
          false,
        );
      }
      // Generic rate limit — fall through to retry logic below
    }

    // Handle retryable errors
    if (!response.ok && isRetryableError(response.status)) {
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = calculateBackoffDelay(retryCount);
        console.log(`[ApiClient] Retrying in ${delay}ms (attempt ${retryCount + 2}/${RETRY_CONFIG.maxRetries + 1})`);
        await sleep(delay);
        return apiRequest<T>(endpoint, { ...config, retryCount: retryCount + 1 });
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiException(
        errorData.code || 'REQUEST_FAILED',
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        isRetryableError(response.status),
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiException) {
      throw error;
    }

    // Handle network/timeout errors with retry
    if (error instanceof Error) {
      const isNetworkError = error.name === 'AbortError' || 
        error.message?.includes('Network request failed') ||
        error.message?.includes('Failed to fetch');

      if (isNetworkError && retryCount < RETRY_CONFIG.maxRetries) {
        const delay = calculateBackoffDelay(retryCount);
        console.log(`[ApiClient] Network error, retrying in ${delay}ms (attempt ${retryCount + 2}/${RETRY_CONFIG.maxRetries + 1})`);
        await sleep(delay);
        return apiRequest<T>(endpoint, { ...config, retryCount: retryCount + 1 });
      }

      if (error.name === 'AbortError') {
        throw new ApiException('TIMEOUT', 'Request timed out', 408, true);
      }
      throw new ApiException('NETWORK_ERROR', error.message, undefined, true);
    }

    throw new ApiException('UNKNOWN_ERROR', 'An unknown error occurred');
  }
}

/**
 * Upload file with multipart/form-data and retry logic
 */
export async function uploadFile<T>(
  endpoint: string,
  formData: FormData,
  requiresAuth = true,
  retryCount = 0,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {};

  if (requiresAuth) {
    const accessToken = await SecureTokenManager.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    console.log(`[ApiClient] Uploading to ${endpoint} (attempt ${retryCount + 1})`);

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

    // Handle retryable errors
    if (!response.ok && isRetryableError(response.status)) {
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = calculateBackoffDelay(retryCount);
        console.log(`[ApiClient] Upload retry in ${delay}ms`);
        await sleep(delay);
        return uploadFile<T>(endpoint, formData, requiresAuth, retryCount + 1);
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
      const isNetworkError = error.name === 'AbortError' || 
        error.message?.includes('Network request failed');

      if (isNetworkError && retryCount < RETRY_CONFIG.maxRetries) {
        const delay = calculateBackoffDelay(retryCount);
        console.log(`[ApiClient] Upload network error, retrying in ${delay}ms`);
        await sleep(delay);
        return uploadFile<T>(endpoint, formData, requiresAuth, retryCount + 1);
      }

      if (error.name === 'AbortError') {
        throw new ApiException('TIMEOUT', 'Upload timed out', 408, true);
      }
      throw new ApiException('NETWORK_ERROR', error.message, undefined, true);
    }

    throw new ApiException('UNKNOWN_ERROR', 'An unknown error occurred');
  }
}

/**
 * Check API connectivity with retry
 */
export async function checkApiConnection(maxAttempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`[ApiClient] Checking API connection (attempt ${attempt + 1}/${maxAttempts})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('[ApiClient] API connection successful');
        return true;
      }
    } catch (error) {
      console.log(`[ApiClient] Connection attempt ${attempt + 1} failed:`, error);
    }

    if (attempt < maxAttempts - 1) {
      const delay = calculateBackoffDelay(attempt);
      console.log(`[ApiClient] Retrying connection in ${delay}ms`);
      await sleep(delay);
    }
  }

  console.log('[ApiClient] API connection failed after all attempts');
  return false;
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

  checkConnection: (maxAttempts?: number) =>
    checkApiConnection(maxAttempts),
};
