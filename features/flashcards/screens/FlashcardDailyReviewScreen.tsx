/**
 * @file FlashcardDailyReviewScreen.tsx
 * @description Main flashcard screen - shows cards ready for daily review
 * Swipe-first experience with progress counter and manage button
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { GlassView, ScreenWrapper } from '@/shared/components';
import { useFlashcardDailyReview } from '../hooks/useFlashcardDailyReview';
import { SwipeableFlashcard } from '../components/SwipeableFlashcard';
import { TimelineModal } from '../components/TimelineModal';

// Stat colors (explicit colors for visual feedback)
const STAT_COLORS = {
  good: '#22C55E',    // Green - correct
  hard: '#F97316',    // Orange - difficult
  forgot: '#EF4444',  // Red - wrong
  accuracy: '#22C55E', // Green for accuracy
};

function FlashcardDailyReviewScreenComponent(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showTimeline, setShowTimeline] = useState(false);
  const {
    cards,
    currentIndex,
    currentCard,
    totalCards,
    isLoading,
    isRefreshing,
    isComplete,
    error,
    stats,
    nextDueLabel,
    handleSwipe,
    handleRestart,
    handleManage,
    refresh,
  } = useFlashcardDailyReview();

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false} padding={0}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            {t('flashcards.daily.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenWrapper scrollable={false} padding={0}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={[styles.progressText, { color: colors.text.primary }]}>
            {t('flashcards.title')}
          </Text>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.glass.background }]}
            onPress={handleManage}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={colors.text.primary}
            />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.text.muted} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            {error}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.text.primary }]}
            onPress={refresh}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {t('common.retry')}
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  // No cards due - all done state
  if (cards.length === 0) {
    return (
      <ScreenWrapper scrollable={false} padding={0}>
        <View style={styles.header}>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.glass.background }]}
            onPress={refresh}
          >
            <MaterialIcons
              name="refresh"
              size={24}
              color={colors.text.primary}
            />
          </Pressable>
          <Text style={[styles.progressText, { color: colors.text.primary }]}>
            {t('flashcards.daily.allDone')}
          </Text>
          <Pressable
            style={[styles.headerButton, { backgroundColor: colors.glass.background }]}
            onPress={handleManage}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={colors.text.primary}
            />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.text.primary}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.glass.background }]}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={64}
                color="#22C55E"
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              {t('flashcards.daily.noDue')}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
              {t('flashcards.daily.comeBackLater')}
            </Text>
            {nextDueLabel && (
              <Text style={[styles.nextDueText, { color: colors.text.muted }]}>
                {nextDueLabel}
              </Text>
            )}
            <View style={styles.emptyActions}>
              <Pressable
                style={[styles.timelineButton, { backgroundColor: colors.text.primary }]}
                onPress={() => setShowTimeline(true)}
              >
                <MaterialCommunityIcons name="timeline-clock-outline" size={20} color={colors.text.inverse} />
                <Text style={[styles.timelineButtonText, { color: colors.text.inverse }]}>
                  {t('flashcards.daily.timeline')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.manageButton, { backgroundColor: colors.glass.background, borderColor: colors.glass.borderLight }]}
                onPress={handleManage}
              >
                <MaterialCommunityIcons name="cards-outline" size={20} color={colors.text.primary} />
                <Text style={[styles.manageButtonText, { color: colors.text.primary }]}>
                  {t('flashcards.daily.manageDecks')}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Timeline Modal */}
        <TimelineModal
          visible={showTimeline}
          onClose={() => setShowTimeline(false)}
        />
      </ScreenWrapper>
    );
  }

  // Complete state - session finished
  if (isComplete) {
    // Accuracy = good answers (correct, advanced step)
    const accuracy = stats.total > 0
      ? Math.round((stats.good / stats.total) * 100)
      : 0;

    return (
      <ScreenWrapper scrollable={false} padding={0}>
        <View style={[styles.completeContainer, { paddingTop: insets.top + Spacing.xl }]}>
          {/* Header */}
          <Text style={[styles.completeTitle, { color: colors.text.primary }]}>
            {t('flashcards.review.sessionComplete')}
          </Text>

          {/* Stats Card */}
          <GlassView variant="default" style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {t('flashcards.review.cardsReviewed')}
              </Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {stats.reviewed}
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.glass.borderDivider }]} />

            <View style={styles.statBreakdown}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: STAT_COLORS.good }]} />
                <Text style={[styles.statItemLabel, { color: colors.text.secondary }]}>
                  {t('flashcards.review.good')}
                </Text>
                <Text style={[styles.statItemValue, { color: colors.text.primary }]}>
                  {stats.good}
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: STAT_COLORS.hard }]} />
                <Text style={[styles.statItemLabel, { color: colors.text.secondary }]}>
                  {t('flashcards.review.hard')}
                </Text>
                <Text style={[styles.statItemValue, { color: colors.text.primary }]}>
                  {stats.hard}
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: STAT_COLORS.forgot }]} />
                <Text style={[styles.statItemLabel, { color: colors.text.secondary }]}>
                  {t('flashcards.review.forgot')}
                </Text>
                <Text style={[styles.statItemValue, { color: colors.text.primary }]}>
                  {stats.forgot}
                </Text>
              </View>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.glass.borderDivider }]} />

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {t('flashcards.review.accuracy')}
              </Text>
              <Text style={[styles.statValue, { color: STAT_COLORS.accuracy }]}>
                {accuracy}%
              </Text>
            </View>
          </GlassView>

          {nextDueLabel && (
            <Text style={[styles.nextDueText, { color: colors.text.muted }]}>
              {nextDueLabel}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.completeActions}>
            <Pressable
              style={[
                styles.outlineButton,
                { borderColor: colors.glass.borderLight, backgroundColor: colors.glass.background },
              ]}
              onPress={handleRestart}
            >
              <MaterialIcons name="replay" size={20} color={colors.text.primary} />
              <Text style={[styles.outlineButtonText, { color: colors.text.primary }]}>
                {t('flashcards.review.reviewAgain')}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.outlineButton,
                { borderColor: colors.glass.borderLight, backgroundColor: colors.glass.background },
              ]}
              onPress={refresh}
            >
              <MaterialIcons name="refresh" size={20} color={colors.text.primary} />
              <Text style={[styles.outlineButtonText, { color: colors.text.primary }]}>
                {t('flashcards.review.checkNewCards')}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colors.text.primary }]}
              onPress={handleManage}
            >
              <MaterialCommunityIcons name="cards-outline" size={20} color={colors.text.inverse} />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                {t('flashcards.daily.manageDecks')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // Review in progress - main experience
  return (
    <ScreenWrapper scrollable={false} padding={0}>
      {/* Header with progress counter */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />

        {/* Progress Counter - center */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.text.primary }]}>
            {currentIndex + 1}/{totalCards}
          </Text>
        </View>

        {/* Manage button - right */}
        <Pressable
          style={[styles.headerButton, { backgroundColor: colors.glass.background }]}
          onPress={handleManage}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={colors.text.primary}
          />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.glass.background }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.text.primary,
              width: `${(currentIndex / totalCards) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {/* Render next card behind (ready to show) */}
        {currentIndex + 1 < cards.length && (
          <View style={styles.nextCardPreview} pointerEvents="none">
            <SwipeableFlashcard
              key={cards[currentIndex + 1].id}
              card={cards[currentIndex + 1]}
              onSwipe={() => {}}
              isActive={false}
            />
          </View>
        )}

        {/* Current card */}
        {currentCard && (
          <SwipeableFlashcard
            key={currentCard.id}
            card={currentCard}
            onSwipe={handleSwipe}
            isActive={true}
          />
        )}
      </View>

    </ScreenWrapper>
  );
}

export const FlashcardDailyReviewScreen = memo(FlashcardDailyReviewScreenComponent);
export default FlashcardDailyReviewScreen;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  headerLeft: {
    width: 40,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressContainer: {
    alignItems: 'center',
  },

  progressText: {
    fontSize: 24,
    fontWeight: '700',
  },

  // Progress bar
  progressBar: {
    height: 4,
    marginHorizontal: Spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  errorText: {
    fontSize: 16,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },

  // Empty / All done
  emptyScrollContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },

  nextDueText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  emptyActions: {
    gap: Spacing.md,
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },

  timelineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },

  timelineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },

  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Card stack
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },

  nextCardPreview: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },

  // Complete
  completeContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  statsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 15,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },

  statDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },

  statBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },

  statItemLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },

  statItemValue: {
    fontSize: 18,
    fontWeight: '600',
  },

  completeActions: {
    gap: Spacing.md,
  },

  // Buttons
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },

  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
