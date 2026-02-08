/**
 * @file PlanBadge.tsx
 * @description Plan name badge (Free/Student/Unlimited)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { PlanType } from '@/shared/api';

interface PlanBadgeProps {
  planType: PlanType;
}

export const PlanBadge = memo(function PlanBadge({ planType }: PlanBadgeProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const label = t(`subscription.plans.${planType}`);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: planType === 'free'
            ? colors.surface.glass
            : colors.text.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: planType === 'free'
              ? colors.text.primary
              : colors.text.inverse,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
