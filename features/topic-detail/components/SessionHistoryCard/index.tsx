/**
 * @file SessionHistoryCard/index.tsx
 * @description Session history card for topic detail page
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import type { SessionItemData } from '@/types';

interface SessionHistoryCardProps {
  data: SessionItemData;
  onPress: () => void;
  onDelete: () => void;
}

export const SessionHistoryCard = memo(function SessionHistoryCard({
  data,
  onPress,
  onDelete,
}: SessionHistoryCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { session, formattedDate } = data;

  // Calculate score percentage for visual indicator
  const totalPoints =
    (session.analysis?.valid?.length || 0) +
    (session.analysis?.corrections?.length || 0) +
    (session.analysis?.missing?.length || 0);
  
  const validPoints = session.analysis?.valid?.length || 0;
  const scorePercent = totalPoints > 0 ? Math.round((validPoints / totalPoints) * 100) : 0;

  // Get feedback color based on score
  const getScoreColor = () => {
    if (scorePercent >= 80) return colors.status.success;
    if (scorePercent >= 60) return colors.status.warning;
    return colors.status.error;
  };

  // Get feedback label
  const getFeedbackLabel = () => {
    if (scorePercent >= 80) return t('result.feedback.excellent');
    if (scorePercent >= 60) return t('result.feedback.good');
    return t('result.feedback.needsWork');
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassView style={styles.container} padding="md" radius="lg">
        <View style={styles.header}>
          {/* Score Badge */}
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor() + '20' }]}>
            <Text style={[styles.scoreText, { color: getScoreColor() }]}>
              {scorePercent}%
            </Text>
          </View>

          {/* Date & Feedback */}
          <View style={styles.headerInfo}>
            <Text style={[styles.date, { color: colors.text.primary }]}>
              {formattedDate}
            </Text>
            <Text style={[styles.feedback, { color: getScoreColor() }]}>
              {getFeedbackLabel()}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.status.error + '20' }]}
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="delete" size={18} color={colors.status.error} />
            </TouchableOpacity>
            <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
          </View>
        </View>

        {/* Analysis Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <MaterialIcons name="check-circle" size={16} color={colors.status.success} />
            <Text style={[styles.summaryText, { color: colors.text.secondary }]}>
              {validPoints} {t('result.analysis.valid')}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <MaterialIcons name="edit" size={16} color={colors.status.warning} />
            <Text style={[styles.summaryText, { color: colors.text.secondary }]}>
              {session.analysis?.corrections?.length || 0} {t('result.analysis.corrections')}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <MaterialIcons name="help-outline" size={16} color={colors.status.error} />
            <Text style={[styles.summaryText, { color: colors.text.secondary }]}>
              {session.analysis?.missing?.length || 0} {t('result.analysis.missing')}
            </Text>
          </View>
        </View>

        {/* Preview of first valid point */}
        {session.analysis?.valid?.[0] && (
          <View style={[styles.preview, { backgroundColor: colors.surface.glass }]}>
            <Text
              style={[styles.previewText, { color: colors.text.muted }]}
              numberOfLines={2}
            >
              "{session.analysis.valid[0]}"
            </Text>
          </View>
        )}
      </GlassView>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  scoreText: {
    ...Typography.body.medium,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  date: {
    ...Typography.body.medium,
    fontWeight: '600',
    marginBottom: Spacing.xxs,
  },
  feedback: {
    ...Typography.body.small,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryText: {
    ...Typography.body.small,
  },
  preview: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  previewText: {
    ...Typography.body.small,
    fontStyle: 'italic',
  },
});
