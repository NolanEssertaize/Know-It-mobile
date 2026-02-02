/**
 * @file config.ts
 * @description API configuration
 */

// API Base URL - Change this based on environment
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.knowit.app/api/v1';

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',

  // Topics
  TOPICS: '/topics',
  TOPIC_BY_ID: (id: string) => `/topics/${id}`,

  // Sessions
  SESSIONS: (topicId: string) => `/topics/${topicId}/sessions`,
  SESSION_BY_ID: (topicId: string, sessionId: string) =>
    `/topics/${topicId}/sessions/${sessionId}`,

  // Audio/Analysis
  TRANSCRIBE: '/audio/transcribe',
  ANALYZE: '/analysis/analyze',
} as const;

// Request timeout in ms
export const REQUEST_TIMEOUT = 30000;

// Health check endpoint
export const HEALTH_CHECK_URL = `${API_BASE_URL.replace('/api/v1', '')}/health`;
