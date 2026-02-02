/**
 * @file i18n.ts
 * @description i18next configuration with AsyncStorage persistence
 * 
 * CRITICAL: This file must be imported FIRST in app/_layout.tsx
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './locales/en.json';
import fr from './locales/fr.json';

// Storage key for language preference
const LANGUAGE_KEY = '@knowit/language';

// Available languages
export const LANGUAGES = {
  en: { nativeName: 'English', flag: '🇬🇧' },
  fr: { nativeName: 'Français', flag: '🇫🇷' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Language detector plugin for React Native with AsyncStorage
const languageDetectorPlugin = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.log('[i18n] Error reading language from storage:', error);
    }
    // Default to English if no saved preference
    callback('en');
  },
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch (error) {
      console.log('[i18n] Error saving language to storage:', error);
    }
  },
};

// Resources object with translations
const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Initialize i18next
i18n
  .use(languageDetectorPlugin)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4', // Required for React Native
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Required for React Native
    },
    // Debug mode (disable in production)
    debug: __DEV__,
  });

export default i18n;
