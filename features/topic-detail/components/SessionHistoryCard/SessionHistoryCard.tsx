/**
 * @file SessionHistoryCard.tsx
 * @description Carte d'historique de session
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from '@/shared/components';
import type { SessionItemData } from '../../hooks/useTopicDetail';
import { styles } from './SessionHistoryCard.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SessionHistoryCardProps {
  data: SessionItemData;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionHistoryCard = memo(function SessionHistoryCard({
  data,
}: SessionHistoryCardProps) {
  const { session, formattedDate } = data;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>
      <Text numberOfLines={3} style={styles.transcription}>
        {session.transcription || 'Aucune transcription disponible'}
      </Text>
    </GlassCard>
  );
});
