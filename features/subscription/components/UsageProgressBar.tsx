/**
 * @file UsageProgressBar.tsx
 * @description Colored progress bar (green/yellow/red) for usage display
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';

interface UsageProgressBarProps {
  label: string;
  used: number;
  limit: number;
  color: string;
  progress: number;
}

export const UsageProgressBar = memo(function UsageProgressBar({
  label,
  used,
  limit,
  color,
  progress,
}: UsageProgressBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text.secondary }]}>
          {t('subscription.usage.used', { used, limit })}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surface.glass }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${Math.max(progress * 100, 2)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
