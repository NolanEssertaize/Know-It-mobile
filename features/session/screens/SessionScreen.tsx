/**
 * @file SessionScreen.tsx
 * @description Écran d'enregistrement vocal avec animation réactive
 * Version mise à jour avec VoiceRecordButton et useAudioRecording
 *
 * MODIFICATIONS:
 * - Émojis remplacés par des icônes Material
 * - Barre de niveau audio simplifiée (blanc uniquement)
 * - Suppression des mots qui changent selon l'intensité
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenWrapper } from '@/shared/components';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

import { VoiceRecordButton } from '../components/VoiceRecordButton';
import { useSessionWithAudio } from '../hooks/useSessionWithAudio';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionScreen = memo(function SessionScreen() {
    // Setup Hook - Logic Controller
    const logic = useSessionWithAudio();
    const insets = useSafeAreaInsets();

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const formatDuration = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Topic not found
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <ScreenWrapper centered>
                <Text style={styles.errorText}>Topic introuvable</Text>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea={false} padding={0}>
            <LinearGradient
                colors={[GlassColors.gradient.start, GlassColors.gradient.middle, GlassColors.gradient.end]}
                style={styles.gradient}
            >
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable style={styles.closeButton} onPress={logic.handleClose}>
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={GlassColors.text.primary}
                            />
                        </Pressable>
                        <Text style={styles.topicTitle} numberOfLines={1}>
                            {logic.topic.title}
                        </Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Main Content */}
                    <View style={styles.content}>
                        {/* État d'analyse */}
                        {logic.isAnalyzing ? (
                            <View style={styles.analyzingContainer}>
                                <ActivityIndicator size="large" color={GlassColors.accent.primary} />
                                <Text style={styles.analyzingText}>Analyse en cours...</Text>
                                <Text style={styles.analyzingHint}>
                                    Nous transcrivons et analysons votre réponse
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Status Text - Icône Material au lieu d'émoji */}
                                <View style={styles.statusContainer}>
                                    <View style={styles.statusRow}>
                                        {logic.isRecording && (
                                            <MaterialIcons
                                                name="fiber-manual-record"
                                                size={16}
                                                color={GlassColors.semantic.error}
                                                style={styles.recordingIcon}
                                            />
                                        )}
                                        <Text style={styles.statusText}>
                                            {logic.isRecording ? 'Enregistrement...' : 'Prêt à enregistrer'}
                                        </Text>
                                    </View>
                                    <Text style={styles.statusHint}>
                                        {logic.isRecording
                                            ? 'Expliquez le sujet avec vos mots'
                                            : 'Appuyez sur le bouton pour commencer'}
                                    </Text>
                                </View>

                                {/* Duration Timer */}
                                {logic.isRecording && (
                                    <View style={styles.timerContainer}>
                                        <View style={styles.timerDot} />
                                        <Text style={styles.timerText}>
                                            {formatDuration(logic.duration)}
                                        </Text>
                                    </View>
                                )}

                                {/* Voice Record Button avec Animation */}
                                <View style={styles.recordButtonContainer}>
                                    <VoiceRecordButton
                                        isRecording={logic.isRecording}
                                        audioLevel={logic.audioLevel}
                                        onPress={logic.toggleRecording}
                                        size={120}
                                    />
                                </View>

                                {/* Audio Level Indicator - SIMPLIFIÉ: Barre blanche uniquement */}
                                {logic.isRecording && (
                                    <View style={styles.levelIndicatorContainer}>
                                        {/* Label */}
                                        <View style={styles.levelLabelRow}>
                                            <Text style={styles.levelLabel}>NIVEAU AUDIO</Text>
                                            <Text style={styles.levelPercentage}>
                                                {Math.round(logic.audioLevel * 100)}%
                                            </Text>
                                        </View>

                                        {/* Barre de progression blanche */}
                                        <View style={styles.levelBarBackground}>
                                            <View
                                                style={[
                                                    styles.levelBarFill,
                                                    { width: `${Math.max(5, logic.audioLevel * 100)}%` }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Afficher l'erreur si présente */}
                                {logic.error && (
                                    <View style={styles.errorContainer}>
                                        <MaterialIcons name="error-outline" size={20} color={GlassColors.semantic.error} />
                                        <Text style={styles.errorMessage}>{logic.error}</Text>
                                    </View>
                                )}

                                {/* Instructions - Icône Material au lieu d'émoji */}
                                {!logic.isRecording && (
                                    <View style={styles.instructionsContainer}>
                                        <View style={styles.instructionRow}>
                                            <MaterialIcons
                                                name="lightbulb-outline"
                                                size={18}
                                                color={GlassColors.text.secondary}
                                                style={styles.instructionIcon}
                                            />
                                            <Text style={styles.instructionText}>
                                                Conseil: Parlez clairement et à un rythme normal
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topicTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: GlassColors.text.primary,
        textAlign: 'center',
        marginHorizontal: Spacing.md,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    recordingIcon: {
        marginRight: Spacing.xs,
    },
    statusText: {
        fontSize: 22,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    statusHint: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    timerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: GlassColors.semantic.error,
        marginRight: Spacing.sm,
    },
    timerText: {
        fontSize: 32,
        fontWeight: '300',
        color: GlassColors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    recordButtonContainer: {
        marginVertical: Spacing.xl,
    },
    // ═══════════════════════════════════════════════════════════════
    // INDICATEUR DE NIVEAU AUDIO - STYLES SIMPLIFIÉS (BLANC)
    // ═══════════════════════════════════════════════════════════════
    levelIndicatorContainer: {
        width: '100%',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: GlassColors.glass.backgroundDark,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.md,
    },
    levelLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: GlassColors.text.tertiary,
        letterSpacing: 1,
    },
    levelPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: GlassColors.text.primary,
    },
    levelBarBackground: {
        height: 16,
        backgroundColor: GlassColors.glass.background,
        borderRadius: 8,
        overflow: 'hidden',
    },
    levelBarFill: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#FFFFFF', // Barre blanche uniquement
    },
    // ═══════════════════════════════════════════════════════════════
    analyzingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: '600',
        color: GlassColors.text.primary,
        marginTop: Spacing.lg,
    },
    analyzingHint: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GlassColors.semantic.errorGlow,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
    },
    errorMessage: {
        color: GlassColors.semantic.error,
        fontSize: 14,
        marginLeft: Spacing.sm,
    },
    instructionsContainer: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instructionIcon: {
        marginRight: Spacing.xs,
    },
    instructionText: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: GlassColors.text.primary,
    },
});

export default SessionScreen;