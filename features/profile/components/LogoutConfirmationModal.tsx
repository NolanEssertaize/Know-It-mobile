/**
 * @file LogoutConfirmationModal.tsx
 * @description Modal de confirmation pour la déconnexion avec style iOS Glassmorphism
 */

import React, { memo } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';
import { styles } from './LogoutConfirmationModal.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface LogoutConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
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
    return (
        <Modal
            visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    >
    <Pressable style={styles.overlay} onPress={onClose}>
    <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
    <GlassView variant="default" style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
    <MaterialIcons
        name="logout"
    size={48}
    color={GlassColors.accent.primary}
    />
    </View>

    {/* Title */}
    <Text style={styles.title}>Se déconnecter ?</Text>

        {/* Description */}
        <Text style={styles.description}>
        Vous êtes sur le point de vous déconnecter de votre compte.
        Vous pourrez vous reconnecter à tout moment.
    </Text>

    {/* Buttons */}
    <View style={styles.buttonsContainer}>
    <GlassButton
        title="Annuler"
    variant="glass"
    onPress={onClose}
    disabled={isLoading}
    style={styles.cancelButton}
    />

    <GlassButton
    title={isLoading ? "Déconnexion..." : "Se déconnecter"}
    variant="primary"
    onPress={onConfirm}
    disabled={isLoading}
    loading={isLoading}
    style={styles.confirmButton}
    />
    </View>
    </GlassView>
    </Pressable>
    </Pressable>
    </Modal>
);
});