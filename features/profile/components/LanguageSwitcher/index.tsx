/**
 * @file LanguageSwitcher/index.tsx
 * @description Language switcher component for profile preferences
 * Uses MaterialIcons "language" icon instead of emoji flags
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useLanguage, type LanguageCode } from '@/i18n';

interface LanguageSwitcherProps {
  showIcon?: boolean;
}

function LanguageSwitcherComponent({ showIcon = true }: LanguageSwitcherProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();

  const handleLanguageChange = async (code: LanguageCode) => {
    await changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.glass.background }]}>
            <MaterialIcons name="language" size={20} color={colors.text.primary} />
          </View>
          <View style={styles.labelContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('profile.language')}
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {t('profile.preferences.languageDescription')}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.languageSelector}>
        {availableLanguages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageOption,
              {
                backgroundColor: colors.glass.background,
                borderColor: colors.glass.border,
              },
              currentLanguage === lang.code && {
                backgroundColor: colors.text.primary,
                borderColor: colors.text.primary,
              },
            ]}
            onPress={() => handleLanguageChange(lang.code)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.languageText,
                { color: colors.text.secondary },
                currentLanguage === lang.code && {
                  color: colors.text.inverse,
                },
              ]}
            >
              {lang.name}
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
