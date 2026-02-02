/**
 * @file TopicCard/index.tsx
 * @description Topic card component for list display
 */

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import type { TopicItemData } from '@/types';
import type { SwipeableMethods } from '../hooks/useTopicsList';

interface TopicCardProps {
  data: TopicItemData;
  onPress: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  registerRef: (ref: SwipeableMethods) => void;
  unregisterRef: () => void;
}

export const TopicCard = memo(function TopicCard({
  data,
  onPress,
  onEdit,
  onShare,
  onDelete,
  registerRef,
  unregisterRef,
}: TopicCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { topic, sessionCount, formattedLastSession } = data;

  // Register a mock swipeable ref for now (can be enhanced with actual swipe gestures)
  const refMethods: SwipeableMethods = {
    close: () => {},
  };

  useEffect(() => {
    registerRef(refMethods);
    return () => unregisterRef();
  }, [registerRef, unregisterRef]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassView style={styles.container} padding="md" radius="lg">
        <View style={styles.content}>
          {/* Topic Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.accent.primary + '20' }]}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color={colors.accent.primary}
            />
          </View>

          {/* Topic Info */}
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
              {topic.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialIcons name="history" size={14} color={colors.text.muted} />
                <Text style={[styles.metaText, { color: colors.text.muted }]}>
                  {sessionCount} {sessionCount === 1 ? t('topics.card.session') : t('topics.card.sessions')}
                </Text>
              </View>
              {formattedLastSession ? (
                <View style={styles.metaItem}>
                  <MaterialIcons name="schedule" size={14} color={colors.text.muted} />
                  <Text style={[styles.metaText, { color: colors.text.muted }]}>
                    {formattedLastSession}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.metaText, { color: colors.text.muted }]}>
                  {t('topics.card.noSessions')}
                </Text>
              )}
            </View>
          </View>

          {/* Arrow */}
          <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface.glass }]}
            onPress={onEdit}
          >
            <MaterialIcons name="edit" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface.glass }]}
            onPress={onShare}
          >
            <MaterialIcons name="share" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.status.error + '20' }]}
            onPress={onDelete}
          >
            <MaterialIcons name="delete" size={16} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </GlassView>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.body.large,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.body.small,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
