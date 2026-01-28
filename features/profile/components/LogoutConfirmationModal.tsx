/**
 * @file LogoutConfirmationModal.tsx
 * @description Modal de confirmation de déconnexion
 *
 * FIXED:
 * - All colors now use useTheme() hook
 * - Buttons are visible in both light and dark modes
 * - Improved contrast for buttons
 */

import React, { memo } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface LogoutConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LogoutConfirmationModal = memo(function LogoutConfirmationModal({
                                                                                 visible,
                                                                                 onClose,
                                                                                 onConfirm,
                                                                                 isLoading,
                                                                             }: LogoutConfirmationModalProps) {
    const { colors, isDark } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <GlassView
                        variant="elevated"
                        style={[
                            styles.card,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(30, 30, 30, 0.98)'
                                    : 'rgba(255, 255, 255, 0.98)',
                            },
                        ]}
                    >
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="logout" size={48} color={colors.text.primary} />
                        </View>

                        {/* Title */}
                        <Text style={[styles.title, { color: colors.text.primary }]}>
                            Se déconnecter ?
                        </Text>

                        {/* Description */}
                        <Text style={[styles.description, { color: colors.text.secondary }]}>
                            Vous devrez vous reconnecter pour accéder à vos données.
                        </Text>

                        {/* Buttons */}
                        <View style={styles.buttonsContainer}>
                            {/* Cancel Button - Secondary/Glass style */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: colors.surface.glass,
                                        borderWidth: 1,
                                        borderColor: colors.glass.border,
                                    },
                                ]}
                                onPress={onClose}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, { color: colors.text.primary }]}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>

                            {/* Confirm Button - Primary style (high contrast) */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.text.primary },
                                ]}
                                onPress={onConfirm}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={colors.text.inverse} />
                                ) : (
                                    <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                                        Se déconnecter
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </GlassView>
                </Pressable>
            </Pressable>
        </Modal>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    content: {
        width: '100%',
        maxWidth: 340,
    },

    card: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
            },
            android: {
                elevation: 16,
            },
        }),
    },

    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },

    description: {
        fontSize: FontSize.md,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },

    buttonsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },

    button: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },

    buttonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
});

export default LogoutConfirmationModal;