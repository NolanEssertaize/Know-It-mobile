/**
 * @file RegisterScreen.tsx
 * @description Register screen - Step-by-step form with Google sign-up, Theme Aware, NO EMOJI
 */

import React, { memo, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { Check } from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

export const RegisterScreen = memo(function RegisterScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [cguAccepted, setCguAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

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

    const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleAuth();

    const advanceStep = useCallback((nextStep: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep(nextStep);
    }, []);

    const onGooglePress = useCallback(async () => {
        const result = await handleGoogleSignIn();
        if (result.success) {
            router.replace('/');
        } else if (result.error) {
            Alert.alert(t('auth.register.registrationFailed'), result.error);
        }
    }, [handleGoogleSignIn, router, t]);

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

    const onFullNameSubmit = () => {
        if (fullName.trim()) {
            advanceStep(2);
            setTimeout(() => emailInputRef.current?.focus(), 100);
        }
    };

    const onEmailSubmit = () => {
        if (email.trim()) {
            advanceStep(3);
            setTimeout(() => passwordInputRef.current?.focus(), 100);
        }
    };

    const onPasswordSubmit = () => {
        if (password.trim()) {
            advanceStep(4);
            setTimeout(() => confirmPasswordInputRef.current?.focus(), 100);
        }
    };

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
            {/* Step 1: Full Name Input */}
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

            {/* Step 2: Email Input */}
            {step >= 2 && (
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
            )}

            {/* Step 3: Password Input */}
            {step >= 3 && (
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
            )}

            {/* Step 4: Confirm Password Input */}
            {step >= 4 && (
                <>
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

                    {/* Legal Consent Checkboxes */}
                    <View style={styles.consentContainer}>
                        <View style={styles.consentRow}>
                            <TouchableOpacity
                                onPress={() => setCguAccepted(prev => !prev)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: cguAccepted }}
                                accessibilityLabel={`${t('legal.consent.cgu')} ${t('legal.cgu')}`}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        {
                                            borderColor: colors.text.muted,
                                            backgroundColor: cguAccepted ? colors.text.primary : 'transparent',
                                        },
                                    ]}
                                >
                                    {cguAccepted && <Check size={14} color={colors.text.inverse} strokeWidth={3} />}
                                </View>
                            </TouchableOpacity>
                            <Text style={[styles.consentText, { color: colors.text.secondary }]}>
                                {t('legal.consent.cgu')}{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/terms-of-service')} activeOpacity={0.7}>
                                <Text style={[styles.consentLink, { color: colors.text.primary }]}>
                                    {t('legal.cgu')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.consentRow}>
                            <TouchableOpacity
                                onPress={() => setPrivacyAccepted(prev => !prev)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: privacyAccepted }}
                                accessibilityLabel={`${t('legal.consent.privacy')} ${t('legal.privacy')}`}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        {
                                            borderColor: colors.text.muted,
                                            backgroundColor: privacyAccepted ? colors.text.primary : 'transparent',
                                        },
                                    ]}
                                >
                                    {privacyAccepted && <Check size={14} color={colors.text.inverse} strokeWidth={3} />}
                                </View>
                            </TouchableOpacity>
                            <Text style={[styles.consentText, { color: colors.text.secondary }]}>
                                {t('legal.consent.privacy')}{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/privacy-policy')} activeOpacity={0.7}>
                                <Text style={[styles.consentLink, { color: colors.text.primary }]}>
                                    {t('legal.privacy')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}

            {/* Error Message */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.surface.glass }]}>
                    <Text style={[styles.errorText, { color: colors.text.primary }]}>{error}</Text>
                </View>
            )}

            {/* Create Account Button - only at final step, requires consent */}
            {step >= 4 && (
                <TouchableOpacity
                    onPress={onRegisterPress}
                    disabled={isLoading || !cguAccepted || !privacyAccepted}
                    activeOpacity={0.8}
                    style={styles.buttonContainer}
                >
                    <View
                        style={[
                            styles.registerButton,
                            {
                                backgroundColor: (isLoading || !cguAccepted || !privacyAccepted)
                                    ? colors.surface.glass
                                    : colors.text.primary,
                            },
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
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
                <Text style={[styles.dividerText, { color: colors.text.muted }]}>{t('auth.register.orContinueWith')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
            </View>

            {/* Google Sign-Up Button */}
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
                            {t('auth.register.signUpWithGoogle')}
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
        marginBottom: Spacing.lg,
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
    consentContainer: {
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    consentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    consentText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    consentLink: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;
