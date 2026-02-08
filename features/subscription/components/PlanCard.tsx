/**
 * @file PlanCard.tsx
 * @description Individual plan comparison card for the paywall
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { PlanType } from '@/shared/api';

interface PlanCardProps {
  planType: PlanType;
  sessionsPerDay: number;
  generationsPerDay: number;
  price: string;
  isCurrent: boolean;
  isPopular?: boolean;
  onPurchase?: () => void;
  isPurchasing?: boolean;
}

export const PlanCard = memo(function PlanCard({
  planType,
  sessionsPerDay,
  generationsPerDay,
  price,
  isCurrent,
  isPopular = false,
  onPurchase,
  isPurchasing = false,
}: PlanCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const planName = t(`subscription.plans.${planType}`);

  return (
    <GlassView
      style={[
        styles.card,
        isCurrent && { borderColor: colors.text.primary, borderWidth: 2 },
      ]}
    >
      {isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: colors.text.primary }]}>
          <Text style={[styles.popularText, { color: colors.text.inverse }]}>
            {t('subscription.popular')}
          </Text>
        </View>
      )}

      <Text style={[styles.planName, { color: colors.text.primary }]}>{planName}</Text>

      <View style={styles.features}>
        <Text style={[styles.feature, { color: colors.text.secondary }]}>
          {t('subscription.sessionsPerDay', { count: sessionsPerDay })}
        </Text>
        <Text style={[styles.feature, { color: colors.text.secondary }]}>
          {t('subscription.generationsPerDay', { count: generationsPerDay })}
        </Text>
      </View>

      <Text style={[styles.price, { color: colors.text.primary }]}>{price}</Text>

      {isCurrent ? (
        <View style={[styles.currentBadge, { backgroundColor: colors.surface.glass }]}>
          <Text style={[styles.currentText, { color: colors.text.primary }]}>
            {t('subscription.currentPlan')}
          </Text>
        </View>
      ) : onPurchase ? (
        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: colors.text.primary }]}
          onPress={onPurchase}
          disabled={isPurchasing}
          activeOpacity={0.8}
        >
          {isPurchasing ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text style={[styles.purchaseText, { color: colors.text.inverse }]}>
              {t('subscription.upgrade')}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </GlassView>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 200,
    padding: Spacing.md,
    paddingTop: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  popularBadge: {
    position: 'absolute',
    top: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  features: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  feature: {
    fontSize: 13,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  currentBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  currentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  purchaseButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
