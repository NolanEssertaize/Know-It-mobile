/**
 * @file AddCardModal.tsx
 * @description Modal for adding a new flashcard to a deck
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { DelayLabel } from '@/shared/api';

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (front: string, back: string, delay?: DelayLabel) => Promise<void>;
  delay?: DelayLabel;
}

function AddCardModalComponent({ visible, onClose, onAdd, delay }: AddCardModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    const trimmedFront = front.trim();
    const trimmedBack = back.trim();
    if (!trimmedFront || !trimmedBack) return;

    setIsAdding(true);
    try {
      await onAdd(trimmedFront, trimmedBack, delay);
      setFront('');
      setBack('');
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setFront('');
    setBack('');
    onClose();
  };

  const canAdd = front.trim().length > 0 && back.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.content, { backgroundColor: colors.background.primary }]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('flashcards.deck.addCard')}
          </Text>

          <Text style={[styles.label, { color: colors.text.secondary }]}>
            {t('flashcards.card.front')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text.primary,
                backgroundColor: colors.glass.background,
                borderColor: colors.glass.border,
              },
            ]}
            placeholder={t('flashcards.editor.frontPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={front}
            onChangeText={setFront}
            multiline
            autoFocus
          />

          <Text style={[styles.label, { color: colors.text.secondary }]}>
            {t('flashcards.card.back')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text.primary,
                backgroundColor: colors.glass.background,
                borderColor: colors.glass.border,
              },
            ]}
            placeholder={t('flashcards.editor.backPlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={back}
            onChangeText={setBack}
            multiline
          />

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.cancelButton, { borderColor: colors.glass.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: colors.text.secondary }]}>
                {t('common.cancel')}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.addButton,
                { backgroundColor: colors.text.primary },
                (!canAdd || isAdding) && styles.buttonDisabled,
              ]}
              onPress={handleAdd}
              disabled={!canAdd || isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                  {t('common.add')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const AddCardModal = memo(AddCardModalComponent);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  content: {
    width: '85%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },

  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    marginBottom: Spacing.md,
    minHeight: 48,
    textAlignVertical: 'top',
  },

  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },

  button: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    borderWidth: 1,
  },

  addButton: {},

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AddCardModal;
