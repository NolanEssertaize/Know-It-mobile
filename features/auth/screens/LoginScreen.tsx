/**
 * @file LoginScreen.tsx
 * @description Login screen - Theme Aware, NO EMOJI
 */

import React, { memo, useRef, useCallback } from 'react';
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
import { Mail, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE LOGO
// ═══════════════════════════════════════════════════════════════════════════

function GoogleLogo({ size = 20 }: { size?: number }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48">
            <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <Path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z" />
            <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </Svg>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LoginScreen = memo(function LoginScreen() {
    const router = useRouter();
    const passwordInputRef = useRef<TextInput>(null);
    const { colors } = useTheme();
    const { t } = useTranslation();

    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        error,
        validationErrors,
        handleLogin,
        clearError,
    } = useAuth();

    const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleAuth();

    const onGooglePress = useCallback(async () => {
        const result = await handleGoogleSignIn();
        if (result.success) {
            router.replace('/');
        } else if (result.error) {
            Alert.alert(t('auth.login.googleSignInFailed'), result.error);
        }
    }, [handleGoogleSignIn, router, t]);

    const onLoginPress = async () => {
        clearError();
        const result = await handleLogin();
        if (result.success) {
            router.replace('/');
        } else if (result.error) {
            Alert.alert(t('auth.login.loginFailed'), result.error);
        }
    };

    const onRegisterPress = () => {
        router.push('/register');
    };

    const onEmailSubmit = () => {
        passwordInputRef.current?.focus();
    };

    return (
        <AuthLayout
            title={t('auth.login.title')}
            subtitle={t('auth.login.subtitle')}
            footer={
                <View style={styles.footerContent}>
                    <Text style={[styles.footerText, { color: colors.text.secondary }]}>
                        {t('auth.login.noAccount')}
                    </Text>
                    <TouchableOpacity onPress={onRegisterPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={[styles.footerLink, { color: colors.text.primary }]}>{t('auth.login.signUp')}</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            {/* Email Input */}
            <GlassInput
                label={t('auth.login.email')}
                placeholder={t('auth.login.emailPlaceholder')}
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
                label={t('auth.login.password')}
                placeholder={t('auth.login.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                error={validationErrors.password}
                leftIcon={Lock}
                isPassword
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={onLoginPress}
                editable={!isLoading}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => router.push({ pathname: '/(auth)/forgot-password', params: { email } })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={[styles.forgotPasswordText, { color: colors.text.muted }]}>
                    {t('auth.login.forgotPassword')}
                </Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.surface.glass }]}>
                    <Text style={[styles.errorText, { color: colors.text.primary }]}>{error}</Text>
                </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
                onPress={onLoginPress}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.buttonContainer}
            >
                <View
                    style={[
                        styles.loginButton,
                        { backgroundColor: isLoading ? colors.surface.glass : colors.text.primary },
                    ]}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.text.primary} />
                    ) : (
                        <Text style={[styles.loginButtonText, { color: colors.text.inverse }]}>
                            {t('auth.login.signIn')}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
                <Text style={[styles.dividerText, { color: colors.text.muted }]}>{t('auth.login.orContinueWith')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
                style={[styles.googleButton, { backgroundColor: colors.surface.glass, borderColor: colors.glass.border }]}
                disabled={isLoading || isGoogleLoading}
                onPress={onGooglePress}
                activeOpacity={0.8}
            >
                {isGoogleLoading ? (
                    <ActivityIndicator size="small" color={colors.text.primary} />
                ) : (
                    <>
                        <GoogleLogo size={22} />
                        <Text style={[styles.googleButtonText, { color: colors.text.primary }]}>
                            {t('auth.login.signInWithGoogle')}
                        </Text>
                    </>
                )}
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.lg,
    },
    forgotPasswordText: {
        fontSize: 14,
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
        marginBottom: Spacing.lg,
    },
    loginButton: {
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: Spacing.md,
        fontSize: 14,
    },
    googleButton: {
        height: 56,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        gap: Spacing.sm,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;
