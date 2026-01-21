/**
 * @file DeleteAccountModal.tsx
 * @description Modal de confirmation pour la suppression de compte
 */

import React, { memo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
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
  onConfirm: () => Promise<void>;
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
  const [confirmText, setConfirmText] = useState('');
  
  const isConfirmEnabled = confirmText.toUpperCase() === CONFIRMATION_TEXT;

  const handleClose = useCallback(() => {
    setConfirmText('');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    if (isConfirmEnabled) {
      await onConfirm();
      setConfirmText('');
    }
  }, [isConfirmEnabled, onConfirm]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
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
            Cette action est irréversible. Toutes vos données seront 
            définitivement supprimées, y compris :
          </Text>

          {/* List of data */}
          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <MaterialIcons name="folder" size={16} color={GlassColors.text.secondary} />
              <Text style={styles.dataItemText}>Tous vos sujets et sessions</Text>
            </View>
            <View style={styles.dataItem}>
              <MaterialIcons name="analytics" size={16} color={GlassColors.text.secondary} />
              <Text style={styles.dataItemText}>Votre historique d'analyses</Text>
            </View>
            <View style={styles.dataItem}>
              <MaterialIcons name="settings" size={16} color={GlassColors.text.secondary} />
              <Text style={styles.dataItemText}>Vos préférences et paramètres</Text>
            </View>
          </View>

          {/* Confirmation Input */}
          <View style={styles.confirmSection}>
            <Text style={styles.confirmLabel}>
              Tapez <Text style={styles.confirmHighlight}>{CONFIRMATION_TEXT}</Text> pour confirmer
            </Text>
            <GlassView style={styles.inputContainer} showBorder>
              <TextInput
                style={styles.input}
                placeholder={CONFIRMATION_TEXT}
                placeholderTextColor={GlassColors.text.tertiary}
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
                editable={!isLoading}
              />
            </GlassView>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <GlassButton
              title="Annuler"
              variant="glass"
              onPress={handleClose}
              disabled={isLoading}
              style={styles.cancelButton}
            />
            <Pressable
              style={[
                styles.deleteButton,
                !isConfirmEnabled && styles.deleteButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!isConfirmEnabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={GlassColors.text.primary} />
              ) : (
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
