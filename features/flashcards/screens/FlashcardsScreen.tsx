/**
 * @file FlashcardsScreen.tsx
 * @description Flashcards management screen showing decks with due counts
 * Access via settings/manage button from the main flashcard review screen
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { ScreenWrapper, GlassView } from '@/shared/components';
import { useFlashcards } from '../hooks/useFlashcards';
import { TimelineModal } from '../components/TimelineModal';
import { CreateDeckModal } from '../components/CreateDeckModal/CreateDeckModal';
import type { DeckWithStats } from '@/shared/api';

// ═══════════════════════════════════════════════════════════════════════════
// DECK CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DeckCardProps {
  deck: DeckWithStats;
  onPress: () => void;
  onStartReview: () => void;
}

// Badge colors (explicit colors for visual feedback)
const BADGE_COLORS = {
  due: '#F97316',      // Orange for due cards
  complete: '#22C55E', // Green for completed
};

const DeckCard = memo(function DeckCard({ deck, onPress, onStartReview }: DeckCardProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const hasDueCards = deck.due_count > 0;

  return (
    <GlassView variant="default" style={styles.deckCard}>
      <Pressable
        style={styles.deckCardContent}
        onPress={onPress}
      >
        {/* Deck Icon */}
        <View style={[styles.deckIcon, { backgroundColor: isDark ? 'transparent' : colors.glass.background }]}>
          <MaterialCommunityIcons
            name="cards-outline"
            size={24}
            color={colors.text.primary}
          />
        </View>

        {/* Deck Info */}
        <View style={styles.deckInfo}>
          <Text style={[styles.deckName, { color: colors.text.primary }]} numberOfLines={1}>
            {deck.name}
          </Text>
          <Text style={[styles.deckStats, { color: colors.text.secondary }]}>
            {deck.card_count} {t('flashcards.cards')}
          </Text>
        </View>

        {/* Due Badge & Review Button */}
        <View style={styles.deckActions}>
          {hasDueCards ? (
            <>
              <View style={[styles.dueBadge, { backgroundColor: BADGE_COLORS.due }]}>
                <Text style={styles.dueBadgeText}>{deck.due_count}</Text>
              </View>
              <Pressable
                style={[styles.reviewButton, { backgroundColor: colors.text.primary }]}
                onPress={onStartReview}
              >
                <MaterialIcons name="play-arrow" size={20} color={colors.text.inverse} />
              </Pressable>
            </>
          ) : (
            <View style={[styles.completeBadge, { backgroundColor: BADGE_COLORS.complete }]}>
              <MaterialIcons name="check" size={16} color="#fff" />
            </View>
          )}
        </View>
      </Pressable>
    </GlassView>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FlashcardsManageScreen = memo(function FlashcardsManageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [showTimeline, setShowTimeline] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const {
    decks,
    isLoading,
    isRefreshing,
    error,
    totalDue,
    refresh,
    handleDeckPress,
    handleStartReview,
  } = useFlashcards();

  const handleBack = () => {
    router.back();
  };

  const handleCreateFlashcard = () => {
    setShowCreateDeck(true);
  };

  const renderDeckItem = ({ item }: { item: DeckWithStats }) => (
    <DeckCard
      deck={item}
      onPress={() => handleDeckPress(item.id)}
      onStartReview={() => handleStartReview(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.glass.background }]}>
        <MaterialCommunityIcons
          name="cards-outline"
          size={48}
          color={colors.text.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        {t('flashcards.empty.title')}
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
        {t('flashcards.empty.description')}
      </Text>
    </View>
  );

  const renderHeader = () => (
    totalDue > 0 ? (
      <Pressable onPress={() => setShowTimeline(true)}>
        <GlassView variant="default" style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
                {t('flashcards.dueToday')}
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.text.secondary }]}>
                {t('flashcards.readyToReview', { count: totalDue })}
              </Text>
            </View>
            <View style={styles.summaryRight}>
              <View style={[styles.totalDueBadge, { backgroundColor: BADGE_COLORS.due }]}>
                <Text style={styles.totalDueText}>{totalDue}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.text.muted}
              />
            </View>
          </View>
        </GlassView>
      </Pressable>
    ) : null
  );

  return (
    <ScreenWrapper scrollable={false} padding={0}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.glass.background },
            pressed && styles.headerButtonPressed,
          ]}
          onPress={handleBack}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {t('flashcards.manage.title')}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.glass.background },
            pressed && styles.headerButtonPressed,
          ]}
          onPress={handleCreateFlashcard}
        >
          <MaterialCommunityIcons
            name="card-plus-outline"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.text.muted} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.text.primary }]}
            onPress={() => refresh()}
          >
            <Text style={[styles.retryButtonText, { color: colors.text.inverse }]}>
              {t('common.retry')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={renderDeckItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.text.primary}
            />
          }
        />
      )}

      {/* Timeline Modal */}
      <TimelineModal
        visible={showTimeline}
        onClose={() => setShowTimeline(false)}
      />

      {/* Create Deck Modal */}
      <CreateDeckModal
        visible={showCreateDeck}
        onClose={() => setShowCreateDeck(false)}
        onCreated={() => refresh()}
      />
    </ScreenWrapper>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonPressed: {
    opacity: 0.7,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  errorText: {
    fontSize: 14,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },

  // Summary card
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },

  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLeft: {
    flex: 1,
  },

  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  summarySubtitle: {
    fontSize: 13,
  },

  totalDueBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalDueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Deck card
  deckCard: {
    marginBottom: Spacing.md,
  },

  deckCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },

  deckIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  deckInfo: {
    flex: 1,
  },

  deckName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  deckStats: {
    fontSize: 13,
  },

  deckActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  dueBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },

  dueBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  reviewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  completeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Alias for backwards compatibility
export const FlashcardsScreen = FlashcardsManageScreen;
export default FlashcardsManageScreen;
