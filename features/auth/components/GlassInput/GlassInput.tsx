/**
 * @file GlassInput.tsx
 * @description Text Input with Glassmorphism style - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { useState, forwardRef, memo } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    type TextInputProps,
    type ViewStyle,
    StyleSheet,
} from 'react-native';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useTheme, Spacing, BorderRadius, FontSize } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassInputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    leftIcon?: LucideIcon;
    isPassword?: boolean;
    containerStyle?: ViewStyle;
    disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const GlassInput = memo(forwardRef<TextInput, GlassInputProps>(
    function GlassInput(
        {
            label,
            error,
            leftIcon: LeftIcon,
            isPassword = false,
            containerStyle,
            disabled = false,
            ...textInputProps
        },
        ref,
    ) {
        const [isFocused, setIsFocused] = useState(false);
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const { colors } = useTheme();

        const hasError = Boolean(error);

        const handleFocus = () => {
            setIsFocused(true);
            textInputProps.onFocus?.({} as any);
        };

        const handleBlur = () => {
            setIsFocused(false);
            textInputProps.onBlur?.({} as any);
        };

        const togglePasswordVisibility = () => {
            setIsPasswordVisible((prev) => !prev);
        };

        return (
            <View style={[styles.container, containerStyle]}>
                {/* Label */}
                {label && (
                    <Text style={[styles.label, { color: colors.text.secondary }]}>
                        {label}
                    </Text>
                )}

                {/* Input Container */}
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: colors.surface.glass,
                            borderColor: isFocused 
                                ? colors.text.primary 
                                : hasError 
                                    ? colors.text.primary 
                                    : colors.glass.border,
                        },
                        disabled && { opacity: 0.6 },
                    ]}
                >
                    {/* Left Icon */}
                    {LeftIcon && (
                        <LeftIcon
                            size={20}
                            color={isFocused ? colors.text.primary : colors.text.muted}
                            style={styles.leftIcon}
                        />
                    )}

                    {/* Text Input */}
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            { color: colors.text.primary },
                            LeftIcon && styles.inputWithLeftIcon,
                            isPassword && styles.inputWithRightIcon,
                        ]}
                        placeholderTextColor={colors.text.muted}
                        selectionColor={colors.text.primary}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        editable={!disabled}
                        secureTextEntry={isPassword && !isPasswordVisible}
                        autoCapitalize={isPassword ? 'none' : textInputProps.autoCapitalize}
                        autoCorrect={isPassword ? false : textInputProps.autoCorrect}
                        {...textInputProps}
                    />

                    {/* Password Toggle */}
                    {isPassword && (
                        <TouchableOpacity
                            onPress={togglePasswordVisibility}
                            style={styles.passwordToggle}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {isPasswordVisible ? (
                                <EyeOff size={20} color={colors.text.muted} />
                            ) : (
                                <Eye size={20} color={colors.text.muted} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Error Message */}
                {hasError && (
                    <Text style={[styles.errorText, { color: colors.text.primary }]}>
                        {error}
                    </Text>
                )}
            </View>
        );
    },
));

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        marginBottom: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        minHeight: 56,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSize.md,
        paddingVertical: Spacing.md,
    },
    inputWithLeftIcon: {
        paddingLeft: 0,
    },
    inputWithRightIcon: {
        paddingRight: Spacing.xl,
    },
    passwordToggle: {
        position: 'absolute',
        right: Spacing.md,
        padding: Spacing.xs,
    },
    errorText: {
        fontSize: FontSize.xs,
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
});

export default GlassInput;
