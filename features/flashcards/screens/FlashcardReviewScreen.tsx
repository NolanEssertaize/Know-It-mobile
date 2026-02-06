/**
 * @file FlashcardReviewScreen.tsx
 * @description Screen for reviewing flashcards with swipe gestures
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { GlassView } from '@/shared/components';
import { useFlashcardReview } from '../hooks/useFlashcardReview';
import { SwipeableFlashcard } from '../components/SwipeableFlashcard';

// Stat colors (explicit colors for visual feedback)
const STAT_COLORS = {
  good: '#22C55E',    // Green - correct
  hard: '#F97316',    // Orange - difficult
  forgot: '#EF4444',  // Red - wrong
  accuracy: '#22C55E', // Green for accuracy
};

function FlashcardReviewScreenComponent(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    cards,
    currentIndex,
    currentCard,
    isLoading,
    isComplete,
    error,
    stats,
    deckName,
    handleSwipe,
    handleClose,
    handleRestart,
  } = useFlashcardReview();

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            {t('flashcards.review.loading')}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <MaterialIcons name="error-outline" size={48} color={colors.text.muted} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            {error}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.text.primary }]}
            onPress={handleClose}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {t('common.goBack')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // No cards due
  if (cards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.glass.background }]}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={48}
              color={colors.semantic.success}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {t('flashcards.review.allDone')}
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
            {t('flashcards.review.noCardsDue')}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.text.primary }]}
            onPress={handleClose}
          >
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
              {t('common.goBack')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Complete state
  if (isComplete) {
    // Accuracy = good answers (correct, advanced step)
    const accuracy = stats.total > 0
      ? Math.round((stats.good / stats.total) * 100)
      : 0;

    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
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
              style={[styles.button, { backgroundColor: colors.text.primary }]}
              onPress={handleClose}
            >
              <MaterialIcons name="done" size={20} color={colors.text.inverse} />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                {t('flashcards.review.finish')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Review in progress
  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          style={[styles.closeButton, { backgroundColor: colors.glass.background }]}
          onPress={handleClose}
        >
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.deckName, { color: colors.text.primary }]} numberOfLines={1}>
            {deckName}
          </Text>
          <Text style={[styles.progress, { color: colors.text.secondary }]}>
            {currentIndex + 1} / {cards.length}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.glass.background }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.text.primary,
              width: `${((currentIndex) / cards.length) * 100}%`,
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

    </View>
  );
}

export const FlashcardReviewScreen = memo(FlashcardReviewScreenComponent);
export default FlashcardReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  deckName: {
    fontSize: 16,
    fontWeight: '600',
  },

  progress: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },

  headerRight: {
    width: 40,
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
