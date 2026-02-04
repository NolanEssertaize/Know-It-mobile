/**
 * @file LanguageSwitcher/index.tsx
 * @description Language switcher component for profile preferences
 * Uses MaterialIcons "language" icon instead of emoji flags
 */

import React, { memo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import i18n from 'i18next';

import { useTheme, Spacing, BorderRadius } from '@/theme';

// Hardcoded language display names
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
};

interface LanguageSwitcherProps {
  showIcon?: boolean;
}

function LanguageSwitcherComponent({ showIcon = true }: LanguageSwitcherProps) {
  const { colors } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleChangeLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
  };

  // Available language codes
  const languageCodes = ['en', 'fr'];

  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.glass.background }]}>
            <MaterialIcons name="language" size={20} color={colors.text.primary} />
          </View>
          <View style={styles.labelContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Language
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              Choose your preferred language
            </Text>
          </View>
        </View>
      )}
      <View style={styles.languageSelector}>
        <TouchableOpacity
          style={[
            styles.languageOption,
            {
              backgroundColor: currentLanguage === 'en' ? colors.text.primary : colors.glass.background,
              borderColor: currentLanguage === 'en' ? colors.text.primary : colors.glass.border,
            },
          ]}
          onPress={() => handleChangeLanguage('en')}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: currentLanguage === 'en' ? colors.text.inverse : colors.text.primary,
            }}
          >
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.languageOption,
            {
              backgroundColor: currentLanguage === 'fr' ? colors.text.primary : colors.glass.background,
              borderColor: currentLanguage === 'fr' ? colors.text.primary : colors.glass.border,
            },
          ]}
          onPress={() => handleChangeLanguage('fr')}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: currentLanguage === 'fr' ? colors.text.inverse : colors.text.primary,
            }}
          >
            Français
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  languageOption: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const LanguageSwitcher = memo(LanguageSwitcherComponent);
export default LanguageSwitcher;
