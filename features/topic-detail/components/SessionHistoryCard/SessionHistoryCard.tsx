/**
 * @file SessionHistoryCard.tsx
 * @description Carte d'historique de session - Theme Aware
 *
 * FIXED: Now uses useTheme() for dynamic colors (fixes white text on white theme)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { SessionItemData } from '../../hooks/useTopicDetail';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SessionHistoryCardProps {
    data: SessionItemData;
    onPress?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionHistoryCard = memo(function SessionHistoryCard({
                                                                       data,
                                                                       onPress,
                                                                   }: SessionHistoryCardProps) {
    const { session, formattedDate } = data;
    const { colors } = useTheme();

    return (
        <GlassCard style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={[styles.dateBadge, { backgroundColor: colors.surface.glass }]}>
                    <Text style={[styles.dateText, { color: colors.text.secondary }]}>
                        {formattedDate}
                    </Text>
                </View>
            </View>
            <Text
                numberOfLines={3}
                style={[styles.transcription, { color: colors.text.primary }]}
            >
                {session.transcription || 'Aucune transcription disponible'}
            </Text>
        </GlassCard>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    card: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    dateBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    transcription: {
        fontSize: 14,
        lineHeight: 20,
    },
});