/**
 * @file FlashcardItem.tsx
 * @description Individual flashcard display with edit/delete actions
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { GlassView } from '@/shared/components';
import type { FlashcardWithReview, DelayLabel } from '@/shared/api';

const DELAY_OPTIONS: { label: string; value: DelayLabel }[] = [
  { label: 'Now', value: 'now' },
  { label: '1D', value: '1_day' },
  { label: '1W', value: '1_week' },
  { label: '1M', value: '1_month' },
  { label: '3M', value: '3_months' },
  { label: '6M', value: '6_months' },
  { label: '1Y', value: '12_months' },
  { label: '18M', value: '18_months' },
  { label: '2Y', value: '24_months' },
  { label: '3Y', value: '36_months' },
];

interface FlashcardItemProps {
  card: FlashcardWithReview;
  onUpdate: (id: string, front: string, back: string, delay?: DelayLabel) => void;
  onDelete: (id: string) => void;
}

function FlashcardItemComponent({ card, onUpdate, onDelete }: FlashcardItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(card.front_content);
  const [back, setBack] = useState(card.back_content);
  const [selectedDelay, setSelectedDelay] = useState<DelayLabel | undefined>(undefined);

  const handleSave = () => {
    const trimmedFront = front.trim();
    const trimmedBack = back.trim();
    if (!trimmedFront || !trimmedBack) return;

    onUpdate(card.id, trimmedFront, trimmedBack, selectedDelay);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFront(card.front_content);
    setBack(card.back_content);
    setSelectedDelay(undefined);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('flashcards.card.confirmDelete'),
      undefined,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(card.id) },
      ],
    );
  };

  if (isEditing) {
    return (
      <GlassView variant="default" style={styles.card}>
        <View style={styles.editContainer}>
          <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
            {t('flashcards.card.front')}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text.primary, backgroundColor: colors.glass.background, borderColor: colors.glass.border }]}
            value={front}
            onChangeText={setFront}
            multiline
          />

          <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
            {t('flashcards.card.back')}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text.primary, backgroundColor: colors.glass.background, borderColor: colors.glass.border }]}
            value={back}
            onChangeText={setBack}
            multiline
          />

          <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
            {t('flashcards.card.delay', { defaultValue: 'RESCHEDULE' })}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.delayRow}>
            {DELAY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.delayPill,
                  { borderColor: colors.glass.border },
                  selectedDelay === opt.value && { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
                ]}
                onPress={() => setSelectedDelay(selectedDelay === opt.value ? undefined : opt.value)}
              >
                <Text
                  style={[
                    styles.delayPillText,
                    { color: colors.text.secondary },
                    selectedDelay === opt.value && { color: colors.text.inverse },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.editActions}>
            <Pressable style={[styles.editButton, { borderColor: colors.glass.border }]} onPress={handleCancel}>
              <Text style={[styles.editButtonText, { color: colors.text.secondary }]}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.editButton, { backgroundColor: colors.text.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.editButtonText, { color: colors.text.inverse }]}>{t('common.save')}</Text>
            </Pressable>
          </View>
        </View>
      </GlassView>
    );
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

  let reviewDate: string | null = null;
  if (card.next_review_at) {
    reviewDate = formatDate(new Date(card.next_review_at));
  } else if (card.interval_days > 0) {
    const d = new Date();
    d.setDate(d.getDate() + card.interval_days);
    reviewDate = formatDate(d);
  }

  return (
    <GlassView variant="default" style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={[styles.frontText, { color: colors.text.primary }]} numberOfLines={2}>
            {card.front_content}
          </Text>
          <Text style={[styles.backText, { color: colors.text.secondary }]} numberOfLines={2}>
            {card.back_content}
          </Text>
        </View>
        <View style={styles.cardActions}>
          {reviewDate && (
            <Text style={[styles.reviewDate, { color: colors.text.muted }]}>
              {reviewDate}
            </Text>
          )}
          <Pressable onPress={() => setIsEditing(true)} hitSlop={8}>
            <MaterialIcons name="edit" size={18} color={colors.text.muted} />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8}>
            <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </GlassView>
  );
}

export const FlashcardItem = memo(FlashcardItemComponent);

const styles = StyleSheet.create({
  card: {
    marginLeft: Spacing.xl + Spacing.md,
    marginBottom: Spacing.sm,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },

  cardText: {
    flex: 1,
  },

  frontText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  backText: {
    fontSize: 13,
  },

  cardActions: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.sm,
  },

  reviewDate: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Edit mode
  editContainer: {
    padding: Spacing.md,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },

  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.md,
    minHeight: 40,
  },

  delayRow: {
    marginBottom: Spacing.md,
    flexGrow: 0,
  },

  delayPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },

  delayPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  editActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'flex-end',
  },

  editButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FlashcardItem;
