/**
 * @file AddTopicModal.tsx
 * @description Modal pour ajouter un nouveau topic
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
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView } from '@/shared/components';
import { GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';
import { styles } from './AddTopicModal.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AddTopicModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const AddTopicModal = memo(function AddTopicModal({
  visible,
  value,
  onChangeText,
  onSubmit,
  onClose,
}: AddTopicModalProps) {
  const isValid = value.trim().length > 0;

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
              <Text style={styles.title}>Nouveau Sujet</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={GlassColors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Input */}
            <GlassView style={styles.inputContainer} showBorder>
              <TextInput
                style={styles.input}
                placeholder="Nom du sujet (ex: React Hooks)"
                placeholderTextColor={GlassColors.text.tertiary}
                value={value}
                onChangeText={onChangeText}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            </GlassView>

            {/* Submit Button */}
            <GlassButton
              title="Créer le sujet"
              variant="primary"
              size="lg"
              fullWidth
              onPress={onSubmit}
              disabled={!isValid}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
});
