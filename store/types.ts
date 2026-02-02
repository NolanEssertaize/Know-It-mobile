/**
 * @file store/types.ts
 * @description Store state types
 */

import type { Topic, Session, User, AuthTokens, UserPreferences } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface StoreState {
  // Data
  topics: Topic[];
  currentTopic: Topic | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Topics
  loadTopics: () => Promise<void>;
  addTopic: (title: string, category?: string) => Promise<Topic>;
  updateTopicTitle: (topicId: string, title: string) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  loadTopicDetail: (topicId: string) => Promise<Topic | null>;
  setCurrentTopic: (topic: Topic | null) => void;

  // Actions - Sessions
  addSession: (topicId: string, session: Session) => Promise<void>;
  deleteSession: (topicId: string, sessionId: string) => Promise<void>;

  // Actions - Utility
  clearError: () => void;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthState {
  // User data
  user: User | null;
  tokens: AuthTokens | null;

  // State flags
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export type Selector<T> = (state: StoreState) => T;
export type AuthSelector<T> = (state: AuthState) => T;
