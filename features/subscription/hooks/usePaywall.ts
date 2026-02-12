/**
 * @file usePaywall.ts
 * @description Paywall-specific logic — products, purchase flow, restore
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '@/store';
import { IAPService, type ProductSubscription } from '@/shared/services';
import type { StorePlatform } from '@/shared/api';

const storePlatform = (os: string): StorePlatform =>
  os === 'ios' ? 'apple' : 'google';

export function usePaywall() {
  const { t } = useTranslation();
  const isVisible = useSubscriptionStore((s) => s.isPaywallVisible);
  const hidePaywall = useSubscriptionStore((s) => s.hidePaywall);
  const verifyPurchase = useSubscriptionStore((s) => s.verifyPurchase);
  const planType = useSubscriptionStore((s) => s.planType);

  const [products, setProducts] = useState<ProductSubscription[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch products when paywall becomes visible
  useEffect(() => {
    if (isVisible) {
      IAPService.getProducts()
        .then(setProducts)
        .catch(() => {
          console.warn('[usePaywall] Failed to fetch products (Expo Go?)');
        });
    }
  }, [isVisible]);

  // Set up purchase listeners when paywall is visible
  useEffect(() => {
    if (!isVisible) return;

    try {
      IAPService.setupListeners(
        async (purchase) => {
          console.log('[usePaywall] Purchase received:', purchase.productId);
          const receiptData = purchase.purchaseToken ?? '';

          if (!receiptData) {
            setIsPurchasing(false);
            Alert.alert(t('common.error'), t('subscription.purchase.failed'));
            return;
          }

          const success = await verifyPurchase(
            storePlatform(Platform.OS),
            receiptData,
            purchase.productId,
          );

          if (success) {
            await IAPService.finishPurchase(purchase);
            setIsPurchasing(false);
            hidePaywall();
            Alert.alert(t('common.success'), t('subscription.purchase.success'));
          } else {
            setIsPurchasing(false);
            Alert.alert(t('common.error'), t('subscription.purchase.verifyFailed'));
          }
        },
        (error) => {
          console.error('[usePaywall] Purchase error:', error);
          setIsPurchasing(false);
          // Don't show alert for user cancellation
          if (error.code !== 'user-cancelled') {
            Alert.alert(t('common.error'), t('subscription.purchase.failed'));
          }
        },
      );
    } catch {
      console.warn('[usePaywall] IAP listeners not available (Expo Go?)');
    }

    return () => {
      try { IAPService.removeListeners(); } catch {}
    };
  }, [isVisible, verifyPurchase, hidePaywall, t]);

  const handlePurchase = useCallback(async (productId: string) => {
    setIsPurchasing(true);
    try {
      await IAPService.purchaseProduct(productId);
    } catch (error) {
      console.warn('[usePaywall] Purchase failed:', error);
      setIsPurchasing(false);
      Alert.alert(t('common.error'), t('subscription.purchase.failed'));
    }
  }, [t]);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const purchases = await IAPService.restorePurchases();

      if (purchases.length === 0) {
        Alert.alert(t('common.ok'), t('subscription.purchase.nothingToRestore'));
        setIsRestoring(false);
        return;
      }

      // Verify the most recent purchase
      const latest = purchases[purchases.length - 1];
      const receiptData = latest.purchaseToken ?? '';

      if (receiptData) {
        const success = await verifyPurchase(
          storePlatform(Platform.OS),
          receiptData,
          latest.productId,
        );

        if (success) {
          await IAPService.finishPurchase(latest);
          hidePaywall();
          Alert.alert(t('common.success'), t('subscription.purchase.restored'));
        } else {
          Alert.alert(t('common.error'), t('subscription.purchase.verifyFailed'));
        }
      }
    } catch {
      Alert.alert(t('common.error'), t('subscription.purchase.failed'));
    } finally {
      setIsRestoring(false);
    }
  }, [verifyPurchase, hidePaywall, t]);

  const getProductPrice = useCallback(
    (productId: string): string => {
      const product = products.find((p) => p.id === productId);
      return product?.displayPrice ?? '—';
    },
    [products],
  );

  return {
    isVisible,
    hidePaywall,
    products,
    isPurchasing,
    isRestoring,
    planType,
    handlePurchase,
    handleRestore,
    getProductPrice,
  };
}
