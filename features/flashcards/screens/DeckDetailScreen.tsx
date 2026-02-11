/**
 * @file DeckDetailScreen.tsx
 * @description Deck detail screen showing timeline with expandable periods and flashcard CRUD
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { ScreenWrapper, GlassView } from '@/shared/components';
import { useDeckDetail } from '../hooks/useDeckDetail';
import { FlashcardItem } from '../components/FlashcardItem/FlashcardItem';
import { AddCardModal } from '../components/AddCardModal/AddCardModal';
import type { TimelinePeriod, DelayLabel } from '@/shared/api';

// Timeline period icons and colors (reused from TimelineModal)
const PERIOD_CONFIG: Record<string, { icon: string; color: string }> = {
  'due': { icon: 'clock-alert-outline', color: '#EF4444' },
  '1_day': { icon: 'clock-outline', color: '#F97316' },
  '1_week': { icon: 'calendar-week', color: '#EAB308' },
  '1_month': { icon: 'calendar-month', color: '#84CC16' },
  '3_months': { icon: 'calendar-range', color: '#22C55E' },
  '6_months': { icon: 'calendar-range', color: '#14B8A6' },
  '12_months': { icon: 'calendar-star', color: '#06B6D4' },
  '18_months': { icon: 'calendar-star', color: '#3B82F6' },
  '24_months': { icon: 'calendar-star', color: '#6366F1' },
  '36_months': { icon: 'calendar-star', color: '#8B5CF6' },
};

const PERIOD_LABELS: Record<string, string> = {
  'due': 'Due Now',
  '1_day': '1 Day',
  '1_week': '1 Week',
  '1_month': '1 Month',
  '3_months': '3 Months',
  '6_months': '6 Months',
  '12_months': '1 Year',
  '18_months': '18 Months',
  '24_months': '2 Years',
  '36_months': '3 Years',
};

const ALL_PERIODS = [
  'due', '1_day', '1_week', '1_month', '3_months',
  '6_months', '12_months', '18_months', '24_months', '36_months',
];

const PERIOD_TO_DELAY: Record<string, DelayLabel> = {
  'due': 'now',
  '1_day': '1_day',
  '1_week': '1_week',
  '1_month': '1_month',
  '3_months': '3_months',
  '6_months': '6_months',
  '12_months': '12_months',
  '18_months': '18_months',
  '24_months': '24_months',
  '36_months': '36_months',
};

const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};

// Animated wrapper for expand/collapse
const AnimatedPeriodContent = memo(function AnimatedPeriodContent({
  isExpanded,
  children,
}: {
  isExpanded: boolean;
  children: React.ReactNode;
}) {
  const animatedHeight = useSharedValue(0);
  const opacity = useSharedValue(0);
  const contentHeight = React.useRef(0);

  const onLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) {
      contentHeight.current = h;
      if (isExpanded) {
        animatedHeight.value = h;
        opacity.value = 1;
      }
    }
  }, [isExpanded, animatedHeight, opacity]);

  React.useEffect(() => {
    if (isExpanded) {
      animatedHeight.value = withTiming(contentHeight.current || 200, TIMING_CONFIG);
      opacity.value = withTiming(1, TIMING_CONFIG);
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      animatedHeight.value = withTiming(0, TIMING_CONFIG);
    }
  }, [isExpanded, animatedHeight, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: opacity.value,
    overflow: 'hidden' as const,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
});

// Animated chevron
const AnimatedChevron = memo(function AnimatedChevron({
  isExpanded,
  color,
}: {
  isExpanded: boolean;
  color: string;
}) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 90 : 0, TIMING_CONFIG);
  }, [isExpanded, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={color}
      />
    </Animated.View>
  );
});

export const DeckDetailScreen = memo(function DeckDetailScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ deckId: string; deckName: string }>();
  const deckId = params.deckId as string;
  const deckName = params.deckName || t('flashcards.deck.detail');

  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardDelay, setAddCardDelay] = useState<DelayLabel | undefined>(undefined);

  const {
    periods: apiPeriods,
    expandedPeriods,
    isLoading,
    isRefreshing,
    error,
    totalUpcoming,
    togglePeriod,
    addCard,
    updateCard,
    deleteCard,
    refresh,
  } = useDeckDetail(deckId);

  // Merge API periods with all periods to show empty ones too
  const periods = ALL_PERIODS.map((periodKey) => {
    const apiPeriod = apiPeriods.find((p) => p.period === periodKey);
    return {
      period: periodKey,
      count: apiPeriod?.count || 0,
      cards: apiPeriod?.cards || [],
    };
  });

  const getConfig = (period: string) =>
    PERIOD_CONFIG[period] || { icon: 'calendar', color: '#6B7280' };

  const handleAddCardForPeriod = useCallback((periodKey: string) => {
    setAddCardDelay(PERIOD_TO_DELAY[periodKey]);
    setShowAddCard(true);
  }, []);

  const handleCloseAddCard = useCallback(() => {
    setShowAddCard(false);
    setAddCardDelay(undefined);
  }, []);

  const renderPeriod = (period: TimelinePeriod) => {
    const config = getConfig(period.period);
    const label = PERIOD_LABELS[period.period] || period.period;
    const isEmpty = period.count === 0;
    const isExpanded = expandedPeriods.has(period.period);

    return (
      <View key={period.period} style={styles.periodWrapper}>
        <Pressable
          style={styles.periodRow}
          onPress={() => togglePeriod(period.period)}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isEmpty ? colors.glass.background : config.color + '20', zIndex: 1 },
            ]}
          >
            <MaterialCommunityIcons
              name={config.icon as any}
              size={24}
              color={isEmpty ? colors.text.muted : config.color}
            />
          </View>

          {/* Content */}
          <GlassView
            variant="default"
            style={[
              styles.periodCard,
              !isDark && { borderWidth: 1, borderColor: colors.glass.border },
              isEmpty && { opacity: 0.6 },
            ]}
          >
            <View style={styles.periodContent}>
              <View style={styles.periodLeft}>
                <Text style={[styles.periodLabel, { color: isEmpty ? colors.text.muted : colors.text.primary }]}>
                  {label}
                </Text>
                <Text style={[styles.periodDescription, { color: isEmpty ? colors.text.muted : colors.text.secondary }]}>
                  {isEmpty ? '—' : t('flashcards.timeline.cardsToReview', { count: period.count })}
                </Text>
              </View>
              <View style={styles.periodRight}>
                <View style={[styles.countBadge, { backgroundColor: isEmpty ? colors.glass.background : config.color }]}>
                  <Text style={[styles.countText, isEmpty && { color: colors.text.muted }]}>
                    {period.count}
                  </Text>
                </View>
                <AnimatedChevron isExpanded={isExpanded} color={colors.text.muted} />
              </View>
            </View>
          </GlassView>
        </Pressable>

        {/* Animated expanded content */}
        <AnimatedPeriodContent isExpanded={isExpanded}>
          {/* Add card button — card-shaped with dashed outline */}
          <Pressable
            style={({ pressed }) => [
              styles.addCardButton,
              { borderColor: colors.text.primary },
              pressed && { opacity: 0.5 },
            ]}
            onPress={() => handleAddCardForPeriod(period.period)}
          >
            <MaterialIcons name="add" size={24} color={colors.text.primary} />
          </Pressable>

          {period.cards.length > 0 && (
            <View style={styles.cardsContainer}>
              {period.cards.map((card) => (
                <FlashcardItem
                  key={card.id}
                  card={card}
                  onUpdate={updateCard}
                  onDelete={deleteCard}
                />
              ))}
            </View>
          )}
        </AnimatedPeriodContent>
      </View>
    );
  };

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
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>

        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
          {deckName}
        </Text>

        {/* Spacer to keep title centered */}
        <View style={styles.headerButton} />
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        {t('flashcards.timeline.subtitle', { count: totalUpcoming })}
      </Text>

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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.text.primary}
            />
          }
        >
          <View style={styles.timelineContainer}>
            {/* Continuous vertical line */}
            {periods.length > 1 && (
              <View
                style={[styles.continuousLine, { backgroundColor: colors.glass.border }]}
              />
            )}

            {periods.map(renderPeriod)}
          </View>
        </ScrollView>
      )}

      {/* Add Card Modal */}
      <AddCardModal
        visible={showAddCard}
        onClose={handleCloseAddCard}
        onAdd={addCard}
        delay={addCardDelay}
      />
    </ScreenWrapper>
  );
});

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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },

  subtitle: {
    fontSize: 14,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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

  // Scroll
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Timeline
  timelineContainer: {
    position: 'relative',
  },

  continuousLine: {
    position: 'absolute',
    left: 23,
    top: 24,
    bottom: 24,
    width: 2,
    zIndex: 0,
  },

  // Period
  periodWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },

  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  periodCard: {
    flex: 1,
    padding: Spacing.md,
    minHeight: 72,
    justifyContent: 'center',
  },

  periodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  periodLeft: {
    flex: 1,
  },

  periodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  periodDescription: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },

  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Cards container
  cardsContainer: {
    marginTop: Spacing.sm,
  },

  // Add card button — dashed card shape
  addCardButton: {
    marginLeft: Spacing.xl + Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DeckDetailScreen;
