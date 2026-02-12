/**
 * @file index.ts
 * @description Store Module - Centralized Zustand stores
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading as selectAuthIsLoading,
  selectAuthError,
  selectIsInitialized,
} from './useAuthStore';

// Topics Store
export {
  useStore,
  selectTopics,
  selectCurrentTopic,
  selectIsLoading,
  selectError,
  selectTopicById,
} from './useStore';

// Subscription Store
export {
  useSubscriptionStore,
  selectPlanType,
  selectUsage,
  selectIsPaywallVisible,
  selectSubscriptionStatus,
  selectIsActive,
} from './useSubscriptionStore';

// Notification Store
export {
  useNotificationStore,
  selectEveningEnabled,
  selectFlashcardEnabled,
  selectEveningTime,
  selectFlashcardTime,
} from './useNotificationStore';

// Types
export type { Topic, Session } from './useStore';
