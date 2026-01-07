/**
 * @file TopicDetailScreen.tsx
 * @description Écran de détail d'un topic (Vue Dumb)
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';

import { useTopicDetail, type SessionItemData } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';
import { styles } from './TopicDetailScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicDetailScreen = memo(function TopicDetailScreen() {
  // Setup Hook - Logic Controller
  const logic = useTopicDetail();

  // ─────────────────────────────────────────────────────────────────────────
  // GUARD: Topic not found
  // ─────────────────────────────────────────────────────────────────────────

  if (!logic.topic) {
    return (
      <ScreenWrapper centered>
        <Text style={styles.errorText}>Topic introuvable</Text>
      </ScreenWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <GlassView
          variant="accent"
          glow
          glowColor={GlassColors.accent.glow}
          style={styles.topicBanner}
        >
          <Text style={styles.topicTitle}>{logic.topic?.title}</Text>
          <Text style={styles.topicStats}>
            {logic.sessions.length} session
            {logic.sessions.length !== 1 ? 's' : ''} enregistrée
            {logic.sessions.length !== 1 ? 's' : ''}
          </Text>
        </GlassView>

        <GlassButton
          title="🎙️  Démarrer une session"
          variant="primary"
          size="lg"
          fullWidth
          onPress={logic.handleStartSession}
          style={styles.startButton}
        />

        {logic.sessions.length > 0 && (
          <Text style={styles.sectionTitle}>Historique</Text>
        )}
      </View>
    ),
    [logic]
  );

  const renderSession = useCallback(
    ({ item }: { item: SessionItemData }) => <SessionHistoryCard data={item} />,
    []
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎤</Text>
        <Text style={styles.emptyTitle}>Aucune session</Text>
        <Text style={styles.emptySubtitle}>
          Démarrez votre première session pour commencer à réviser ce sujet
        </Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: SessionItemData) => item.session.id,
    []
  );

  const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper useSafeArea={false} padding={0}>
      <FlatList
        data={logic.sessions}
        keyExtractor={keyExtractor}
        renderItem={renderSession}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
});
