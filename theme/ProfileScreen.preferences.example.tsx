/**
 * @file ProfileScreen.preferences.tsx
 * @description Example implementation of theme settings in ProfileScreen
 *
 * This shows how to integrate the ThemeSelector into your existing
 * preferences tab. Copy the relevant sections to your ProfileScreen.tsx
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassView } from '@/components/ui';
import {
  useTheme,
  ThemeSelector,
  ThemeSegmentedControl,
  Spacing,
  FontSize,
  FontWeight,
} from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// THEME SETTINGS SECTION
// Add this to your renderPreferencesTab function
// ═══════════════════════════════════════════════════════════════════════════

export function ThemeSettingsSection() {
  const { colors, themeMode, resolvedTheme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Apparence
      </Text>

      <GlassView variant="default" style={styles.sectionCard}>
        {/* Option 1: Full selector with icons and labels */}
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={[styles.settingTitle, { color: colors.text.primary }]}>
              Thème
            </Text>
            <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
              Choisissez l'apparence de l'application
            </Text>
          </View>

          <View style={styles.themeSelectorContainer}>
            <ThemeSelector
              language="fr"
              showDescriptions={false}
            />
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.glass.borderDivider }]} />

        {/* Current theme indicator */}
        <View style={styles.settingItem}>
          <Text style={[styles.infoLabel, { color: colors.text.muted }]}>
            Thème actuel : {resolvedTheme === 'dark' ? 'Sombre' : 'Clair'}
            {themeMode === 'system' && ' (système)'}
          </Text>
        </View>
      </GlassView>

      {/* Alternative: Compact segmented control */}
      <View style={styles.alternativeSection}>
        <Text style={[styles.alternativeLabel, { color: colors.text.secondary }]}>
          Ou utilisez le sélecteur compact :
        </Text>
        <ThemeSegmentedControl language="fr" />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE: Full Preferences Tab with Theme
// ═══════════════════════════════════════════════════════════════════════════

interface PreferencesTabProps {
  logic: {
    preferences: {
      notifications: boolean;
      autoSave: boolean;
      analyticsEnabled: boolean;
      language: 'en' | 'fr';
    };
    toggleNotifications: () => void;
    toggleAutoSave: () => void;
    toggleAnalytics: () => void;
    setLanguage: (lang: 'en' | 'fr') => void;
  };
}

export function PreferencesTabExample({ logic }: PreferencesTabProps) {
  const { colors } = useTheme();

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* THEME SETTINGS - ADD THIS SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <ThemeSettingsSection />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* REST OF YOUR EXISTING PREFERENCES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Notifications section remains unchanged */}
      {/* Language section remains unchanged */}
      {/* Data & Storage section remains unchanged */}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },

  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },

  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  settingItem: {
    padding: Spacing.md,
  },

  settingHeader: {
    marginBottom: Spacing.md,
  },

  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },

  settingDescription: {
    fontSize: FontSize.sm,
  },

  themeSelectorContainer: {
    marginTop: Spacing.sm,
  },

  divider: {
    height: 1,
    marginHorizontal: Spacing.md,
  },

  infoLabel: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },

  alternativeSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },

  alternativeLabel: {
    fontSize: FontSize.sm,
    marginLeft: Spacing.xs,
  },
});

export default ThemeSettingsSection;
