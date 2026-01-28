/**
 * @file DeleteAccountModal.tsx
 * @description Modal de suppression de compte avec vérification en deux étapes
 *
 * FIXED:
 * - All colors now use useTheme() hook
 * - Buttons are visible in both light and dark modes
 * - Improved contrast for buttons
 */

import React, { memo, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    TextInput,
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

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const DeleteAccountModal = memo(function DeleteAccountModal({
                                                                       visible,
                                                                       onClose,
                                                                       onConfirm,
                                                                       isLoading,
                                                                   }: DeleteAccountModalProps) {
    const { colors, isDark } = useTheme();
    const [step, setStep] = useState<1 | 2>(1);
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isTextConfirmEnabled = confirmText.toUpperCase() === 'SUPPRIMER';
    const isPasswordValid = password.length >= 6;

    const handleClose = useCallback(() => {
        setStep(1);
        setConfirmText('');
        setPassword('');
        setError(null);
        onClose();
    }, [onClose]);

    const handleNextStep = useCallback(() => {
        if (isTextConfirmEnabled) {
            setStep(2);
        }
    }, [isTextConfirmEnabled]);

    const handleBack = useCallback(() => {
        setStep(1);
        setPassword('');
        setError(null);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!isPasswordValid) return;

        try {
            setError(null);
            await onConfirm(password);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    }, [password, isPasswordValid, onConfirm, handleClose]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STEP 1: Text Confirmation
    // ─────────────────────────────────────────────────────────────────────────

    const renderStep1 = () => (
        <>
            {/* Warning Icon */}
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <MaterialIcons name="warning" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Supprimer votre compte ?
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.text.secondary }]}>
                Cette action est irréversible.{'\n'}
                Toutes vos données seront définitivement supprimées.
            </Text>

            {/* Confirmation Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                    Tapez <Text style={styles.confirmationWord}>SUPPRIMER</Text> pour confirmer
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: colors.surface.input,
                            borderWidth: 1,
                            borderColor: colors.glass.border,
                        },
                    ]}
                >
                    <TextInput
                        style={[styles.input, { color: colors.text.primary }]}
                        placeholder="SUPPRIMER"
                        placeholderTextColor={colors.text.muted}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                </View>
            </View>

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
                    onPress={handleClose}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, { color: colors.text.primary }]}>
                        Annuler
                    </Text>
                </TouchableOpacity>

                {/* Continue Button - Primary style (visible in both themes) */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: isTextConfirmEnabled
                                ? colors.text.primary
                                : colors.surface.disabled,
                        },
                        !isTextConfirmEnabled && styles.buttonDisabled,
                    ]}
                    onPress={handleNextStep}
                    disabled={!isTextConfirmEnabled || isLoading}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            {
                                color: isTextConfirmEnabled
                                    ? colors.text.inverse
                                    : colors.text.muted,
                            },
                        ]}
                    >
                        Continuer
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STEP 2: Password Confirmation
    // ─────────────────────────────────────────────────────────────────────────

    const renderStep2 = () => (
        <>
            {/* Lock Icon */}
            <View style={[styles.iconContainer, { backgroundColor: colors.surface.glass }]}>
                <MaterialIcons name="lock" size={48} color={colors.text.primary} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Confirmer avec votre mot de passe
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.text.secondary }]}>
                Pour des raisons de sécurité, veuillez entrer votre mot de passe pour confirmer la suppression.
            </Text>

            {/* Password Input */}
            <View style={styles.inputSection}>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: colors.surface.input,
                            borderWidth: 1,
                            borderColor: error ? '#EF4444' : colors.glass.border,
                        },
                    ]}
                >
                    <TextInput
                        style={[styles.input, styles.passwordInput, { color: colors.text.primary }]}
                        placeholder="Mot de passe"
                        placeholderTextColor={colors.text.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Pressable
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons
                            name={showPassword ? 'visibility-off' : 'visibility'}
                            size={24}
                            color={colors.text.muted}
                        />
                    </Pressable>
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                {/* Back Button - Secondary/Glass style */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.surface.glass,
                            borderWidth: 1,
                            borderColor: colors.glass.border,
                        },
                    ]}
                    onPress={handleBack}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, { color: colors.text.primary }]}>
                        Retour
                    </Text>
                </TouchableOpacity>

                {/* Delete Button - Danger style (always red for visibility) */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: isPasswordValid ? '#EF4444' : colors.surface.disabled,
                        },
                        !isPasswordValid && styles.buttonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!isPasswordValid || isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text
                            style={[
                                styles.buttonText,
                                {
                                    color: isPasswordValid ? '#FFFFFF' : colors.text.muted,
                                },
                            ]}
                        >
                            Supprimer
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
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
                        {step === 1 ? renderStep1() : renderStep2()}
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

    inputSection: {
        width: '100%',
        marginBottom: Spacing.lg,
    },

    inputLabel: {
        fontSize: FontSize.sm,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    confirmationWord: {
        fontWeight: FontWeight.bold,
        color: '#EF4444',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
    },

    input: {
        flex: 1,
        fontSize: FontSize.md,
        paddingVertical: Spacing.md,
        textAlign: 'center',
    },

    passwordInput: {
        textAlign: 'left',
    },

    eyeButton: {
        padding: Spacing.xs,
    },

    errorText: {
        fontSize: FontSize.sm,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: Spacing.sm,
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

    buttonDisabled: {
        opacity: 0.5,
    },
});

export default DeleteAccountModal;