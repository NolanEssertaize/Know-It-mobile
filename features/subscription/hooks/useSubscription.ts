/**
 * @file useSubscription.ts
 * @description Business logic hook for subscription display
 */

import { useMemo, useCallback } from 'react';
import { useSubscriptionStore } from '@/store';
import type { PlanType } from '@/shared/api';

const USAGE_COLORS = {
  green: '#34C759',
  yellow: '#FFD60A',
  red: '#FF3B30',
} as const;

function getUsageColor(used: number, limit: number): string {
  if (limit === 0) return USAGE_COLORS.red;
  const remaining = (limit - used) / limit;
  if (remaining > 0.5) return USAGE_COLORS.green;
  if (remaining > 0.2) return USAGE_COLORS.yellow;
  return USAGE_COLORS.red;
}

function getUsageProgress(used: number, limit: number): number {
  if (limit === 0) return 1;
  return Math.min(used / limit, 1);
}

export function useSubscription() {
  const planType = useSubscriptionStore((s) => s.planType);
  const status = useSubscriptionStore((s) => s.status);
  const isActive = useSubscriptionStore((s) => s.isActive);
  const expiresAt = useSubscriptionStore((s) => s.expiresAt);
  const sessionsUsed = useSubscriptionStore((s) => s.sessionsUsed);
  const sessionsLimit = useSubscriptionStore((s) => s.sessionsLimit);
  const sessionsRemaining = useSubscriptionStore((s) => s.sessionsRemaining);
  const generationsUsed = useSubscriptionStore((s) => s.generationsUsed);
  const generationsLimit = useSubscriptionStore((s) => s.generationsLimit);
  const generationsRemaining = useSubscriptionStore((s) => s.generationsRemaining);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const refreshAll = useSubscriptionStore((s) => s.refreshAll);
  const fetchUsage = useSubscriptionStore((s) => s.fetchUsage);

  const sessionsColor = useMemo(
    () => getUsageColor(sessionsUsed, sessionsLimit),
    [sessionsUsed, sessionsLimit],
  );

  const generationsColor = useMemo(
    () => getUsageColor(generationsUsed, generationsLimit),
    [generationsUsed, generationsLimit],
  );

  const sessionsProgress = useMemo(
    () => getUsageProgress(sessionsUsed, sessionsLimit),
    [sessionsUsed, sessionsLimit],
  );

  const generationsProgress = useMemo(
    () => getUsageProgress(generationsUsed, generationsLimit),
    [generationsUsed, generationsLimit],
  );

  const isExpired = status === 'expired';
  const isPaid = planType !== 'free';
  const canUpgrade = planType !== 'unlimited';

  const handleUpgrade = useCallback(() => {
    showPaywall();
  }, [showPaywall]);

  return {
    planType,
    status,
    isActive,
    expiresAt,
    isExpired,
    isPaid,
    canUpgrade,
    isLoading,

    sessionsUsed,
    sessionsLimit,
    sessionsRemaining,
    sessionsColor,
    sessionsProgress,

    generationsUsed,
    generationsLimit,
    generationsRemaining,
    generationsColor,
    generationsProgress,

    handleUpgrade,
    refreshAll,
    fetchUsage,
  };
}
