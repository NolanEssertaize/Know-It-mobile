/**
 * @file AnalysisCard/index.tsx
 * @description Analysis section card for valid points, corrections, or missing items
 */

import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';

type AnalysisType = 'valid' | 'corrections' | 'missing';

interface AnalysisCardProps {
  type: AnalysisType;
  title: string;
  items: string[];
}

export const AnalysisCard = memo(function AnalysisCard({
  type,
  title,
  items,
}: AnalysisCardProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  // Get type-specific styling
  const getTypeConfig = () => {
    switch (type) {
      case 'valid':
        return {
          color: colors.status.success,
          icon: 'check-circle' as const,
          bgColor: colors.status.success + '15',
        };
      case 'corrections':
        return {
          color: colors.status.warning,
          icon: 'edit' as const,
          bgColor: colors.status.warning + '15',
        };
      case 'missing':
        return {
          color: colors.status.error,
          icon: 'help-outline' as const,
          bgColor: colors.status.error + '15',
        };
    }
  };

  const config = getTypeConfig();

  if (items.length === 0) {
    return null;
  }

  return (
    <GlassView style={styles.container} padding="md" radius="lg">
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <MaterialIcons name={config.icon} size={20} color={config.color} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: config.bgColor }]}>
          <Text style={[styles.countText, { color: config.color }]}>{items.length}</Text>
        </View>
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={colors.text.muted}
        />
      </TouchableOpacity>

      {/* Items */}
      {isExpanded && (
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.item,
                { backgroundColor: config.bgColor },
                index === items.length - 1 && styles.itemLast,
              ]}
            >
              <MaterialIcons name={config.icon} size={16} color={config.color} />
              <Text style={[styles.itemText, { color: colors.text.secondary }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </GlassView>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    ...Typography.body.large,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  countText: {
    ...Typography.body.small,
    fontWeight: '600',
  },
  itemsContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  itemLast: {
    marginBottom: 0,
  },
  itemText: {
    flex: 1,
    ...Typography.body.medium,
    lineHeight: 20,
  },
});
