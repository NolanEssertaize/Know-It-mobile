/**
 * @file useLanguage.ts
 * @description Custom hook for managing language preferences
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, type LanguageCode } from './i18n';

interface UseLanguageReturn {
  /** Current language code */
  currentLanguage: LanguageCode;
  /** Current language display name */
  currentLanguageName: string;
  /** List of available languages */
  availableLanguages: Array<{
    code: LanguageCode;
    name: string;
  }>;
  /** Change the current language */
  changeLanguage: (code: LanguageCode) => Promise<void>;
  /** Check if a language code is the current language */
  isCurrentLanguage: (code: LanguageCode) => boolean;
}

/**
 * Hook for managing language preferences
 *
 * @example
 * ```tsx
 * const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
 *
 * // Change language
 * await changeLanguage('fr');
 *
 * // Map available languages
 * availableLanguages.map(lang => (
 *   <Button
 *     key={lang.code}
 *     onPress={() => changeLanguage(lang.code)}
 *   >
 *     {lang.name}
 *   </Button>
 * ))
 * ```
 */
export function useLanguage(): UseLanguageReturn {
  const { i18n } = useTranslation();

  const currentLanguage = (i18n.language || 'en') as LanguageCode;

  const currentLanguageName = useMemo(() => {
    return LANGUAGES[currentLanguage]?.nativeName || 'English';
  }, [currentLanguage]);

  const availableLanguages = useMemo(() => {
    return Object.entries(LANGUAGES).map(([code, info]) => ({
      code: code as LanguageCode,
      name: info.nativeName,
    }));
  }, []);

  const changeLanguage = useCallback(
    async (code: LanguageCode) => {
      if (code !== currentLanguage) {
        console.log('[useLanguage] Changing language to:', code);
        await i18n.changeLanguage(code);
      }
    },
    [i18n, currentLanguage]
  );

  const isCurrentLanguage = useCallback(
    (code: LanguageCode) => code === currentLanguage,
    [currentLanguage]
  );

  return {
    currentLanguage,
    currentLanguageName,
    availableLanguages,
    changeLanguage,
    isCurrentLanguage,
  };
}
