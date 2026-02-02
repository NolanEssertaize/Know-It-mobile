/**
 * @file store/index.ts
 * @description Store exports
 */

// Main store
export {
  useStore,
  selectTopics,
  selectCurrentTopic,
  selectIsLoading,
  selectError,
  selectTopicById,
  selectTotalSessions,
} from './useStore';

// Auth store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsAuthLoading,
  selectAuthError,
} from './useAuthStore';

// Types
export type { StoreState, AuthState, Selector, AuthSelector } from './types';

// Re-export domain types for convenience
export type { Topic, Session, Analysis, User } from '@/types';
