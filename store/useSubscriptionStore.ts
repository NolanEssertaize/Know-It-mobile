/**
 * @file useSubscriptionStore.ts
 * @description Subscription Store - Global subscription & usage state management
 *
 * Manages plan info, daily usage quotas, and paywall visibility.
 * Requires auth to be initialized before use.
 */

import { create } from 'zustand';
import { SubscriptionService } from '@/shared/services';
import { ApiException } from '@/shared/api';
import type {
  PlanType,
  SubscriptionStatus,
  StorePlatform,
} from '@/shared/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SubscriptionState {
  // Subscription info
  planType: PlanType;
  status: SubscriptionStatus;
  isActive: boolean;
  expiresAt: string | null;

  // Usage info
  sessionsUsed: number;
  sessionsLimit: number;
  sessionsRemaining: number;
  generationsUsed: number;
  generationsLimit: number;
  generationsRemaining: number;

  // UI state
  isLoading: boolean;
  error: string | null;
  isPaywallVisible: boolean;
}

interface SubscriptionActions {
  fetchUsage: () => Promise<void>;
  refreshAll: () => Promise<void>;
  verifyPurchase: (platform: StorePlatform, receiptData: string, productId: string) => Promise<boolean>;
  showPaywall: () => void;
  hidePaywall: () => void;
  checkQuota: (type: 'session' | 'generation') => boolean;
  reset: () => void;
}

type SubscriptionStore = SubscriptionState & SubscriptionActions;

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_STATE: SubscriptionState = {
  planType: 'free',
  status: 'active',
  isActive: true,
  expiresAt: null,
  sessionsUsed: 0,
  sessionsLimit: 1,
  sessionsRemaining: 1,
  generationsUsed: 0,
  generationsLimit: 1,
  generationsRemaining: 1,
  isLoading: false,
  error: null,
  isPaywallVisible: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  ...INITIAL_STATE,

  /**
   * Fetch usage info from API (includes plan_type)
   */
  fetchUsage: async () => {
    console.log('[SubscriptionStore] Fetching usage...');

    try {
      const usage = await SubscriptionService.getUsage();
      set({
        planType: usage.plan_type,
        sessionsUsed: usage.sessions_used,
        sessionsLimit: usage.sessions_limit,
        sessionsRemaining: usage.sessions_remaining,
        generationsUsed: usage.generations_used,
        generationsLimit: usage.generations_limit,
        generationsRemaining: usage.generations_remaining,
      });
      console.log('[SubscriptionStore] Usage fetched');
    } catch (error) {
      console.error('[SubscriptionStore] Fetch usage failed:', error);
    }
  },

  /**
   * Refresh subscription and usage data
   */
  refreshAll: async () => {
    console.log('[SubscriptionStore] Refreshing all...');
    set({ isLoading: true, error: null });

    try {
      const usage = await SubscriptionService.getUsage();

      set({
        planType: usage.plan_type,
        sessionsUsed: usage.sessions_used,
        sessionsLimit: usage.sessions_limit,
        sessionsRemaining: usage.sessions_remaining,
        generationsUsed: usage.generations_used,
        generationsLimit: usage.generations_limit,
        generationsRemaining: usage.generations_remaining,
        isLoading: false,
      });

      console.log('[SubscriptionStore] All refreshed');
    } catch (error) {
      console.error('[SubscriptionStore] Refresh failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh subscription',
      });
    }
  },

  /**
   * Verify a purchase receipt with the backend, then refresh
   */
  verifyPurchase: async (platform, receiptData, productId) => {
    console.log('[SubscriptionStore] Verifying purchase...');
    set({ isLoading: true, error: null });

    try {
      const result = await SubscriptionService.verifyReceipt({
        platform,
        receipt_data: receiptData,
        product_id: productId,
      });

      if (result.success) {
        set({
          planType: result.subscription.plan_type,
          status: result.subscription.status,
          isActive: result.subscription.is_active,
          expiresAt: result.subscription.expires_at,
          isLoading: false,
        });
        get().fetchUsage();
        console.log('[SubscriptionStore] Purchase verified');
        return true;
      } else {
        set({
          isLoading: false,
          error: result.message || 'Verification failed',
        });
        return false;
      }
    } catch (error) {
      console.error('[SubscriptionStore] Verify failed:', error);
      const isRateLimit = error instanceof ApiException && error.status === 429;
      set({
        isLoading: false,
        error: isRateLimit
          ? 'Too many requests. Please wait a moment and try again.'
          : error instanceof ApiException ? error.message : 'Verification failed',
      });
      return false;
    }
  },

  showPaywall: () => {
    set({ isPaywallVisible: true });
  },

  hidePaywall: () => {
    set({ isPaywallVisible: false });
  },

  /**
   * Check if user has remaining quota
   */
  checkQuota: (type) => {
    const state = get();
    if (type === 'session') {
      return state.sessionsRemaining > 0;
    }
    return state.generationsRemaining > 0;
  },

  /**
   * Reset store to initial state (on logout)
   */
  reset: () => {
    set(INITIAL_STATE);
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export const selectPlanType = (state: SubscriptionStore) => state.planType;
export const selectUsage = (state: SubscriptionStore) => ({
  sessionsUsed: state.sessionsUsed,
  sessionsLimit: state.sessionsLimit,
  sessionsRemaining: state.sessionsRemaining,
  generationsUsed: state.generationsUsed,
  generationsLimit: state.generationsLimit,
  generationsRemaining: state.generationsRemaining,
});
export const selectIsPaywallVisible = (state: SubscriptionStore) => state.isPaywallVisible;
export const selectSubscriptionStatus = (state: SubscriptionStore) => state.status;
export const selectIsActive = (state: SubscriptionStore) => state.isActive;
