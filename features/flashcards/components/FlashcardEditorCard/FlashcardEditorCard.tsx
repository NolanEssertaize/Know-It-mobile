/**
 * @file FlashcardEditorCard.tsx
 * @description Editable flashcard component with front/back inputs
 */

import React, { memo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { EditableFlashcard } from '../../types';

interface FlashcardEditorCardProps {
  card: EditableFlashcard;
  index: number;
  onUpdateFront: (value: string) => void;
  onUpdateBack: (value: string) => void;
  onDelete: () => void;
}

function FlashcardEditorCardComponent({
  card,
  index,
  onUpdateFront,
  onUpdateBack,
  onDelete,
}: FlashcardEditorCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <GlassView variant="default" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.cardNumber, { color: colors.text.secondary }]}>
          {t('flashcards.editor.card')} {index + 1}
        </Text>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.glass.background }]}
          onPress={onDelete}
          hitSlop={8}
        >
          <MaterialIcons name="close" size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* Front (Question) */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
          {t('flashcards.editor.front')}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text.primary,
              backgroundColor: colors.glass.background,
              borderColor: colors.glass.borderDivider,
            },
          ]}
          value={card.front}
          onChangeText={onUpdateFront}
          placeholder={t('flashcards.editor.frontPlaceholder')}
          placeholderTextColor={colors.text.muted}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Back (Answer) */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
          {t('flashcards.editor.back')}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text.primary,
              backgroundColor: colors.glass.background,
              borderColor: colors.glass.borderDivider,
            },
          ]}
          value={card.back}
          onChangeText={onUpdateBack}
          placeholder={t('flashcards.editor.backPlaceholder')}
          placeholderTextColor={colors.text.muted}
          multiline
          textAlignVertical="top"
        />
      </View>
    </GlassView>
  );
}

export const FlashcardEditorCard = memo(FlashcardEditorCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldContainer: {
    marginBottom: Spacing.md,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  textInput: {
    minHeight: 80,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default FlashcardEditorCard;
