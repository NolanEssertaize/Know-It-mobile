/**
 * GlassView Component
 * Un conteneur avec effet Glassmorphism (fond semi-transparent + bordure + arrondi)
 */

import React from 'react';
import {
    View,
    StyleSheet,
    ViewProps,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassColors, BorderRadius, Shadows } from '@/theme/theme';

export type GlassVariant = 'default' | 'light' | 'dark' | 'accent';
export type GlassIntensity = 'subtle' | 'medium' | 'strong';

interface GlassViewProps extends ViewProps {
    /** Variante de style du verre */
    variant?: GlassVariant;
    /** Intensité de l'effet de flou */
    intensity?: GlassIntensity;
    /** Activer l'effet de blur natif (plus performant sur iOS) */
    useBlur?: boolean;
    /** Taille des coins arrondis */
    borderRadius?: keyof typeof BorderRadius | number;
    /** Afficher la bordure */
    showBorder?: boolean;
    /** Style additionnel du conteneur */
    containerStyle?: StyleProp<ViewStyle>;
    /** Activer l'effet de glow */
    glow?: boolean;
    /** Couleur du glow (si activé) */
    glowColor?: string;
}

const INTENSITY_MAP = {
    subtle: 20,
    medium: 40,
    strong: 60,
};

const VARIANT_STYLES: Record<GlassVariant, ViewStyle> = {
    default: {
        backgroundColor: GlassColors.glass.background,
    },
    light: {
        backgroundColor: GlassColors.glass.backgroundLight,
    },
    dark: {
        backgroundColor: GlassColors.glass.backgroundDark,
    },
    accent: {
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
    },
};

export function GlassView({
                              children,
                              variant = 'default',
                              intensity = 'medium',
                              useBlur = false,
                              borderRadius = 'lg',
                              showBorder = true,
                              containerStyle,
                              glow = false,
                              glowColor = GlassColors.accent.glow,
                              style,
                              ...props
                          }: GlassViewProps) {
    const resolvedBorderRadius =
        typeof borderRadius === 'number'
            ? borderRadius
            : BorderRadius[borderRadius];

    const glowStyle = glow
        ? {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
        }
        : {};

    const borderStyle = showBorder
        ? {
            borderWidth: 1,
            borderColor:
                variant === 'accent'
                    ? 'rgba(0, 212, 255, 0.3)'
                    : GlassColors.glass.border,
        }
        : {};

    // Version avec BlurView natif (meilleure performance sur iOS)
    if (useBlur) {
        return (
            <View
                style={[
                    styles.outerContainer,
                    { borderRadius: resolvedBorderRadius },
                    glowStyle,
                    containerStyle,
                ]}
            >
                <BlurView
                    intensity={INTENSITY_MAP[intensity]}
                    tint="dark"
                    style={[
                        styles.blurContainer,
                        { borderRadius: resolvedBorderRadius },
                        borderStyle,
                        style,
                    ]}
                    {...props}
                >
                    <View style={[styles.innerOverlay, VARIANT_STYLES[variant]]}>
                        {children}
                    </View>
                </BlurView>
            </View>
        );
    }

    // Version sans blur (fallback avec rgba)
    return (
        <View
            style={[
                styles.container,
                VARIANT_STYLES[variant],
                { borderRadius: resolvedBorderRadius },
                borderStyle,
                Shadows.glassLight,
                glowStyle,
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS SPÉCIALISÉS
// ═══════════════════════════════════════════════════════════════════════════

/** Card avec effet verre - idéal pour les listes */
export function GlassCard({
                              children,
                              style,
                              ...props
                          }: Omit<GlassViewProps, 'borderRadius'>) {
    return (
        <GlassView
            borderRadius="lg"
            showBorder
            style={[styles.card, style]}
            {...props}
        >
            {children}
        </GlassView>
    );
}

/** Input container avec effet verre */
export function GlassInputContainer({
                                        children,
                                        focused = false,
                                        style,
                                        ...props
                                    }: GlassViewProps & { focused?: boolean }) {
    return (
        <GlassView
            variant={focused ? 'light' : 'default'}
            borderRadius="md"
            showBorder
            style={[
                styles.inputContainer,
                focused && styles.inputFocused,
                style,
            ]}
            {...props}
        >
            {children}
        </GlassView>
    );
}

/** Button container avec effet verre */
export function GlassButton({
                                children,
                                variant = 'default',
                                style,
                                ...props
                            }: GlassViewProps) {
    return (
        <GlassView
            variant={variant}
            borderRadius="md"
            showBorder
            style={[styles.button, style]}
            {...props}
        >
            {children}
        </GlassView>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        overflow: 'hidden',
    },
    blurContainer: {
        overflow: 'hidden',
    },
    innerOverlay: {
        flex: 1,
    },
    container: {
        overflow: 'hidden',
    },
    card: {
        padding: 16,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputFocused: {
        borderColor: GlassColors.glass.borderLight,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default GlassView;