/**
 * @file DeleteAccountModal.tsx
 * @description Modal de confirmation pour la suppression de compte avec double vérification
 *
 * Sécurité:
 * - Étape 1: Confirmation textuelle (taper "SUPPRIMER")
 * - Étape 2: Vérification du mot de passe
 */

import React, { memo, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';
import { styles } from './DeleteAccountModal.styles';

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
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIRMATION_TEXT = 'SUPPRIMER';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const DeleteAccountModal = memo(function DeleteAccountModal({
                                                                       visible,
                                                                       onClose,
                                                                       onConfirm,
                                                                       isLoading,
                                                                   }: DeleteAccountModalProps) {
    // Step 1: Text confirmation, Step 2: Password verification
    const [step, setStep] = useState<1 | 2>(1);
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isTextConfirmEnabled = confirmText.toUpperCase() === CONFIRMATION_TEXT;
    const isPasswordValid = password.length >= 1;

    const handleClose = useCallback(() => {
        setConfirmText('');
        setPassword('');
        setStep(1);
        setError(null);
        onClose();
    }, [onClose]);

    const handleNextStep = useCallback(() => {
        if (isTextConfirmEnabled) {
            setStep(2);
            setError(null);
        }
    }, [isTextConfirmEnabled]);

    const handleConfirm = useCallback(async () => {
        if (isPasswordValid) {
            setError(null);
            try {
                await onConfirm(password);
                // Reset state after successful deletion
                setConfirmText('');
                setPassword('');
                setStep(1);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Mot de passe incorrect');
            }
        }
    }, [isPasswordValid, password, onConfirm]);

    const handleBack = useCallback(() => {
        setStep(1);
        setPassword('');
        setError(null);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STEP 1: Text Confirmation
    // ─────────────────────────────────────────────────────────────────────────

    const renderStep1 = () => (
        <>
            {/* Warning Icon */}
            <View style={styles.iconContainer}>
                <MaterialIcons
                    name="warning"
                    size={48}
                    color={GlassColors.semantic.error}
                />
            </View>

            {/* Title */}
            <Text style={styles.title}>Supprimer votre compte ?</Text>

            {/* Description */}
            <Text style={styles.description}>
                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </Text>

            {/* Confirmation Input */}
            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                    Tapez <Text style={styles.confirmationWord}>SUPPRIMER</Text> pour confirmer
                </Text>
                <GlassView variant="default" style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        placeholder="SUPPRIMER"
                        placeholderTextColor={GlassColors.text.tertiary}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                </GlassView>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <GlassButton
                    title="Annuler"
                    variant="glass"
                    onPress={handleClose}
                    disabled={isLoading}
                    style={styles.cancelButton}
                />

                <GlassButton
                    title="Continuer"
                    variant="primary"
                    onPress={handleNextStep}
                    disabled={!isTextConfirmEnabled || isLoading}
                    style={[styles.confirmButton, !isTextConfirmEnabled && styles.buttonDisabled]}
                />
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STEP 2: Password Verification
    // ─────────────────────────────────────────────────────────────────────────

    const renderStep2 = () => (
        <>
            {/* Lock Icon */}
            <View style={styles.iconContainerDanger}>
                <MaterialIcons
                    name="lock"
                    size={48}
                    color={GlassColors.semantic.error}
                />
            </View>

            {/* Title */}
            <Text style={styles.title}>Vérification de sécurité</Text>

            {/* Description */}
            <Text style={styles.description}>
                Pour des raisons de sécurité, veuillez entrer votre mot de passe pour confirmer la suppression.
            </Text>

            {/* Password Input */}
            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <GlassView variant="default" style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Votre mot de passe"
                        placeholderTextColor={GlassColors.text.tertiary}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Pressable
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons
                            name={showPassword ? "visibility-off" : "visibility"}
                            size={24}
                            color={GlassColors.text.secondary}
                        />
                    </Pressable>
                </GlassView>

                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <GlassButton
                    title="Retour"
                    variant="glass"
                    onPress={handleBack}
                    disabled={isLoading}
                    style={styles.cancelButton}
                />

                <GlassButton
                    title={isLoading ? "Suppression..." : "Supprimer"}
                    variant="primary"
                    onPress={handleConfirm}
                    disabled={!isPasswordValid || isLoading}
                    loading={isLoading}
                    style={[styles.deleteButton, !isPasswordValid && styles.buttonDisabled]}
                />
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <GlassView variant="default" style={styles.card}>
                        {/* Step Indicator */}
                        <View style={styles.stepIndicator}>
                            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                            <View style={styles.stepLine} />
                            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                        </View>

                        {step === 1 ? renderStep1() : renderStep2()}
                    </GlassView>
                </Pressable>
            </Pressable>
        </Modal>
    );
});