/**
 * @file subscription.ts
 * @description TypeScript types for subscription API
 */

export type PlanType = 'free' | 'student' | 'unlimited';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'grace_period';

export type StorePlatform = 'apple' | 'google';

export interface SubscriptionInfo {
  plan_type: PlanType;
  status: SubscriptionStatus;
  is_active: boolean;
  expires_at: string | null;
  id?: string;
  store_platform?: StorePlatform | null;
  store_product_id?: string | null;
  created_at?: string;
}

export interface UsageInfo {
  sessions_used: number;
  sessions_limit: number;
  sessions_remaining: number;
  generations_used: number;
  generations_limit: number;
  generations_remaining: number;
  plan_type: PlanType;
  usage_date: string;
}

export interface VerifyReceiptRequest {
  platform: StorePlatform;
  receipt_data: string;
  product_id: string;
}

export interface VerifyReceiptResponse {
  success: boolean;
  subscription: SubscriptionInfo;
  message: string;
  error?: string;
  code?: string;
}
