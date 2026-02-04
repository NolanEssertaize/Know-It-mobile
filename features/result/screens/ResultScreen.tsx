/**
 * @file ResultScreen.tsx
 * @description Écran de résultats d'analyse - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';

import { useResult } from '../hooks/useResult';
import { ScoreGauge } from '../components/ScoreGauge';
import { AnalysisSection } from '../components/AnalysisSection';

// ═══════════════════════════════════════════════════════════════════════════
// STAT BADGE COMPONENT - Theme Aware
// ═══════════════════════════════════════════════════════════════════════════

interface StatBadgeProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    count: number;
    label: string;
}

const StatBadge = memo(function StatBadge({ icon, count, label }: StatBadgeProps) {
    const { colors } = useTheme();
    
    return (
        <View style={styles.statBadge}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.surface.glass }]}>
                <MaterialIcons name={icon} size={24} color={colors.text.primary} />
            </View>
            <Text style={[styles.statCount, { color: colors.text.primary }]}>{count}</Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{label}</Text>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ResultScreenComponent(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { score, sections, summary, handleClose, handleRetry, isFromHistory, isLoading, transcription } = useResult();
    const [showTranscription, setShowTranscription] = React.useState(false);

    // Theme-aware sections
    const themedSections = useMemo(() => {
        return sections.map(section => ({
            ...section,
            color: colors.text.primary,
            glowColor: undefined,
        }));
    }, [sections, colors.text.primary]);

    // Show loading state while fetching session from API
    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <ActivityIndicator size="large" color={colors.text.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    {t('result.loading')}
                </Text>
            </View>
        );
    }

    // Show empty state if no data (shouldn't happen in normal flow)
    const hasData = summary.totalPoints > 0;
    if (!hasData) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <MaterialIcons name="error-outline" size={48} color={colors.text.muted} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    {t('result.notFoundMessage')}
                </Text>
                <Pressable
                    style={[styles.buttonPrimary, { backgroundColor: colors.text.primary, marginTop: Spacing.lg }]}
                    onPress={handleClose}
                >
                    <Text style={[styles.buttonPrimaryText, { color: colors.text.inverse }]}>
                        {t('result.actions.backToTopic')}
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header avec bouton fermer */}
                <View style={styles.header}>
                    <Pressable 
                        style={[
                            styles.closeButton, 
                            { 
                                backgroundColor: colors.surface.glass,
                                borderColor: colors.glass.borderLight,
                            }
                        ]} 
                        onPress={handleClose}
                    >
                        <MaterialIcons name="close" size={24} color={colors.text.primary} />
                    </Pressable>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.title, { color: colors.text.primary }]}>
                            {t('result.title')}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                            {t('result.detailedAnalysis')}
                        </Text>
                    </View>
                </View>

                {/* Séparateur visuel */}
                <View style={[styles.divider, { backgroundColor: colors.glass.border }]} />

                {/* Score Gauge */}
                <ScoreGauge
                    value={score.value}
                    label={score.label}
                    color={colors.text.primary}
                />

                {/* Quick Summary */}
                <GlassView variant="default" style={styles.summaryContainer}>
                    <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
                        {t('result.yourScore')}
                    </Text>
                    <View style={styles.statsRow}>
                        <StatBadge
                            icon="check-circle"
                            count={summary.validCount}
                            label={t('result.valid')}
                        />
                        <StatBadge
                            icon="error"
                            count={summary.correctionsCount}
                            label={t('result.corrections')}
                        />
                        <StatBadge
                            icon="cancel"
                            count={summary.missingCount}
                            label={t('result.missing')}
                        />
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.glass.border }]} />
                    <Text style={[styles.summaryText, { color: colors.text.secondary }]}>
                        {summary.totalPoints} {t('result.score.outOf').replace('out of 100', 'points')}
                    </Text>
                </GlassView>

                {/* Sections d'analyse détaillées */}
                <View style={styles.sectionsContainer}>
                    <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>
                        {t('result.analysis.title')}
                    </Text>
                    {themedSections.map((section) => (
                        <AnalysisSection
                            key={section.id}
                            title={section.title}
                            icon={section.icon}
                            items={section.items}
                            color={colors.text.primary}
                            glowColor={undefined}
                        />
                    ))}
                </View>

                {/* Transcription Section */}
                {transcription && (
                    <View style={styles.transcriptionContainer}>
                        <Pressable
                            style={[
                                styles.transcriptionHeader,
                                {
                                    backgroundColor: colors.surface.glass,
                                    borderColor: colors.glass.border,
                                },
                            ]}
                            onPress={() => setShowTranscription(!showTranscription)}
                        >
                            <View style={styles.transcriptionHeaderLeft}>
                                <MaterialIcons
                                    name="record-voice-over"
                                    size={20}
                                    color={colors.text.primary}
                                />
                                <Text style={[styles.transcriptionTitle, { color: colors.text.primary }]}>
                                    {t('result.transcription.title')}
                                </Text>
                            </View>
                            <MaterialIcons
                                name={showTranscription ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={24}
                                color={colors.text.secondary}
                            />
                        </Pressable>
                        {showTranscription && (
                            <GlassView variant="default" style={styles.transcriptionContent}>
                                <Text style={[styles.transcriptionText, { color: colors.text.primary }]}>
                                    {transcription}
                                </Text>
                            </GlassView>
                        )}
                    </View>
                )}

                {/* Actions - HIGH CONTRAST BUTTONS */}
                <View style={styles.actionsContainer}>
                    {/* "Réessayer" - Outline/Glass style */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.buttonOutline,
                            { 
                                backgroundColor: colors.surface.glass,
                                borderColor: colors.glass.borderLight,
                            },
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleRetry}
                    >
                        <MaterialIcons name="refresh" size={20} color={colors.text.primary} />
                        <Text style={[styles.buttonOutlineText, { color: colors.text.primary }]}>
                            {t('result.actions.tryAgain')}
                        </Text>
                    </Pressable>

                    <View style={styles.actionSpacer} />

                    {/* "Terminer" - HIGH CONTRAST */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.buttonPrimary,
                            { backgroundColor: colors.text.primary },
                            pressed && styles.buttonPrimaryPressed,
                        ]}
                        onPress={handleClose}
                    >
                        <MaterialIcons name="done" size={20} color={colors.text.inverse} />
                        <Text style={[styles.buttonPrimaryText, { color: colors.text.inverse }]}>
                            {t('result.actions.backToTopic')}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

