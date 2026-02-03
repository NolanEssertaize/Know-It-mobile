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
        {languageCodes.map((code) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.languageOption,
              {
                backgroundColor: colors.glass.background,
                borderColor: colors.glass.border,
              },
              currentLanguage === code && {
                backgroundColor: colors.text.primary,
                borderColor: colors.text.primary,
              },
            ]}
            onPress={() => handleChangeLanguage(code)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.languageText,
                { color: colors.text.primary },
                currentLanguage === code && {
                  color: colors.text.inverse,
                },
              ]}
            >
              {LANGUAGE_NAMES[code]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
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
    gap: Spacing.sm,
  },
  languageOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export const LanguageSwitcher = memo(LanguageSwitcherComponent);
export default LanguageSwitcher;
