/**
 * @file config.ts
 * @description API Configuration - Base URL and endpoints
 */

// API Base URL - Uses env variable if set, otherwise switches by environment
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? 'http://192.168.1.81:8000' : 'https://essertaize.com');

// API Version prefix
export const API_VERSION = '/api/v1';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  API_HEALTH: `${API_VERSION}/health`,

  // Authentication
  AUTH: {
    REGISTER: `${API_VERSION}/auth/register`,
    LOGIN: `${API_VERSION}/auth/login`,
    REFRESH: `${API_VERSION}/auth/refresh`,
    ME: `${API_VERSION}/auth/me`,
    CHANGE_PASSWORD: `${API_VERSION}/auth/change-password`,
    LOGOUT: `${API_VERSION}/auth/logout`,
  },

  // Transcription
  TRANSCRIPTION: `${API_VERSION}/transcription`,

  // Analysis
  ANALYSIS: {
    ANALYZE: `${API_VERSION}/analysis`,
    SESSION: (sessionId: string) => `${API_VERSION}/analysis/sessions/${sessionId}`,
  },

  // Topics
  TOPICS: {
    LIST: `${API_VERSION}/topics`,
    CREATE: `${API_VERSION}/topics`,
    GET: (topicId: string) => `${API_VERSION}/topics/${topicId}`,
    UPDATE: (topicId: string) => `${API_VERSION}/topics/${topicId}`,
    DELETE: (topicId: string) => `${API_VERSION}/topics/${topicId}`,
  },

  // Flashcards
  FLASHCARDS: {
    GENERATE: `${API_VERSION}/flashcards/generate`,
    BULK_CREATE: `${API_VERSION}/flashcards/bulk`,
    DUE: `${API_VERSION}/flashcards/due`,
    TIMELINE: `${API_VERSION}/flashcards/timeline`,
    REVIEW: (flashcardId: string) => `${API_VERSION}/flashcards/${flashcardId}/review`,
  },

  // Decks
  DECKS: {
    LIST: `${API_VERSION}/decks`,
    CREATE: `${API_VERSION}/decks`,
    GET: (deckId: string) => `${API_VERSION}/decks/${deckId}`,
  },
} as const;

/**
 * Request timeout in milliseconds
 */
export const API_TIMEOUT = 30000;

/**
 * File upload timeout (longer for audio files)
 */
export const UPLOAD_TIMEOUT = 60000;
