import React, { memo, useCallback, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/shared/components';
import { Spacing, BorderRadius, useTheme } from '@/theme';
import { StreakFlame } from '../StreakFlame';

// ═══════════════════════════════════════════════════════════════════════════
// KPI COLORS
// ═══════════════════════════════════════════════════════════════════════════

const KPI_COLORS = {
    topics: {
        icon: '#34C759',
        background: 'rgba(52, 199, 89, 0.12)',
    },
    sessions: {
        icon: '#007AFF',
        background: 'rgba(0, 122, 255, 0.12)',
    },
    streakActive: {
        icon: '#FF3B30',
        background: 'rgba(255, 59, 48, 0.12)',
    },
    streakAtRisk: {
        icon: '#9E9E9E',
        background: 'rgba(158, 158, 158, 0.12)',
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// STREAK ICON — Skia fire burst on focus, then stays red
// ═══════════════════════════════════════════════════════════════════════════

const StreakIcon = memo(function StreakIcon({
    active,
    atRisk,
    defaultColor,
}: {
    active: boolean;
    atRisk?: boolean;
    defaultColor: string;
}) {
    const [burstKey, setBurstKey] = useState(0);
    const [showBurst, setShowBurst] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (active && !atRisk) {
                setShowBurst(true);
                setBurstKey((k) => k + 1);
            }
        }, [active, atRisk]),
    );

    const iconColor = atRisk
        ? KPI_COLORS.streakAtRisk.icon
        : active
            ? KPI_COLORS.streakActive.icon
            : defaultColor;

    return (
        <View style={streakStyles.wrapper}>
            <MaterialCommunityIcons
                name="fire"
                size={18}
                color={iconColor}
            />
            {showBurst && !atRisk && (
                <View style={streakStyles.canvasWrapper}>
                    <StreakFlame
                        key={burstKey}
                        onDone={() => setShowBurst(false)}
                    />
                </View>
            )}
        </View>
    );
});

const streakStyles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
    },
    canvasWrapper: {
        position: 'absolute',
        bottom: -30,
        alignItems: 'center',
    },
});

// ═══════════════════════════════════════════════════════════════════════════
// STATS ROW PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface StatsRowProps {
    topicsCount: number;
    totalSessions: number;
    streak: number;
    streakActiveToday: boolean;
    streakAtRisk: boolean;
    yesterdayStreak: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const StatsRow = memo(function StatsRow({
    topicsCount,
    totalSessions,
    streak,
    streakActiveToday,
    streakAtRisk,
    yesterdayStreak,
}: StatsRowProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    // Streak warning bubble state
    const [streakWarningVisible, setStreakWarningVisible] = useState(false);
    const warningAnim = useRef(new Animated.Value(0)).current;
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismissStreakWarning = useCallback(() => {
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        Animated.timing(warningAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setStreakWarningVisible(false));
    }, []);

    const showStreakWarning = useCallback(() => {
        if (streakWarningVisible) {
            dismissStreakWarning();
            return;
        }
        setStreakWarningVisible(true);
        Animated.spring(warningAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
        warningTimerRef.current = setTimeout(() => {
            dismissStreakWarning();
        }, 4000);
    }, [streakWarningVisible]);

    return (
        <>
            <View style={styles.statsRow}>
                {/* Topics — Green */}
                <View style={styles.statCardWrapper}>
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: KPI_COLORS.topics.background }]}>
                            <MaterialCommunityIcons name="book-multiple" size={18} color={KPI_COLORS.topics.icon} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {topicsCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('topics.stats.topics')}</Text>
                    </GlassView>
                </View>

                {/* Sessions — Blue */}
                <View style={styles.statCardWrapper}>
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: KPI_COLORS.sessions.background }]}>
                            <MaterialCommunityIcons name="microphone" size={18} color={KPI_COLORS.sessions.icon} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {totalSessions}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('topics.stats.sessions')}</Text>
                    </GlassView>
                </View>

                {/* Streak — Dark by default, Red flame when active today, Grey ash when at risk */}
                <Pressable
                    style={styles.statCardWrapper}
                    onPress={streakAtRisk ? showStreakWarning : undefined}
                >
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[
                            styles.statIconContainer,
                            {
                                backgroundColor: streakAtRisk
                                    ? KPI_COLORS.streakAtRisk.background
                                    : streakActiveToday
                                        ? KPI_COLORS.streakActive.background
                                        : colors.surface.glass,
                            },
                        ]}>
                            <StreakIcon
                                active={streakActiveToday}
                                atRisk={streakAtRisk}
                                defaultColor={colors.text.primary}
                            />
                        </View>
                        <Text style={[
                            styles.statValue,
                            {
                                color: streakAtRisk
                                    ? KPI_COLORS.streakAtRisk.icon
                                    : streakActiveToday
                                        ? KPI_COLORS.streakActive.icon
                                        : colors.text.primary,
                            },
                        ]}>
                            {streakAtRisk ? yesterdayStreak : streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('topics.stats.streak')}</Text>
                    </GlassView>
                </Pressable>
            </View>

            {/* Streak warning bubble */}
            {streakWarningVisible && (
                <Pressable onPress={dismissStreakWarning}>
                    <Animated.View
                        style={[
                            styles.streakWarningBubble,
                            {
                                opacity: warningAnim,
                                transform: [{
                                    scale: warningAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1],
                                    }),
                                }],
                            },
                        ]}
                    >
                        <GlassView style={[styles.streakWarningContent, { borderColor: colors.glass.border }]}>
                            <MaterialCommunityIcons name="fire" size={18} color={KPI_COLORS.streakAtRisk.icon} />
                            <Text style={[styles.streakWarningText, { color: colors.text.primary }]}>
                                {t('topics.stats.streakWarning')}
                            </Text>
                        </GlassView>
                    </Animated.View>
                </Pressable>
            )}
        </>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    statCardWrapper: {
        flex: 1,
    },
    statCard: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        gap: Spacing.xs,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    streakWarningBubble: {
        marginBottom: Spacing.sm,
    },
    streakWarningContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        borderWidth: 1,
    },
    streakWarningText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
});
