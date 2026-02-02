/**
 * @file client.ts
 * @description API client with authentication handling
 */

import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, REQUEST_TIMEOUT } from './config';
import type { ApiResponse, ApiError } from './types';

// Token storage key
const AUTH_TOKENS_KEY = 'knowit_auth_tokens';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  requiresAuth?: boolean;
}

/**
 * Get stored auth token
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const tokensJson = await SecureStore.getItemAsync(AUTH_TOKENS_KEY);
    if (tokensJson) {
      const tokens = JSON.parse(tokensJson);
      return tokens.accessToken || null;
    }
    return null;
  } catch (error) {
    console.error('[API] Error getting auth token:', error);
    return null;
  }
}

/**
 * Create abort controller with timeout
 */
function createAbortController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Make an API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = REQUEST_TIMEOUT,
    requiresAuth = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const controller = createAbortController(timeout);

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    console.log(`[API] ${method} ${endpoint}`);

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || 'Request failed',
        details: data.details,
      };
      console.error(`[API] Error ${response.status}:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[API] Request failed:', error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'TIMEOUT', message: 'Request timed out' },
        };
      }
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: error.message },
      };
    }

    return {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' },
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
