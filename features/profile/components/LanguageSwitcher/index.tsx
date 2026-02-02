/**
 * @file features/profile/components/LanguageSwitcher/index.tsx
 * @description Language selection component with flags and visual feedback
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { GlassView } from '@/shared/components';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSwitcherProps {
  currentLanguage: string;
  availableLanguages: LanguageOption[];
  onLanguageChange: (code: string) => void;
  disabled?: boolean;
}

export function LanguageSwitcher({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  disabled = false,
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        {t('profile.language')}
      </Text>
      
      <View style={styles.optionsContainer}>
        {availableLanguages.map((language) => {
          const isSelected = currentLanguage === language.code;
          
          return (
            <TouchableOpacity
              key={language.code}
              onPress={() => onLanguageChange(language.code)}
              disabled={disabled || isSelected}
              activeOpacity={0.7}
              style={styles.optionWrapper}
            >
              <GlassView
                variant={isSelected ? 'elevated' : 'subtle'}
                padding="md"
                radius="lg"
                style={[
                  styles.option,
                  isSelected && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text style={styles.flag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    { color: isSelected ? colors.primary : colors.text.primary },
                  ]}
                >
                  {language.name}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.checkmark,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </GlassView>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionWrapper: {
    flex: 1,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  flag: {
    fontSize: 32,
    marginBottom: 8,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LanguageSwitcher;
