/**
 * @file CreateDeckModal.tsx
 * @description Modal for creating a new deck
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { FlashcardsService } from '@/shared/services';

interface CreateDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateDeckModalComponent({ visible, onClose, onCreated }: CreateDeckModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsCreating(true);
    setError(null);

    try {
      await FlashcardsService.createDeck({ name: trimmed });
      setName('');
      onCreated();
      onClose();
    } catch (err) {
      console.error('[CreateDeckModal] Failed to create deck:', err);
      setError(t('flashcards.deck.createError'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    onClose();
  };

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
            {t('flashcards.deck.createTitle')}
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
            placeholder={t('flashcards.deck.namePlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={100}
          />

          {error && (
            <Text style={[styles.error, { color: '#EF4444' }]}>{error}</Text>
          )}

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
                styles.createButton,
                { backgroundColor: colors.text.primary },
                (!name.trim() || isCreating) && styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!name.trim() || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                  {t('common.create')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const CreateDeckModal = memo(CreateDeckModalComponent);

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

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },

  error: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },

  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
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

  createButton: {},

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreateDeckModal;
