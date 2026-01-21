/**
 * @file PasswordChangeModal.tsx
 * @description Modal pour le changement de mot de passe
 */

import React, { memo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';
import { styles } from './PasswordChangeModal.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => Promise<{ success: boolean; error?: string }>;
  errors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PasswordChangeModal = memo(function PasswordChangeModal({
  visible,
  onClose,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  errors,
  isLoading,
}: PasswordChangeModalProps) {
  const handleSubmit = async () => {
    const result = await onSubmit();
    // Success handling is done in the hook (closes modal)
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Changer le mot de passe</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={GlassColors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <GlassView style={styles.inputContainer} showBorder>
                <MaterialIcons name="lock-outline" size={20} color={GlassColors.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre mot de passe actuel"
                  placeholderTextColor={GlassColors.text.tertiary}
                  value={currentPassword}
                  onChangeText={onCurrentPasswordChange}
                  secureTextEntry
                  editable={!isLoading}
                />
              </GlassView>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <GlassView style={styles.inputContainer} showBorder>
                <MaterialIcons name="lock" size={20} color={GlassColors.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 caractères"
                  placeholderTextColor={GlassColors.text.tertiary}
                  value={newPassword}
                  onChangeText={onNewPasswordChange}
                  secureTextEntry
                  editable={!isLoading}
                />
              </GlassView>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <GlassView style={styles.inputContainer} showBorder>
                <MaterialIcons name="lock" size={20} color={GlassColors.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Répétez le nouveau mot de passe"
                  placeholderTextColor={GlassColors.text.tertiary}
                  value={confirmPassword}
                  onChangeText={onConfirmPasswordChange}
                  secureTextEntry
                  editable={!isLoading}
                />
              </GlassView>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Submit Button */}
            <GlassButton
              title={isLoading ? '' : 'Changer le mot de passe'}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSubmit}
              disabled={isLoading}
              leftIcon={
                isLoading ? (
                  <ActivityIndicator size="small" color={GlassColors.text.primary} />
                ) : undefined
              }
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
});
