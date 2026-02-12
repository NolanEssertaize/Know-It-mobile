/**
 * @file index.ts
 * @description Services Module - Centralized exports
 * 
 * Services handle all I/O operations (API calls, storage, etc.)
 * Following the MVVM pattern: View → Hook → Service → API
 */

// Authentication Service
export { AuthService } from './AuthService';

// Topics Service (CRUD)
export { TopicsService } from './TopicsService';

// LLM Service (Transcription + Analysis)
export { LLMService } from './LLMService';
export type { AnalysisResult, TranscriptionResponse, SessionRead } from './LLMService';

// Flashcards Service
export { FlashcardsService } from './FlashcardsService';

// Subscription Service
export { SubscriptionService } from './SubscriptionService';

// IAP Service
export { IAPService } from './IAPService';
export type { Purchase, PurchaseError, ProductSubscription, EventSubscription } from './IAPService';

// Notification Service
export { NotificationService } from './NotificationService';

// Storage Service (keep existing if present)
// export { StorageService } from './StorageService';
