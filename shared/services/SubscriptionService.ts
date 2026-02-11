/**
 * @file SubscriptionService.ts
 * @description Subscription Service - API calls for subscription management
 */

import { api, API_ENDPOINTS } from '@/shared/api';
import type {
  UsageInfo,
  VerifyReceiptRequest,
  VerifyReceiptResponse,
} from '@/shared/api';

export const SubscriptionService = {
  /**
   * Get current usage info
   */
  async getUsage(): Promise<UsageInfo> {
    console.log('[SubscriptionService] Fetching usage info');
    return api.get<UsageInfo>(API_ENDPOINTS.SUBSCRIPTIONS.USAGE);
  },

  /**
   * Verify a purchase receipt with the backend
   */
  async verifyReceipt(data: VerifyReceiptRequest): Promise<VerifyReceiptResponse> {
    console.log('[SubscriptionService] Verifying receipt for:', data.product_id);
    return api.post<VerifyReceiptResponse>(API_ENDPOINTS.SUBSCRIPTIONS.VERIFY, data);
  },
} as const;
