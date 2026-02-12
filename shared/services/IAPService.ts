/**
 * @file IAPService.ts
 * @description In-App Purchase Service - Wraps react-native-iap v14+
 *
 * IMPORTANT: react-native-iap uses Nitro Modules which crash on import in
 * Expo Go. All imports are lazy (via require()) so the module is only loaded
 * when actually called in a native build.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect Expo Go — NitroModules crash on import there
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// ─── Lazy accessor ──────────────────────────────────────────────────────────
// We keep a cached reference so require() only runs once.
let _iap: typeof import('react-native-iap') | null = null;

function getIAP(): typeof import('react-native-iap') | null {
  if (isExpoGo) return null;
  if (!_iap) {
    try {
      _iap = require('react-native-iap');
    } catch {
      console.warn('[IAPService] react-native-iap not available');
      return null;
    }
  }
  return _iap;
}

// ─── Re-export types (using import() syntax to avoid any module resolution) ──
export type Purchase = import('react-native-iap').Purchase;
export type PurchaseError = import('react-native-iap').PurchaseError;
export type ProductSubscription = import('react-native-iap').ProductSubscription;
export type EventSubscription = import('react-native-iap').EventSubscription;

// Product IDs matching store configuration
const PRODUCT_IDS = Platform.select({
  ios: ['com.knowit.student', 'com.knowit.unlimited'],
  android: ['com.knowit.student', 'com.knowit.unlimited'],
  default: [] as string[],
});

type PurchaseListener = (purchase: import('react-native-iap').Purchase) => void;
type ErrorListener = (error: import('react-native-iap').PurchaseError) => void;

let purchaseUpdateSubscription: { remove(): void } | null = null;
let purchaseErrorSubscription: { remove(): void } | null = null;

export const IAPService = {
  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<boolean> {
    try {
      const iap = getIAP();
      if (!iap) return false;
      console.log('[IAPService] Initializing connection...');
      await iap.initConnection();
      console.log('[IAPService] Connection initialized');
      return true;
    } catch (error) {
      console.error('[IAPService] Failed to initialize:', error);
      return false;
    }
  },

  /**
   * Get available subscription products with real prices from the store
   */
  async getProducts(): Promise<import('react-native-iap').ProductSubscription[]> {
    try {
      const iap = getIAP();
      if (!iap) return [];
      console.log('[IAPService] Fetching products:', PRODUCT_IDS);
      const products = await iap.fetchProducts({ skus: PRODUCT_IDS, type: 'subs' });
      if (!products) return [];
      console.log('[IAPService] Products fetched:', products.length);
      return products as unknown as import('react-native-iap').ProductSubscription[];
    } catch (error) {
      console.error('[IAPService] Failed to fetch products:', error);
      return [];
    }
  },

  /**
   * Initiate a subscription purchase
   */
  async purchaseProduct(productId: string): Promise<void> {
    try {
      const iap = getIAP();
      if (!iap) throw new Error('IAP not available');
      console.log('[IAPService] Purchasing:', productId);
      await iap.requestPurchase({
        request: Platform.OS === 'ios'
          ? { apple: { sku: productId } }
          : { google: { skus: [productId] } },
        type: 'subs',
      });
    } catch (error) {
      console.error('[IAPService] Purchase failed:', error);
      throw error;
    }
  },

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<import('react-native-iap').Purchase[]> {
    try {
      const iap = getIAP();
      if (!iap) return [];
      console.log('[IAPService] Restoring purchases...');
      const purchases = await iap.getAvailablePurchases();
      console.log('[IAPService] Restored purchases:', purchases.length);
      return purchases;
    } catch (error) {
      console.error('[IAPService] Restore failed:', error);
      throw error;
    }
  },

  /**
   * Finish a transaction after backend verification
   */
  async finishPurchase(purchase: import('react-native-iap').Purchase): Promise<void> {
    try {
      const iap = getIAP();
      if (!iap) return;
      console.log('[IAPService] Finishing transaction:', purchase.transactionId);
      await iap.finishTransaction({ purchase, isConsumable: false });
    } catch (error) {
      console.error('[IAPService] Failed to finish transaction:', error);
    }
  },

  /**
   * Set up purchase listeners
   */
  setupListeners(onPurchase: PurchaseListener, onError: ErrorListener): void {
    this.removeListeners();

    const iap = getIAP();
    if (!iap) return;
    purchaseUpdateSubscription = iap.purchaseUpdatedListener(onPurchase);
    purchaseErrorSubscription = iap.purchaseErrorListener(onError);

    console.log('[IAPService] Listeners set up');
  },

  /**
   * Remove purchase listeners
   */
  removeListeners(): void {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  },

  /**
   * Clean up IAP connection and listeners
   */
  async cleanup(): Promise<void> {
    try {
      this.removeListeners();
      const iap = getIAP();
      if (!iap) return;
      await iap.endConnection();
      console.log('[IAPService] Cleaned up');
    } catch (error) {
      console.error('[IAPService] Cleanup error:', error);
    }
  },
} as const;
