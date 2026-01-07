/**
 * GlassButton Component
 * Bouton avec effet Glassmorphism et animations
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassColors, BorderRadius, Shadows } from '@/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassButtonProps {
    /** Texte du bouton */
    title: string;
    /** Action au clic */
    onPress: () => void;
    /** Variante de style */
    variant?: ButtonVariant;
    /** Taille du bouton */
    size?: ButtonSize;
    /** Désactiver le bouton */
    disabled?: boolean;
    /** Afficher un loader */
    loading?: boolean;
    /** Icône à gauche */
    leftIcon?: React.ReactNode;
    /** Icône à droite */
    rightIcon?: React.ReactNode;
    /** Largeur complète */
    fullWidth?: boolean;
    /** Style additionnel du conteneur */
    style?: ViewStyle;
    /** Style additionnel du texte */
    textStyle?: TextStyle;
}

const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
        container: { paddingHorizontal: 12, paddingVertical: 8 },
        text: { fontSize: 14 },
    },
    md: {
        container: { paddingHorizontal: 20, paddingVertical: 14 },
        text: { fontSize: 16 },
    },
    lg: {
        container: { paddingHorizontal: 28, paddingVertical: 18 },
        text: { fontSize: 18 },
    },
    xl: {
        container: { paddingHorizontal: 36, paddingVertical: 22 },
        text: { fontSize: 20 },
    },
};

export function GlassButton({
                                title,
                                onPress,
                                variant = 'primary',
                                size = 'md',
                                disabled = false,
                                loading = false,
                                leftIcon,
                                rightIcon,
                                fullWidth = false,
                                style,
                                textStyle,
                            }: GlassButtonProps) {
    const isDisabled = disabled || loading;

    const renderContent = () => (
        <View style={styles.contentContainer}>
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost'
                        ? GlassColors.accent.primary
                        : GlassColors.text.primary}
                />
            ) : (
                <>
                    {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                    <Text
                        style={[
                            styles.text,
                            SIZE_STYLES[size].text,
                            variant === 'outline' && styles.textOutline,
                            variant === 'ghost' && styles.textGhost,
                            variant === 'glass' && styles.textGlass,
                            isDisabled && styles.textDisabled,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                </>
            )}
        </View>
    );

    // Primary Button avec gradient
    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[fullWidth && styles.fullWidth, style]}
            >
                <LinearGradient
                    colors={
                        isDisabled
                            ? ['#374151', '#1F2937']
                            : [GlassColors.accent.primary, GlassColors.accent.secondary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.container,
                        SIZE_STYLES[size].container,
                        !isDisabled && Shadows.glow(GlassColors.accent.primary),
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Secondary Button avec gradient violet
    if (variant === 'secondary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[fullWidth && styles.fullWidth, style]}
            >
                <LinearGradient
                    colors={
                        isDisabled
                            ? ['#374151', '#1F2937']
                            : [GlassColors.accent.tertiary, '#4F46E5']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.container,
                        SIZE_STYLES[size].container,
                        !isDisabled && Shadows.glow(GlassColors.accent.tertiary),
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Glass Button
    if (variant === 'glass') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.7}
                style={[
                    styles.container,
                    styles.glassButton,
                    SIZE_STYLES[size].container,
                    Shadows.glassLight,
                    isDisabled && styles.disabledGlass,
                    fullWidth && styles.fullWidth,
                    style,
                ]}
            >
                {renderContent()}
            </TouchableOpacity>
        );
    }

    // Outline Button
    if (variant === 'outline') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.7}
                style={[
                    styles.container,
                    styles.outlineButton,
                    SIZE_STYLES[size].container,
                    isDisabled && styles.disabledOutline,
                    fullWidth && styles.fullWidth,
                    style,
                ]}
            >
                {renderContent()}
            </TouchableOpacity>
        );
    }

    // Ghost Button
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.6}
            style={[
                styles.container,
                styles.ghostButton,
                SIZE_STYLES[size].container,
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOUTONS SPÉCIALISÉS
// ═══════════════════════════════════════════════════════════════════════════

/** Bouton d'ajout circulaire */
export function GlassAddButton({
                                   onPress,
                                   size = 56,
                                   style,
                               }: {
    onPress: () => void;
    size?: number;
    style?: ViewStyle;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
            <LinearGradient
                colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.addButton,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                    Shadows.glow(GlassColors.accent.primary),
                ]}
            >
                <Text style={[styles.addButtonText, { fontSize: size * 0.5 }]}>+</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

/** Bouton d'enregistrement (grand cercle) */
export function RecordButton({
                                 isRecording,
                                 onPress,
                                 size = 150,
                                 style,
                             }: {
    isRecording: boolean;
    onPress: () => void;
    size?: number;
    style?: ViewStyle;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
            <LinearGradient
                colors={
                    isRecording
                        ? [GlassColors.semantic.error, '#DC2626']
                        : [GlassColors.accent.primary, GlassColors.accent.secondary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.recordButton,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                    Shadows.glow(
                        isRecording
                            ? GlassColors.semantic.error
                            : GlassColors.accent.primary
                    ),
                ]}
            >
                <Text style={styles.recordButtonText}>
                    {isRecording ? 'STOP' : 'PARLER'}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: GlassColors.text.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    textOutline: {
        color: GlassColors.accent.primary,
    },
    textGhost: {
        color: GlassColors.accent.primary,
    },
    textGlass: {
        color: GlassColors.text.primary,
    },
    textDisabled: {
        color: GlassColors.text.tertiary,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    fullWidth: {
        width: '100%',
    },
    // Glass variant
    glassButton: {
        backgroundColor: GlassColors.glass.backgroundLight,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
    },
    disabledGlass: {
        backgroundColor: GlassColors.surface.disabled,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    // Outline variant
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: GlassColors.accent.primary,
    },
    disabledOutline: {
        borderColor: GlassColors.text.tertiary,
    },
    // Ghost variant
    ghostButton: {
        backgroundColor: 'transparent',
    },
    // Add button
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: GlassColors.text.primary,
        fontWeight: 'bold',
    },
    // Record button
    recordButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordButtonText: {
        color: GlassColors.text.primary,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default GlassButton;