/**
 * @file useQuotaGuard.ts
 * @description Hook for proactive quota checking before sessions/generations.
 * Returns a checkAndProceed function and modal state.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

export function useQuotaGuard() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [quotaType, setQuotaType] = useState<'session' | 'generation'>('session');

  const checkAndProceed = useCallback((type: 'session' | 'generation'): boolean => {
    const hasQuota = useSubscriptionStore.getState().checkQuota(type);
    if (!hasQuota) {
      setQuotaType(type);
      setModalVisible(true);
      return false;
    }
    return true;
  }, []);

  const dismiss = useCallback(() => {
    setModalVisible(false);
  }, []);

  const openPaywall = useCallback(() => {
    setModalVisible(false);
    router.push({ pathname: '/profile', params: { tab: 'subscription', showPaywall: 'true' } });
  }, [router]);

  return {
    quotaModalVisible: modalVisible,
    quotaType,
    checkAndProceed,
    dismissQuotaModal: dismiss,
    openPaywall,
  };
}
