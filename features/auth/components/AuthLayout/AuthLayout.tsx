/**
 * @file AuthLayout.tsx
 * @description Shared layout for authentication screens - Theme Aware
 * 
 * FIXED: Now uses useTheme() for dynamic colors
 */

import React, { memo, type ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthLayoutProps {
  /** Screen title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Main content */
  children: ReactNode;
  /** Footer content (e.g., "Already have an account?") */
  footer?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AuthLayout = memo(function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  // Get theme colors dynamically
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={[
          colors.gradient.start,
          colors.gradient.middle,
          colors.gradient.end,
        ]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Logo/Brand Section */}
              <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                  {/* LED Orb Effect - Theme Aware */}
                  <View style={[
                    styles.logoOrbOuter,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                  ]}>
                    <View style={[
                      styles.logoOrbMiddle,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)' }
                    ]}>
                      <View style={[
                        styles.logoOrbInner,
                        { backgroundColor: colors.text.primary }
                      ]}>
                        <Text style={[styles.logoText, { color: colors.text.inverse }]}>K</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={[styles.appName, { color: colors.text.primary }]}>KnowIt</Text>
                <Text style={[styles.tagline, { color: colors.text.secondary }]}>Learn by explaining</Text>
              </View>

              {/* Header Section */}
              <View style={styles.headerSection}>
                <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
                {subtitle && (
                  <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
                )}
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {children}
              </View>

              {/* Footer Section */}
              {footer && (
                <View style={styles.footerSection}>
                  {footer}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoOrbOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOrbMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOrbInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
  },
  footerSection: {
    marginTop: 24,
    alignItems: 'center',
  },
});
