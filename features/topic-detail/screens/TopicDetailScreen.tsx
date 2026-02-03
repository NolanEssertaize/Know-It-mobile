/**
 * @file TopicDetailScreen.tsx
 * @description Écran de détail d'un topic - Theme Aware + i18n
 *
 * MERGED:
 * - MAIN branch: All logic, styles, component structure preserved
 * - i18nV2 branch: Translation hooks injected for all hardcoded strings
 *
 * FIXES:
 * - ADDED useTheme() hook for dynamic colors (fixes white mode bug)
 * - All colors now adapt to light/dark mode
 * - FAB button adapts to theme
 * - RefreshControl colors adapt to theme
 * - i18n translations for all user-facing strings
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet, Platform, TextInput, Modal, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();

    const logic = useTopicDetail(topicId ?? '');

    // ─────────────────────────────────────────────────────────────────────────
    // CALLBACKS
    // ─────────────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleStartSession = useCallback(() => {
        if (topicId) {
            router.push(`/${topicId}/session`);
        }
    }, [topicId, router]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const renderHeader = useCallback(
        () => (
            <View style={styles.headerContent}>
                {/* Topic Info Card */}
                <GlassView style={styles.topicCard} variant="elevated">
                    <View style={styles.topicCardInner}>
                        <View style={[styles.topicIconContainer, { backgroundColor: colors.surface.glass }]}>
                            <MaterialCommunityIcons
                                name="book-open-variant"
                                size={32}
                                color={colors.text.primary}
                            />
                        </View>
                        <Text style={[styles.topicTitle, { color: colors.text.primary }]} numberOfLines={2}>
                            {logic.topic?.title || t('common.loading', 'Chargement...')}
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="microphone" size={18} color={colors.text.muted} />
                            <Text style={[styles.statValue, { color: colors.text.primary }]}>
                                {logic.sessions.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                                {t('topicDetail.sessions', 'Sessions')}
                            </Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.glass.border }]} />
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="chart-line" size={18} color={colors.text.muted} />
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
                            <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                                {t('topicDetail.avgScore', 'Score Moyen')}
                            </Text>
                        </View>
                    </View>
                </GlassView>

                {/* Section header */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                        {t('topicDetail.history', 'Historique')}
                    </Text>
                </View>
            </View>
        ),
        [logic.topic, logic.sessions, colors, t]
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
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    {t('topicDetail.empty.title', 'Aucune session')}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                    {t('topicDetail.empty.description', 'Commencez votre première session de pratique')}
                </Text>
            </View>
        ),
        [colors, t]
    );

    const keyExtractor = useCallback((item: SessionItemData) => item.session.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // EARLY RETURNS (after hooks)
    // ─────────────────────────────────────────────────────────────────────────

    // Loading state
    if (logic.isLoading && !logic.topic) {
        return (
            <ScreenWrapper scrollable={false} padding={0}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.muted }]}>
                        {t('common.loading', 'Chargement...')}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // Error state
    if (logic.error && !logic.topic) {
        return (
            <ScreenWrapper scrollable={false} padding={0}>
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.text.muted} />
                    <Text style={[styles.errorText, { color: colors.text.primary }]}>
                        {logic.error}
                    </Text>
                    <Pressable
                        style={[styles.retryButton, { backgroundColor: colors.text.primary }]}
                        onPress={handleBack}
                    >
                        <Text style={[styles.retryButtonText, { color: colors.text.inverse }]}>
                            {t('common.goBack', 'Retour')}
                        </Text>
                    </Pressable>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper scrollable={false} padding={0}>
            {/* Navigation Header */}
            <View style={styles.navHeader}>
                <Pressable style={[styles.backButton, { backgroundColor: colors.surface.glass }]} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={[styles.navTitle, { color: colors.text.primary }]} numberOfLines={1}>
                    {logic.topic?.title}
                </Text>
                <Pressable
                    style={[styles.editButton, { backgroundColor: colors.surface.glass }]}
                    onPress={logic.showEditModal}
                >
                    <MaterialIcons name="edit" size={20} color={colors.text.primary} />
                </Pressable>
            </View>

            {/* Sessions List */}
            <FlatList
                data={logic.sessions}
                renderItem={renderSessionCard}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshTopic}
                        tintColor={colors.text.primary}
                        colors={[colors.text.primary]}
                    />
                }
            />

            {/* FAB - Start Session */}
            <View style={[styles.fabContainer, { bottom: insets.bottom + 16 }]}>
                <Pressable
                    style={({ pressed }) => [
                        styles.fab,
                        { backgroundColor: colors.text.primary },
                        pressed && styles.fabPressed,
                    ]}
                    onPress={handleStartSession}
                >
                    <MaterialCommunityIcons name="microphone" size={28} color={colors.text.inverse} />
                </Pressable>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={logic.isEditModalVisible}
                transparent
                animationType="fade"
                onRequestClose={logic.hideEditModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Pressable style={styles.modalOverlay} onPress={logic.hideEditModal}>
                        <Pressable
                            style={[styles.modalContent, { backgroundColor: colors.background.primary }]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                                {t('topicDetail.edit.title', 'Modifier le sujet')}
                            </Text>
                            <GlassView style={styles.modalInputContainer} showBorder>
                                <TextInput
                                    style={[styles.modalInput, { color: colors.text.primary }]}
                                    placeholder={t('topicDetail.edit.placeholder', 'Nom du sujet')}
                                    placeholderTextColor={colors.text.muted}
                                    value={logic.editTitle}
                                    onChangeText={logic.setEditTitle}
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={logic.handleUpdateTitle}
                                />
                            </GlassView>
                            <View style={styles.modalButtons}>
                                <Pressable
                                    style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.glass.border }]}
                                    onPress={logic.hideEditModal}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.text.secondary }]}>
                                        {t('common.cancel', 'Annuler')}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: colors.text.primary }]}
                                    onPress={logic.handleUpdateTitle}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.text.inverse }]}>
                                        {t('common.save', 'Enregistrer')}
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    // Navigation Header
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
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
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Header Content
    headerContent: {
        paddingBottom: Spacing.md,
    },
    topicCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
    },
    topicCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    topicIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    topicTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Section Header
    sectionHeader: {
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // List
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    sessionCardWrapper: {
        marginBottom: Spacing.md,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
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
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
    },

    // Loading & Error States
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // FAB
    fabContainer: {
        position: 'absolute',
        right: Spacing.lg,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    fabPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 400,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    modalInputContainer: {
        marginBottom: Spacing.lg,
    },
    modalInput: {
        fontSize: 16,
        padding: Spacing.md,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonCancel: {
        borderWidth: 1,
    },
    modalButtonSave: {},
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TopicDetailScreen;