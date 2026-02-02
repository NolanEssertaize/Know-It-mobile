/**
 * @file RegisterScreen.tsx
 * @description Registration screen with i18n support
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import { useRegister } from '../hooks/useRegister';

export const RegisterScreen = memo(function RegisterScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const logic = useRegister();

  return (
    <ScreenWrapper scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surface.glass }]}>
              <MaterialIcons name="person-add" size={48} color={colors.accent.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('auth.register.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              {t('auth.register.subtitle')}
            </Text>
          </View>

          {/* Form */}
          <GlassView style={styles.formContainer}>
            {/* Error Message */}
            {logic.error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.status.error + '20' }]}>
                <MaterialIcons name="error-outline" size={20} color={colors.status.error} />
                <Text style={[styles.errorText, { color: colors.status.error }]}>
                  {logic.error}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                {t('auth.register.email')}
              </Text>
              <View style={[styles.inputWrapper, { borderColor: colors.glass.border }]}>
                <MaterialIcons name="email" size={20} color={colors.text.muted} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder={t('auth.register.emailPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  value={logic.email}
                  onChangeText={logic.setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                {t('auth.register.password')}
              </Text>
              <View style={[styles.inputWrapper, { borderColor: colors.glass.border }]}>
                <MaterialIcons name="lock" size={20} color={colors.text.muted} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  value={logic.password}
                  onChangeText={logic.setPassword}
                  secureTextEntry
                  autoComplete="password-new"
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                {t('auth.register.confirmPassword')}
              </Text>
              <View style={[styles.inputWrapper, { borderColor: colors.glass.border }]}>
                <MaterialIcons name="lock-outline" size={20} color={colors.text.muted} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.text.muted}
                  value={logic.confirmPassword}
                  onChangeText={logic.setConfirmPassword}
                  secureTextEntry
                  autoComplete="password-new"
                />
              </View>
            </View>

            {/* Register Button */}
            <GlassButton
              title={t('auth.register.createAccount')}
              onPress={logic.handleRegister}
              loading={logic.isLoading}
              disabled={!logic.email.trim() || !logic.password || !logic.confirmPassword}
              fullWidth
              style={styles.registerButton}
            />

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={[styles.loginText, { color: colors.text.secondary }]}>
                {t('auth.register.hasAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={logic.navigateToLogin}>
                <Text style={[styles.loginLink, { color: colors.accent.primary }]}>
                  {t('auth.register.signIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading.h1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body.medium,
    textAlign: 'center',
  },
  formContainer: {
    marginHorizontal: Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.body.small,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body.small,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    ...Typography.body.medium,
  },
  registerButton: {
    marginTop: Spacing.md,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    ...Typography.body.medium,
  },
  loginLink: {
    ...Typography.body.medium,
    fontWeight: '600',
  },
});
export default RegisterScreen;
