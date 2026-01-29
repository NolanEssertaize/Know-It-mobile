/**
 * @file LoginScreen.tsx
 * @description Login screen - Theme Aware, NO EMOJI
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
import { Mail, Lock } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LoginScreen = memo(function LoginScreen() {
    const router = useRouter();
    const passwordInputRef = useRef<TextInput>(null);
    const { colors } = useTheme();

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

    const onLoginPress = async () => {
        clearError();
        const result = await handleLogin();
        if (result.success) {
            router.replace('/');
        } else if (result.error) {
            Alert.alert('Login Failed', result.error);
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
            title="Welcome Back"
            subtitle="Sign in to continue your learning journey"
            footer={
                <View style={styles.footerContent}>
                    <Text style={[styles.footerText, { color: colors.text.secondary }]}>
                        Don't have an account?
                    </Text>
                    <TouchableOpacity onPress={onRegisterPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={[styles.footerLink, { color: colors.text.primary }]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            {/* Email Input */}
            <GlassInput
                label="Email"
                placeholder="Enter your email"
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
                label="Password"
                placeholder="Enter your password"
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
            <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordText, { color: colors.text.muted }]}>
                    Forgot Password?
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
                            Sign In
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
                <Text style={[styles.dividerText, { color: colors.text.muted }]}>or continue with</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
            </View>

            {/* Social Login Buttons - NO EMOJI */}
            <View style={styles.socialContainer}>
                <TouchableOpacity 
                    style={[styles.socialButton, { backgroundColor: colors.surface.glass, borderColor: colors.glass.border }]} 
                    disabled={isLoading}
                >
                    <MaterialCommunityIcons name="google" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.socialButton, { backgroundColor: colors.surface.glass, borderColor: colors.glass.border }]} 
                    disabled={isLoading}
                >
                    <MaterialCommunityIcons name="apple" size={24} color={colors.text.primary} />
                </TouchableOpacity>
            </View>
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
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});

export default LoginScreen;
