/**
 * @file types/index.ts
 * @description Global TypeScript type definitions for KnowIt app
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE DOMAIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analysis result from AI evaluation
 */
export interface Analysis {
  /** Points the user explained correctly */
  valid: string[];
  /** Points that need correction */
  corrections: string[];
  /** Important points that were missing */
  missing: string[];
  /** Overall score (0-100) */
  score?: number;
}

/**
 * A single practice session
 */
export interface Session {
  /** Unique session identifier */
  id: string;
  /** ISO date string of when session was recorded */
  date: string;
  /** Local URI of the audio recording */
  audioUri?: string;
  /** Transcription of the audio */
  transcription?: string;
  /** AI analysis of the session */
  analysis: Analysis;
  /** Duration in seconds */
  duration?: number;
}

/**
 * A topic/subject to practice
 */
export interface Topic {
  /** Unique topic identifier */
  id: string;
  /** Topic title/name */
  title: string;
  /** Category of the topic */
  category?: string;
  /** All sessions for this topic */
  sessions: Session[];
  /** When the topic was created */
  createdAt?: string;
  /** When the topic was last updated */
  updatedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER & AUTH TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User profile information
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** Display name */
  name?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** When the account was created */
  createdAt: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token */
  refreshToken: string;
  /** Token expiration timestamp */
  expiresAt: number;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Recording session status
 */
export type SessionStatus = 'idle' | 'recording' | 'paused' | 'analyzing' | 'completed' | 'error';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * User preferences
 */
export interface UserPreferences {
  theme: ThemeMode;
  language: 'en' | 'fr';
  notificationsEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROP TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common screen props
 */
export interface ScreenProps {
  /** Whether the screen is loading */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Topic card data for list rendering
 */
export interface TopicItemData {
  topic: Topic;
  sessionCount: number;
  lastSessionDate: string | null;
  formattedLastSession: string;
}

/**
 * Session card data for list rendering
 */
export interface SessionItemData {
  session: Session;
  formattedDate: string;
}
