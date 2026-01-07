/**
 * @file AnalysisSection.tsx
 * @description Composant d'affichage d'une section d'analyse
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { GlassView } from '@/shared/components';
import { styles } from './AnalysisSection.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalysisSectionProps {
  /** Section title */
  readonly title: string;
  /** Icon emoji */
  readonly icon: string;
  /** List of items */
  readonly items: readonly string[];
  /** Section color */
  readonly color: string;
  /** Glow color for the container */
  readonly glowColor: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface AnalysisItemProps {
  readonly text: string;
  readonly color: string;
}

const AnalysisItem = memo(function AnalysisItem({ text, color }: AnalysisItemProps): React.JSX.Element {
  return (
    <View style={styles.itemContainer}>
      <View style={[styles.itemBullet, { backgroundColor: color }]} />
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function AnalysisSectionComponent({
  title,
  icon,
  items,
  color,
  glowColor,
}: AnalysisSectionProps): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <GlassView variant="default" glow glowColor={glowColor} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color }]}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.badgeText, { color }]}>{items.length}</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <AnalysisItem key={`${title}-${index}`} text={item} color={color} />
        ))}
      </View>
    </GlassView>
  );
}

export const AnalysisSection = memo(AnalysisSectionComponent);