export const ResultScreen = memo(ResultScreenComponent);
export default ResultScreen;

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        fontSize: 16,
        marginTop: Spacing.md,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },

    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    headerTextContainer: {
        flex: 1,
        paddingTop: Spacing.xs,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },

    subtitle: {
        fontSize: 14,
    },

    divider: {
        height: 1,
        marginBottom: Spacing.lg,
    },

    // Summary
    summaryContainer: {
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
    },

    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Spacing.md,
    },

    statBadge: {
        alignItems: 'center',
    },

    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },

    statCount: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 12,
    },

    summaryDivider: {
        height: 1,
        marginBottom: Spacing.md,
    },

    summaryText: {
        fontSize: 14,
        textAlign: 'center',
    },

    // Sections
    sectionsContainer: {
        marginBottom: Spacing.lg,
    },

    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
    },

    // Transcription
    transcriptionContainer: {
        marginBottom: Spacing.lg,
    },

    transcriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },

    transcriptionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    transcriptionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },

    transcriptionContent: {
        marginTop: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },

    transcriptionText: {
        fontSize: 14,
        lineHeight: 22,
    },

    // Actions
    actionsContainer: {
        flexDirection: 'row',
        marginTop: Spacing.md,
    },

    buttonOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.xs,
    },

    buttonOutlineText: {
        fontSize: 16,
        fontWeight: '600',
    },

    buttonPressed: {
        opacity: 0.8,
    },

    actionSpacer: {
        width: Spacing.md,
    },

    buttonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    buttonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
    },

    buttonPrimaryPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
});
