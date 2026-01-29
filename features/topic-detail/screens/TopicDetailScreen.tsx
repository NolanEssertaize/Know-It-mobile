/**
 * @file TopicDetailScreen.tsx
 * @description Écran de détail d'un topic - Theme Aware
 *
 * FIXES:
 * - ADDED useTheme() hook for dynamic colors (fixes white mode bug)
 * - All colors now adapt to light/dark mode
 * - FAB button adapts to theme
 * - RefreshControl colors adapt to theme
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { Spacing, BorderRadius, useTheme } from '@/theme';

import { useTopicDetail } from '../hooks/useTopicDetail';
import type { SessionItemData } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicDetailScreen = memo(function TopicDetailScreen() {
    // ─────────────────────────────────────────────────────────────────────────
    // HOOKS - All hooks MUST be called before any conditional returns
    // ─────────────────────────────────────────────────────────────────────────
    const { topicId } = useLocalSearchParams<{ topicId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    const logic = useTopicDetail(topicId ?? '');

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS - Define ALL useCallback hooks BEFORE any returns
    // ─────────────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleStartSession = useCallback(() => {
        if (topicId) {
            router.push(`/${topicId}/session`);
        }
    }, [router, topicId]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS - Define ALL useCallback hooks BEFORE any returns
    // ─────────────────────────────────────────────────────────────────────────

    const renderHeader = useCallback(
        () => (
            <View>
                {/* Navigation header */}
                <View style={styles.navHeader}>
                    <Pressable
                        style={[
                            styles.backButton,
                            {
                                backgroundColor: colors.surface.glass,
                                borderColor: colors.glass.border,
                                borderWidth: 1,
                            }
                        ]}
                        onPress={handleBack}
                    >
                        <MaterialIcons
                            name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}
                            size={24}
                            color={colors.text.primary}
                        />
                    </Pressable>
                    <Text style={[styles.navTitle, { color: colors.text.primary }]} numberOfLines={1}>
                        {logic.topic?.title}
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Stats summary */}
                <View style={styles.statsSummary}>
                    <View style={[styles.statItem, { backgroundColor: colors.surface.glass, borderColor: colors.glass.border, borderWidth: 1, borderRadius: BorderRadius.md }]}>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>{logic.sessions.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Sessions</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.surface.glass, borderColor: colors.glass.border, borderWidth: 1, borderRadius: BorderRadius.md }]}>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.sessions.length > 0
                                ? Math.round(
                                    logic.sessions.reduce((acc, s) => {
                                        const valid = s.session.analysis?.valid?.length || 0;
                                        const total = valid + (s.session.analysis?.corrections?.length || 0) + (s.session.analysis?.missing?.length || 0);
                                        return acc + (total > 0 ? (valid / total) * 100 : 0);
                                    }, 0) / logic.sessions.length
                                )
                                : 0}
                            %
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Score Moyen</Text>
                    </View>
                </View>

                {/* Section header */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Historique</Text>
                </View>
            </View>
        ),
        [logic.topic, logic.sessions, handleBack, colors]
    );

    const renderSessionCard = useCallback(
        ({ item }: { item: SessionItemData }) => (
            <View style={styles.sessionCardWrapper}>
                <SessionHistoryCard
                    data={item}
                    onPress={() => logic.handleSessionPress(item.session.id)}
                />
            </View>
        ),
        [logic.handleSessionPress]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface.glass }]}>
                    <MaterialCommunityIcons
                        name="microphone-outline"
                        size={40}
                        color={colors.text.muted}
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Aucune session</Text>
                <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                    Commencez à enregistrer vos explications pour ce sujet
                </Text>
            </View>
        ),
        [colors]
    );

    const keyExtractor = useCallback((item: SessionItemData) => item.session.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.isLoading && !logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        Chargement...
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                <View style={styles.errorStateContainer}>
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={48}
                        color={colors.text.muted}
                    />
                    <Text style={[styles.errorText, { color: colors.text.secondary }]}>
                        Topic introuvable
                    </Text>
                    <GlassButton
                        title="Retour"
                        variant="primary"
                        onPress={handleBack}
                        style={styles.retryButton}
                    />
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            <FlatList
                data={logic.sessions}
                keyExtractor={keyExtractor}
                renderItem={renderSessionCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshSessions}
                        tintColor={colors.text.primary}
                        colors={[colors.text.primary]}
                    />
                }
            />

            {/* FAB - "Nouvelle Session" button - THEME AWARE */}
            <View style={styles.fabContainer}>
                <Pressable
                    onPress={handleStartSession}
                    style={({ pressed }) => [
                        styles.fabButton,
                        {
                            backgroundColor: colors.text.primary,
                            ...Platform.select({
                                ios: {
                                    shadowColor: isDark ? '#FFFFFF' : '#000000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                },
                                android: {
                                    elevation: 8,
                                },
                            }),
                        },
                        pressed && styles.fabButtonPressed,
                    ]}
                >
                    <MaterialCommunityIcons name="microphone" size={24} color={colors.text.inverse} />
                    <Text style={[styles.fabText, { color: colors.text.inverse }]}>Nouvelle Session</Text>
                </Pressable>
            </View>
        </ScreenWrapper>
    );
});

export default TopicDetailScreen;

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline with useTheme)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    // List content
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 120,
        flexGrow: 1,
    },

    // Navigation header
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: Spacing.md,
    },
    headerSpacer: {
        width: 40,
    },

    // Stats summary
    statsSummary: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.md,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: Spacing.xs,
    },

    // Section header
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: Spacing.xs,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        marginTop: Spacing.md,
    },

    // Error state
    errorStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    errorText: {
        fontSize: 16,
        marginTop: Spacing.md,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: Spacing.lg,
        minWidth: 160,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },

    // Session card wrapper
    sessionCardWrapper: {
        marginBottom: Spacing.md,
    },

    // FAB
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
        paddingTop: Spacing.md,
        backgroundColor: 'transparent',
    },
    fabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: BorderRadius.xl,
    },
    fabButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    fabText: {
        fontSize: 16,
        fontWeight: '600',
    },
});