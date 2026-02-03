/**
 * @file SessionScreen.tsx
 * @description Écran d'enregistrement vocal - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';

import { VoiceRecordButton } from '../components/VoiceRecordButton';
import { useSessionWithAudio } from '../hooks/useSessionWithAudio';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionScreen = memo(function SessionScreen() {
    const logic = useSessionWithAudio();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const formatDuration = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Topic not found
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
                    <Text style={[styles.errorText, { color: colors.text.secondary }]}>
                        {t('errors.notFound')}
                    </Text>
                    <Pressable
                        style={[styles.closeButtonLarge, { backgroundColor: colors.text.primary }]}
                        onPress={handleClose}
                    >
                        <Text style={[styles.closeButtonText, { color: colors.text.inverse }]}>
                            {t('common.goBack')}
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ANALYZING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.isAnalyzing) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
                    <View style={styles.analyzingContainer}>
                        <ActivityIndicator size="large" color={colors.text.primary} />
                        <Text style={[styles.analyzingText, { color: colors.text.primary }]}>
                            {t('session.status.analyzing')}
                        </Text>
                        <Text style={[styles.analyzingHint, { color: colors.text.secondary }]}>
                            {t('session.analyzing')}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <Pressable
                        style={[styles.closeButton, { backgroundColor: colors.surface.glass, borderColor: colors.glass.borderLight }]}
                        onPress={handleClose}
                    >
                        <MaterialIcons name="close" size={24} color={colors.text.primary} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        {t('session.title')}
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Topic Badge */}
                    <GlassView style={styles.topicBadge}>
                        <Text style={[styles.topicTitle, { color: colors.text.primary }]}>
                            {logic.topic.title}
                        </Text>
                    </GlassView>

                    {/* Status */}
                    <View style={styles.statusContainer}>
                        <View style={styles.statusRow}>
                            {logic.isRecording && (
                                <View style={[styles.recordingDot, { backgroundColor: colors.text.primary }]} />
                            )}
                            <Text style={[styles.statusText, { color: colors.text.primary }]}>
                                {logic.isRecording ? t('session.status.recording') : t('session.status.idle')}
                            </Text>
                        </View>
                        <Text style={[styles.statusHint, { color: colors.text.secondary }]}>
                            {logic.isRecording
                                ? t('session.recording')
                                : t('session.ready')}
                        </Text>
                    </View>

                    {/* Duration Timer */}
                    {logic.isRecording && (
                        <View style={styles.timerContainer}>
                            <View style={[styles.timerDot, { backgroundColor: colors.text.primary }]} />
                            <Text style={[styles.timerText, { color: colors.text.primary }]}>
                                {formatDuration(logic.duration)}
                            </Text>
                        </View>
                    )}

                    {/* Voice Record Button */}
                    <View style={styles.recordButtonContainer}>
                        <VoiceRecordButton
                            isRecording={logic.isRecording}
                            audioLevel={logic.audioLevel}
                            onPress={logic.toggleRecording}
                            size={120}
                        />
                    </View>

                    {/* Audio Level Indicator */}
                    {logic.isRecording && (
                        <View style={styles.levelIndicatorContainer}>
                            <View style={styles.levelLabelRow}>
                                <Text style={[styles.levelLabel, { color: colors.text.secondary }]}>
                                    NIVEAU AUDIO
                                </Text>
                                <Text style={[styles.levelPercentage, { color: colors.text.primary }]}>
                                    {Math.round(logic.audioLevel * 100)}%
                                </Text>
                            </View>
                            <View style={[styles.levelBarBackground, { backgroundColor: colors.surface.glass }]}>
                                <View
                                    style={[
                                        styles.levelBarFill,
                                        {
                                            width: `${Math.min(logic.audioLevel * 100, 100)}%`,
                                            backgroundColor: colors.text.primary,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    {/* Instructions */}
                    {!logic.isRecording && (
                        <View style={styles.instructionsContainer}>
                            <View style={styles.instructionRow}>
                                <MaterialIcons 
                                    name="info-outline" 
                                    size={16} 
                                    color={colors.text.muted} 
                                    style={styles.instructionIcon} 
                                />
                                <Text style={[styles.instructionText, { color: colors.text.muted }]}>
                                    Parlez clairement et expliquez le sujet comme si vous l'enseigniez à quelqu'un
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    topicBadge: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.sm,
    },
    statusText: {
        fontSize: 24,
        fontWeight: '700',
    },
    statusHint: {
        fontSize: 14,
        textAlign: 'center',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    timerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.sm,
    },
    timerText: {
        fontSize: 32,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    recordButtonContainer: {
        marginBottom: Spacing.xxl,
    },
    levelIndicatorContainer: {
        width: '100%',
        maxWidth: 280,
        marginBottom: Spacing.xl,
    },
    levelLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    levelPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    levelBarBackground: {
        height: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    levelBarFill: {
        height: '100%',
        borderRadius: 8,
    },
    analyzingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: Spacing.lg,
    },
    analyzingHint: {
        fontSize: 14,
        marginTop: Spacing.sm,
        textAlign: 'center',
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
        textAlign: 'center',
        flex: 1,
    },
    errorText: {
        fontSize: 16,
        marginBottom: Spacing.lg,
    },
    closeButtonLarge: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SessionScreen;
