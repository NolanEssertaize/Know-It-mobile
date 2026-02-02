/**
 * @file LoginScreen.tsx
 * @description Login screen with i18n support
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import { useLogin } from '../hooks/useLogin';

export const LoginScreen = memo(function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const logic = useLogin();

  return (
    <ScreenWrapper scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface.glass }]}>
            <MaterialIcons name="school" size={48} color={colors.accent.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('auth.login.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {t('auth.login.subtitle')}
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
              {t('auth.login.email')}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: colors.glass.border }]}>
              <MaterialIcons name="email" size={20} color={colors.text.muted} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder={t('auth.login.emailPlaceholder')}
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
              {t('auth.login.password')}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: colors.glass.border }]}>
              <MaterialIcons name="lock" size={20} color={colors.text.muted} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder={t('auth.login.passwordPlaceholder')}
                placeholderTextColor={colors.text.muted}
                value={logic.password}
                onChangeText={logic.setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          {/* Login Button */}
          <GlassButton
            title={t('auth.login.signIn')}
            onPress={logic.handleLogin}
            loading={logic.isLoading}
            disabled={!logic.email.trim() || !logic.password}
            fullWidth
            style={styles.loginButton}
          />

          {/* Register Link */}
          <View style={styles.registerLinkContainer}>
            <Text style={[styles.registerText, { color: colors.text.secondary }]}>
              {t('auth.login.noAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={logic.navigateToRegister}>
              <Text style={[styles.registerLink, { color: colors.accent.primary }]}>
                {t('auth.login.signUp')}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  loginButton: {
    marginTop: Spacing.md,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    ...Typography.body.medium,
  },
  registerLink: {
    ...Typography.body.medium,
    fontWeight: '600',
  },
});
export default LoginScreen;
