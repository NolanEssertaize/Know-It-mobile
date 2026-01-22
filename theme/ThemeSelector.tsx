/**
 * @file ThemeSelector.tsx
 * @description Theme Selector Component - Settings UI for theme preferences
 *
 * Features:
 * - Three options: Light, Dark, System
 * - Visual indicator of current selection
 * - Smooth animations
 * - Monochrome design consistency
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme, type ThemeMode } from './ThemeContext';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadows } from './theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  labelFr: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
  descriptionFr: string;
}

interface ThemeSelectorProps {
  /** Language for labels */
  language?: 'en' | 'fr';
  /** Callback when theme changes */
  onThemeChange?: (mode: ThemeMode) => void;
  /** Show description text */
  showDescriptions?: boolean;
  /** Compact mode (icons only) */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const THEME_OPTIONS: ThemeOption[] = [
  {
    mode: 'light',
    label: 'Light',
    labelFr: 'Clair',
    icon: 'light-mode',
    description: 'Always use light theme',
    descriptionFr: 'Toujours utiliser le thème clair',
  },
  {
    mode: 'dark',
    label: 'Dark',
    labelFr: 'Sombre',
    icon: 'dark-mode',
    description: 'Always use dark theme',
    descriptionFr: 'Toujours utiliser le thème sombre',
  },
  {
    mode: 'system',
    label: 'System',
    labelFr: 'Système',
    icon: 'settings-brightness',
    description: 'Match device settings',
    descriptionFr: 'Suivre les paramètres de l\'appareil',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// THEME OPTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeOptionButtonProps {
  option: ThemeOption;
  isSelected: boolean;
  onPress: () => void;
  language: 'en' | 'fr';
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
  showDescription: boolean;
  compact: boolean;
}

const ThemeOptionButton = memo(function ThemeOptionButton({
  option,
  isSelected,
  onPress,
  language,
  colors,
  isDark,
  showDescription,
  compact,
}: ThemeOptionButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const label = language === 'fr' ? option.labelFr : option.label;
  const description = language === 'fr' ? option.descriptionFr : option.description;

  // Dynamic styles based on theme and selection
  const buttonStyles = [
    styles.optionButton,
    compact && styles.optionButtonCompact,
    {
      backgroundColor: isSelected
        ? colors.text.primary
        : colors.glass.background,
      borderColor: isSelected
        ? colors.text.primary
        : colors.glass.border,
    },
    isSelected && Shadows.glassLight,
  ];

  const textColor = isSelected
    ? (isDark ? '#000000' : '#FFFFFF')
    : colors.text.primary;

  const secondaryTextColor = isSelected
    ? (isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)')
    : colors.text.secondary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={option.icon}
        size={compact ? 20 : 24}
        color={textColor}
      />
      
      {!compact && (
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionLabel, { color: textColor }]}>
            {label}
          </Text>
          
          {showDescription && (
            <Text style={[styles.optionDescription, { color: secondaryTextColor }]}>
              {description}
            </Text>
          )}
        </View>
      )}

      {isSelected && !compact && (
        <MaterialIcons
          name="check"
          size={20}
          color={textColor}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ThemeSelector = memo(function ThemeSelector({
  language = 'fr',
  onThemeChange,
  showDescriptions = false,
  compact = false,
}: ThemeSelectorProps) {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  const handleSelectTheme = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    onThemeChange?.(mode);
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {THEME_OPTIONS.map((option) => (
        <ThemeOptionButton
          key={option.mode}
          option={option}
          isSelected={themeMode === option.mode}
          onPress={() => handleSelectTheme(option.mode)}
          language={language}
          colors={colors}
          isDark={isDark}
          showDescription={showDescriptions}
          compact={compact}
        />
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT INLINE SELECTOR (for quick toggle in header)
// ═══════════════════════════════════════════════════════════════════════════

export const ThemeSelectorInline = memo(function ThemeSelectorInline() {
  return <ThemeSelector compact showDescriptions={false} />;
});

// ═══════════════════════════════════════════════════════════════════════════
// SEGMENTED CONTROL STYLE
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeSegmentedControlProps {
  language?: 'en' | 'fr';
}

export const ThemeSegmentedControl = memo(function ThemeSegmentedControl({
  language = 'fr',
}: ThemeSegmentedControlProps) {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  const handleSelectTheme = async (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setThemeMode(mode);
  };

  return (
    <View
      style={[
        styles.segmentedContainer,
        {
          backgroundColor: colors.glass.background,
          borderColor: colors.glass.border,
        },
      ]}
    >
      {THEME_OPTIONS.map((option, index) => {
        const isSelected = themeMode === option.mode;
        const label = language === 'fr' ? option.labelFr : option.label;

        return (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.segmentedOption,
              isSelected && {
                backgroundColor: colors.text.primary,
              },
              index < THEME_OPTIONS.length - 1 && {
                borderRightWidth: 1,
                borderRightColor: colors.glass.border,
              },
            ]}
            onPress={() => handleSelectTheme(option.mode)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={option.icon}
              size={18}
              color={isSelected ? (isDark ? '#000' : '#FFF') : colors.text.secondary}
            />
            <Text
              style={[
                styles.segmentedLabel,
                {
                  color: isSelected ? (isDark ? '#000' : '#FFF') : colors.text.secondary,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Main container
  container: {
    gap: Spacing.sm,
  },

  containerCompact: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },

  // Option buttons
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },

  optionButtonCompact: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },

  optionTextContainer: {
    flex: 1,
  },

  optionLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },

  optionDescription: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  checkIcon: {
    marginLeft: 'auto',
  },

  // Segmented control
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },

  segmentedOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },

  segmentedLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});

export default ThemeSelector;
