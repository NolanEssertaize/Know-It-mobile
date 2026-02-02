/**
 * @file SecureStorage.ts
 * @description Secure storage wrapper for sensitive data
 */

import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage utility for sensitive data like tokens
 */
export const SecureStorage = {
  /**
   * Save a value to secure storage
   */
  async set(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error saving ${key}:`, error);
      return false;
    }
  },

  /**
   * Get a value from secure storage
   */
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorage] Error reading ${key}:`, error);
      return null;
    }
  },

  /**
   * Delete a value from secure storage
   */
  async delete(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error deleting ${key}:`, error);
      return false;
    }
  },

  /**
   * Save a JSON object to secure storage
   */
  async setObject<T>(key: string, value: T): Promise<boolean> {
    try {
      const json = JSON.stringify(value);
      return this.set(key, json);
    } catch (error) {
      console.error(`[SecureStorage] Error serializing ${key}:`, error);
      return false;
    }
  },

  /**
   * Get a JSON object from secure storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const json = await this.get(key);
      if (json) {
        return JSON.parse(json) as T;
      }
      return null;
    } catch (error) {
      console.error(`[SecureStorage] Error parsing ${key}:`, error);
      return null;
    }
  },
};
