/**
 * @file RegisterScreen.tsx
 * @description Register screen - Theme Aware, NO EMOJI
 */

import React, { memo, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const RegisterScreen = memo(function RegisterScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const {
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        fullName,
        setFullName,
        isLoading,
        error,
        validationErrors,
        handleRegister,
        clearError,
    } = useAuth();

    const onRegisterPress = async () => {
        clearError();
        const result = await handleRegister();
        if (result.success) {
            router.replace('/');
        } else if (result.error) {
            Alert.alert(t('auth.register.registrationFailed'), result.error);
        }
    };

    const onLoginPress = () => {
        router.back();
    };

    const onFullNameSubmit = () => emailInputRef.current?.focus();
    const onEmailSubmit = () => passwordInputRef.current?.focus();
    const onPasswordSubmit = () => confirmPasswordInputRef.current?.focus();

    return (
        <AuthLayout
            title={t('auth.register.title')}
            subtitle={t('auth.register.subtitle')}
            footer={
                <View style={styles.footerContent}>
                    <Text style={[styles.footerText, { color: colors.text.secondary }]}>
                        {t('auth.register.hasAccount')}
                    </Text>
                    <TouchableOpacity onPress={onLoginPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={[styles.footerLink, { color: colors.text.primary }]}>{t('auth.register.signIn')}</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            {/* Full Name Input */}
            <GlassInput
                label={t('auth.register.fullName')}
                placeholder={t('auth.register.fullNamePlaceholder')}
                value={fullName}
                onChangeText={setFullName}
                error={validationErrors.fullName}
                leftIcon={User}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={onFullNameSubmit}
                editable={!isLoading}
            />

            {/* Email Input */}
            <GlassInput
                ref={emailInputRef}
                label={t('auth.register.email')}
                placeholder={t('auth.register.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                error={validationErrors.email}
                leftIcon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={onEmailSubmit}
                editable={!isLoading}
            />

            {/* Password Input */}
            <GlassInput
                ref={passwordInputRef}
                label={t('auth.register.password')}
                placeholder={t('auth.register.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                error={validationErrors.password}
                leftIcon={Lock}
                isPassword
                autoComplete="password-new"
                returnKeyType="next"
                onSubmitEditing={onPasswordSubmit}
                editable={!isLoading}
            />

            {/* Confirm Password Input */}
            <GlassInput
                ref={confirmPasswordInputRef}
                label={t('auth.register.confirmPassword')}
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={validationErrors.confirmPassword}
                leftIcon={Lock}
                isPassword
                autoComplete="password-new"
                returnKeyType="done"
                onSubmitEditing={onRegisterPress}
                editable={!isLoading}
            />

            {/* Password Requirements Hint */}
            <View style={styles.hintContainer}>
                <Text style={[styles.hintText, { color: colors.text.muted }]}>
                    {t('auth.register.weakPassword')}
                </Text>
            </View>

            {/* Error Message */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.surface.glass }]}>
                    <Text style={[styles.errorText, { color: colors.text.primary }]}>{error}</Text>
                </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
                onPress={onRegisterPress}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.buttonContainer}
            >
                <View
                    style={[
                        styles.registerButton,
                        { backgroundColor: isLoading ? colors.surface.glass : colors.text.primary },
                    ]}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.text.primary} />
                    ) : (
                        <Text style={[styles.registerButtonText, { color: colors.text.inverse }]}>
                            {t('auth.register.createAccount')}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        </AuthLayout>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    hintContainer: {
        marginBottom: Spacing.md,
    },
    hintText: {
        fontSize: 12,
    },
    errorContainer: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: Spacing.md,
    },
    registerButton: {
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RegisterScreen;
