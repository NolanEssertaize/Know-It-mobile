/**
 * @file subscription.ts
 * @description TypeScript types for subscription API
 */

export type PlanType = 'free' | 'student' | 'unlimited';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'grace_period';

export interface SubscriptionInfo {
  plan_type: PlanType;
  status: SubscriptionStatus;
  is_active: boolean;
  expires_at: string | null;
}

export interface UsageInfo {
  sessions_used: number;
  sessions_limit: number;
  sessions_remaining: number;
  generations_used: number;
  generations_limit: number;
  generations_remaining: number;
  plan_type: PlanType;
}

export interface VerifyReceiptRequest {
  platform: 'ios' | 'android';
  receipt_data: string;
  product_id: string;
}

export interface VerifyReceiptResponse {
  success: boolean;
  subscription: SubscriptionInfo;
  message: string;
}
