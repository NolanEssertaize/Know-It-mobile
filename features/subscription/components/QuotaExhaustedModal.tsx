/**
 * @file QuotaExhaustedModal.tsx
 * @description Modal shown when user has no remaining sessions or generations.
 * Shows time until reset and option to change plan.
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

interface QuotaExhaustedModalProps {
  visible: boolean;
  type: 'session' | 'generation';
  onDismiss: () => void;
  onChangePlan: () => void;
}

function computeTimeUntilReset(usageDate: string | null): string {
  if (!usageDate) return '24h';

  // usage_date is ISO date string like "2026-02-12"
  // Quotas reset at the start of the next day (UTC)
  const resetDate = new Date(usageDate + 'T00:00:00Z');
  resetDate.setUTCDate(resetDate.getUTCDate() + 1);

  const now = Date.now();
  const diffMs = resetDate.getTime() - now;

  if (diffMs <= 0) return '0m';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export const QuotaExhaustedModal = memo(function QuotaExhaustedModal({
  visible,
  type,
  onDismiss,
  onChangePlan,
}: QuotaExhaustedModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const usageDate = useSubscriptionStore((s) => s.usageDate);

  const timeRemaining = useMemo(() => computeTimeUntilReset(usageDate), [usageDate]);

  const title = type === 'session'
    ? t('subscription.quota.noMoreSessions')
    : t('subscription.quota.noMoreGenerations');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />

        <View style={[styles.card, { backgroundColor: colors.background.primary }]}>
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: colors.surface.glass }]}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={36}
              color={colors.text.primary}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Text>

          {/* Wait message */}
          <Text style={[styles.message, { color: colors.text.secondary }]}>
            {t('subscription.quota.waitMessage', { time: timeRemaining })}
          </Text>

          {/* Change Plan button */}
          <TouchableOpacity
            onPress={onChangePlan}
            activeOpacity={0.8}
            style={styles.changePlanButton}
          >
            <View style={[styles.primaryButton, { backgroundColor: colors.text.primary }]}>
              <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
                {t('subscription.quota.changePlan')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Not now */}
          <TouchableOpacity onPress={onDismiss} style={styles.notNow}>
            <Text style={[styles.notNowText, { color: colors.text.muted }]}>
              {t('subscription.quota.notNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: '85%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  changePlanButton: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  primaryButton: {
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notNow: {
    paddingVertical: Spacing.sm,
  },
  notNowText: {
    fontSize: 13,
  },
});
