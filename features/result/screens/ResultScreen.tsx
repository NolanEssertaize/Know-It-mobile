/**
 * @file ResultScreen.tsx
 * @description Vue Dumb pour l'écran de résultats d'analyse
 * Avec Material Icons au lieu des emojis
 */

import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, GlassButton } from '@/shared/components';
import { ScoreGauge } from '../components/ScoreGauge';
import { AnalysisSection } from '../components/AnalysisSection';
import { useResult } from '../hooks/useResult';
import { GlassColors } from '@/theme';
import { styles } from './ResultScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface StatBadgeProps {
    readonly icon: MaterialIconName;
    readonly count: number;
    readonly label: string;
    readonly color: string;
}

const StatBadge = memo(function StatBadge({
                                              icon,
                                              count,
                                              label,
                                              color
                                          }: StatBadgeProps): React.JSX.Element {
    return (
        <View style={styles.statBadge}>
            <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
                <MaterialIcons name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.statCount, { color }]}>{count}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ResultScreenComponent(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { score, sections, summary, handleClose, handleRetry } = useResult();

    return (
        <LinearGradient
            colors={[GlassColors.gradient.start, GlassColors.gradient.middle, GlassColors.gradient.end]}
            style={styles.gradient}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header avec bouton fermer */}
                <View style={styles.header}>
                    <Pressable style={styles.closeButton} onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color={GlassColors.text.primary} />
                    </Pressable>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Session terminée</Text>
                        <Text style={styles.subtitle}>Voici votre analyse détaillée</Text>
                    </View>
                </View>

                {/* Séparateur visuel */}
                <View style={styles.divider} />

                {/* Score Gauge - élément principal */}
                <ScoreGauge
                    value={score.value}
                    label={score.label}
                    color={score.color}
                />

                {/* Quick Summary - Résumé rapide */}
                <GlassView variant="default" style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Résumé rapide</Text>
                    <View style={styles.statsRow}>
                        <StatBadge
                            icon="check-circle"
                            count={summary.validCount}
                            label="Validés"
                            color={GlassColors.semantic.success}
                        />
                        <StatBadge
                            icon="error"
                            count={summary.correctionsCount}
                            label="À corriger"
                            color={GlassColors.semantic.warning}
                        />
                        <StatBadge
                            icon="cancel"
                            count={summary.missingCount}
                            label="Manquants"
                            color={GlassColors.semantic.error}
                        />
                    </View>
                    <View style={styles.summaryDivider} />
                    <Text style={styles.summaryText}>
                        {summary.totalPoints} points évalués au total
                    </Text>
                </GlassView>

                {/* Sections d'analyse détaillées */}
                <View style={styles.sectionsContainer}>
                    <Text style={styles.sectionHeader}>Détails de l'analyse</Text>
                    {sections.map((section) => (
                        <AnalysisSection
                            key={section.id}
                            title={section.title}
                            icon={section.icon}
                            items={section.items}
                            color={section.color}
                            glowColor={section.glowColor}
                        />
                    ))}
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <GlassButton
                        title="Réessayer"
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onPress={handleRetry}
                        leftIcon={<MaterialIcons name="refresh" size={20} color={GlassColors.text.primary} />}
                    />
                    <View style={styles.actionSpacer} />
                    <GlassButton
                        title="Terminer"
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleClose}
                        leftIcon={<MaterialIcons name="done" size={20} color={GlassColors.text.primary} />}
                    />
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

export const ResultScreen = memo(ResultScreenComponent);
export default ResultScreen;