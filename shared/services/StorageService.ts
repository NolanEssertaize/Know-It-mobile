/**
 * @file StorageService.ts
 * @description Service de persistance locale avec AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic } from '@/types';

const STORAGE_KEY = '@knowit_topics';

export const StorageService = {
  /**
   * Récupère tous les topics depuis le stockage local
   */
  async getTopics(): Promise<Topic[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('[StorageService] Read Error:', error);
      return [];
    }
  },

  /**
   * Sauvegarde les topics dans le stockage local
   */
  async saveTopics(topics: Topic[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
    } catch (error) {
      console.error('[StorageService] Write Error:', error);
    }
  },

  /**
   * Supprime toutes les données stockées
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[StorageService] Clear Error:', error);
    }
  },
} as const;
