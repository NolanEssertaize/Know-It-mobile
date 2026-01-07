/**
 * GlassInput Component
 * Champ de saisie avec effet Glassmorphism
 */

import React, { useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    Animated,
} from 'react-native';
import { GlassColors, BorderRadius, Shadows } from '@/theme/theme';

interface GlassInputProps extends TextInputProps {
    /** Label du champ */
    label?: string;
    /** Message d'erreur */
    error?: string;
    /** Icône à gauche */
    leftIcon?: React.ReactNode;
    /** Icône à droite */
    rightIcon?: React.ReactNode;
    /** Style du conteneur */
    containerStyle?: ViewStyle;
}

export function GlassInput({
                               label,
                               error,
                               leftIcon,
                               rightIcon,
                               containerStyle,
                               style,
                               onFocus,
                               onBlur,
                               ...props
                           }: GlassInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [borderColor] = useState(new Animated.Value(0));

    const handleFocus = (e: any) => {
        setIsFocused(true);
        Animated.timing(borderColor, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        Animated.timing(borderColor, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        onBlur?.(e);
    };

    const animatedBorderColor = borderColor.interpolate({
        inputRange: [0, 1],
        outputRange: [GlassColors.glass.border, GlassColors.accent.primary],
    });

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <Animated.View
                style={[
                    styles.container,
                    Shadows.glassLight,
                    { borderColor: error ? GlassColors.semantic.error : animatedBorderColor },
                    isFocused && styles.containerFocused,
                    error && styles.containerError,
                ]}
            >
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        leftIcon && styles.inputWithLeftIcon,
                        rightIcon && styles.inputWithRightIcon,
                        style,
                    ]}
                    placeholderTextColor={GlassColors.text.tertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </Animated.View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

/** Barre de recherche avec effet verre */
export function GlassSearchBar({
                                   placeholder = 'Rechercher...',
                                   ...props
                               }: GlassInputProps) {
    return (
        <GlassInput
            placeholder={placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        color: GlassColors.text.secondary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GlassColors.glass.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        paddingHorizontal: 16,
        minHeight: 52,
    },
    containerFocused: {
        backgroundColor: GlassColors.glass.backgroundLight,
    },
    containerError: {
        borderColor: GlassColors.semantic.error,
    },
    input: {
        flex: 1,
        color: GlassColors.text.primary,
        fontSize: 16,
        paddingVertical: 14,
    },
    inputWithLeftIcon: {
        paddingLeft: 8,
    },
    inputWithRightIcon: {
        paddingRight: 8,
    },
    iconLeft: {
        marginRight: 4,
    },
    iconRight: {
        marginLeft: 4,
    },
    errorText: {
        color: GlassColors.semantic.error,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
});

export default GlassInput;