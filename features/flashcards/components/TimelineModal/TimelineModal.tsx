/**
 * @file TimelineModal.tsx
 * @description Modal showing timeline of upcoming flashcard reviews
 * Displays buckets: 1 Day, 1 Week, 1 Month, 3 Months, 6 Months, 1 Year, 2 Years
 */

import React, { memo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { GlassView } from '@/shared/components';
import { FlashcardsService } from '@/shared/services';
import type { TimelinePeriod } from '@/shared/api';

interface TimelineModalProps {
  visible: boolean;
  onClose: () => void;
}

// Timeline period icons and colors
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

// Default labels for periods
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

// All periods in order (to show even empty ones)
const ALL_PERIODS = [
  'due',
  '1_day',
  '1_week',
  '1_month',
  '3_months',
  '6_months',
  '12_months',
  '18_months',
  '24_months',
  '36_months',
];

function TimelineModalComponent({ visible, onClose }: TimelineModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiPeriods, setApiPeriods] = useState<TimelinePeriod[]>([]);
  const [totalUpcoming, setTotalUpcoming] = useState(0);

  // Merge API periods with all periods to show empty ones too
  const periods = ALL_PERIODS.map((periodKey) => {
    const apiPeriod = apiPeriods.find((p) => p.period === periodKey);
    return {
      period: periodKey,
      count: apiPeriod?.count || 0,
      cards: apiPeriod?.cards || [],
    };
  });

  useEffect(() => {
    if (visible) {
      fetchTimeline();
    }
  }, [visible]);

  const fetchTimeline = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FlashcardsService.getTimeline();
      setApiPeriods(response.periods);
      setTotalUpcoming(response.total_upcoming);
    } catch (err) {
      console.error('[TimelineModal] Failed to fetch timeline:', err);
      setError(t('flashcards.timeline.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getConfig = (period: string) => {
    return PERIOD_CONFIG[period] || { icon: 'calendar', color: '#6B7280' };
  };

  const getLabel = (period: TimelinePeriod) => {
    return PERIOD_LABELS[period.period] || period.period;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('flashcards.timeline.title')}
          </Text>
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.glass.background }]}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </Pressable>
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
              onPress={fetchTimeline}
            >
              <Text style={[styles.retryButtonText, { color: colors.text.inverse }]}>
                {t('common.retry')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.timelineContainer}>
              {/* Continuous vertical line behind all icons */}
              {periods.length > 1 && (
                <View
                  style={[
                    styles.continuousLine,
                    { backgroundColor: colors.glass.border },
                  ]}
                />
              )}

              {periods.map((period) => {
                const config = getConfig(period.period);
                const label = getLabel(period);
                const isEmpty = period.count === 0;

                return (
                  <View key={period.period} style={styles.periodWrapper}>
                    {/* Period card */}
                    <View style={styles.periodRow}>
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
                          <Text style={[styles.periodLabel, { color: isEmpty ? colors.text.muted : colors.text.primary }]}>
                            {label}
                          </Text>
                          <View style={[
                            styles.countBadge,
                            { backgroundColor: isEmpty ? colors.glass.background : config.color },
                          ]}>
                            <Text style={[styles.countText, isEmpty && { color: colors.text.muted }]}>
                              {period.count}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.periodDescription, { color: isEmpty ? colors.text.muted : colors.text.secondary }]}>
                          {isEmpty ? '—' : t('flashcards.timeline.cardsToReview', { count: period.count })}
                        </Text>
                      </GlassView>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

export const TimelineModal = memo(TimelineModalComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtitle: {
    fontSize: 14,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
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

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  emptyText: {
    fontSize: 16,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Timeline
  timelineContainer: {
    position: 'relative',
  },

  continuousLine: {
    position: 'absolute',
    left: 23,           // Center of 48px icon column (48/2 - 2/2 = 23)
    top: 24,            // Center of first icon (48/2 = 24)
    bottom: 24,         // Center of last icon
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
    alignItems: 'center',  // Center align icon with card
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
    minHeight: 72,  // Fixed minimum height for consistency
    justifyContent: 'center',
  },

  periodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});

export default TimelineModal;
