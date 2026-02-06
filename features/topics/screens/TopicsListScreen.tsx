/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets - Theme Aware
 *
 * FIXED: 
 * - All colors now use useTheme() hook
 * - Correct prop names for AddTopicModal (value, onChangeText, etc.)
 * - Correct prop names for TopicCard (registerRef, unregisterRef)
 * - Correct method names from hook (handleCardPress, handleEdit, etc.)
 * - Correct keyExtractor using item.topic.id
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Platform,
    StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ProfileButton } from '@/features/profile';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { Spacing, BorderRadius, useTheme } from '@/theme';
import { StreakFlame } from '../components/StreakFlame';

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
};

// ═══════════════════════════════════════════════════════════════════════════
// STREAK ICON — Skia fire burst on focus, then stays red
// ═══════════════════════════════════════════════════════════════════════════

const StreakIcon = memo(function StreakIcon({
    active,
    defaultColor,
}: {
    active: boolean;
    defaultColor: string;
}) {
    const [burstKey, setBurstKey] = useState(0);
    const [showBurst, setShowBurst] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (active) {
                setShowBurst(true);
                setBurstKey((k) => k + 1);
            }
        }, [active]),
    );

    return (
        <View style={streakStyles.wrapper}>
            {/* Static icon — always rendered underneath */}
            <MaterialCommunityIcons
                name="fire"
                size={22}
                color={active ? KPI_COLORS.streakActive.icon : defaultColor}
            />
            {/* Skia flame overlay — covers the icon during animation */}
            {showBurst && (
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
        width: 40,
        height: 40,
    },
    canvasWrapper: {
        position: 'absolute',
        bottom: -30,
        alignItems: 'center',
    },
});

import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { EditTopicModal } from '../components/EditTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicsListScreen = memo(function TopicsListScreen() {
    const logic = useTopicsList();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const params = useLocalSearchParams<{ showAddModal?: string }>();
    const router = useRouter();

    // Handle showAddModal param from tab bar + button
    useEffect(() => {
        if (params.showAddModal === 'true') {
            logic.setShowAddModal(true);
            // Clear the param to prevent re-opening on re-render
            router.setParams({ showAddModal: undefined });
        }
    }, [params.showAddModal]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderListHeader = useCallback(
        () => (
            <View style={styles.listHeader}>
                {/* Titre de section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                        {t('topics.myTopics')}
                    </Text>
                    <Text style={[styles.sectionCount, { color: colors.text.muted }]}>
                        {t('topics.topicsCount', { count: logic.filteredTopics.length })}
                    </Text>
                </View>

                {/* Indication de swipe */}
                <View style={styles.swipeHintContainer}>
                    <MaterialIcons name="swipe" size={14} color={colors.text.muted} />
                    <Text style={[styles.swipeHint, { color: colors.text.muted }]}>
                        {t('topics.swipeHint')}
                    </Text>
                </View>

                {/* Indicateur de filtres actifs */}
                {logic.hasActiveFilters && (
                    <Pressable
                        onPress={logic.resetFilters}
                        style={[styles.activeFiltersBar, { backgroundColor: colors.surface.glass }]}
                    >
                        <Text style={[styles.activeFiltersText, { color: colors.text.primary }]}>
                            {t('topics.activeFilters')}
                        </Text>
                        <MaterialCommunityIcons name="close-circle" size={16} color={colors.text.primary} />
                    </Pressable>
                )}
            </View>
        ),
        [logic.filteredTopics.length, logic.hasActiveFilters, logic.resetFilters, colors, t]
    );

    // FIX: Use correct method names and pass registerRef/unregisterRef
    const renderItem = useCallback(
        ({ item }: { item: TopicItemData }) => (
            <TopicCard
                data={item}
                onPress={() => logic.handleCardPress(item.topic.id)}
                onEdit={() => logic.handleEdit(item.topic.id)}
                onFavorite={() => logic.handleFavorite(item.topic.id)}
                onDelete={() => logic.handleDelete(item.topic.id)}
                registerRef={(ref) => logic.registerSwipeableRef(item.topic.id, ref)}
                unregisterRef={() => logic.unregisterSwipeableRef(item.topic.id)}
            />
        ),
        [
            logic.handleCardPress,
            logic.handleEdit,
            logic.handleFavorite,
            logic.handleDelete,
            logic.registerSwipeableRef,
            logic.unregisterSwipeableRef
        ]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface.glass }]}>
                    <MaterialCommunityIcons
                        name="book-plus"
                        size={48}
                        color={colors.text.primary}
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    {t('topics.empty.title')}
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
                    {logic.hasActiveFilters
                        ? t('topics.empty.descriptionWithFilters')
                        : t('topics.empty.description')}
                </Text>
                {!logic.hasActiveFilters && (
                    <Pressable
                        style={[styles.emptyButton, { backgroundColor: colors.text.primary }]}
                        onPress={() => logic.setShowAddModal(true)}
                    >
                        <MaterialIcons name="add" size={20} color={colors.text.inverse} />
                        <Text style={[styles.emptyButtonText, { color: colors.text.inverse }]}>
                            {t('topics.empty.createButton')}
                        </Text>
                    </Pressable>
                )}
            </View>
        ),
        [logic.hasActiveFilters, logic.setShowAddModal, colors, t]
    );

    // FIX: Use item.topic.id for unique key
    const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper scrollable={false} padding={0}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        {t('topics.title')}
                    </Text>
                </View>
                <ProfileButton />
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    {/* Topics — Green */}
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: KPI_COLORS.topics.background }]}>
                            <MaterialCommunityIcons name="book-multiple" size={22} color={KPI_COLORS.topics.icon} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.topicsCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('topics.stats.topics')}</Text>
                    </GlassView>

                    {/* Sessions — Blue */}
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: KPI_COLORS.sessions.background }]}>
                            <MaterialCommunityIcons name="microphone" size={22} color={KPI_COLORS.sessions.icon} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.totalSessions}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('topics.stats.sessions')}</Text>
                    </GlassView>

                    {/* Streak — Dark by default, Red flame when active today */}
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[
                            styles.statIconContainer,
                            {
                                backgroundColor: logic.streakActiveToday
                                    ? KPI_COLORS.streakActive.background
                                    : colors.surface.glass,
                            },
                        ]}>
                            <StreakIcon
                                active={logic.streakActiveToday}
                                defaultColor={colors.text.primary}
                            />
                        </View>
                        <Text style={[
                            styles.statValue,
                            {
                                color: logic.streakActiveToday
                                    ? KPI_COLORS.streakActive.icon
                                    : colors.text.primary,
                            },
                        ]}>
                            {logic.streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>{t('topics.stats.streak')}</Text>
                    </GlassView>
                </View>

                {/* Recherche */}
                <GlassView style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={22} color={colors.text.muted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text.primary }]}
                        placeholder={t('topics.search.placeholder')}
                        placeholderTextColor={colors.text.muted}
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
                    />
                    {logic.searchText.length > 0 && (
                        <Pressable onPress={() => logic.setSearchText('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={colors.text.muted} />
                        </Pressable>
                    )}
                </GlassView>

                {/* Filtres par catégorie */}
                <CategoryFilter
                    selectedCategory={logic.selectedCategory}
                    onSelectCategory={logic.setSelectedCategory}
                />
            </View>

            {/* Loading State */}
            {logic.isLoading && logic.filteredTopics.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                </View>
            ) : (
                <FlatList
                    data={logic.filteredTopics}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={logic.isLoading}
                            onRefresh={logic.refreshTopics}
                            tintColor={colors.text.primary}
                            colors={[colors.text.primary]}
                        />
                    }
                />
            )}

            {/* Add Topic Modal - CORRECT PROPS matching AddTopicModal interface */}
            <AddTopicModal
                visible={logic.showAddModal}
                value={logic.newTopicText}
                onChangeText={logic.setNewTopicText}
                onSubmit={logic.handleAddTopic}
                onClose={() => logic.setShowAddModal(false)}
            />

            {/* Edit Topic Modal */}
            <EditTopicModal
                visible={logic.editingTopicId !== null}
                value={logic.editTopicText}
                onChangeText={logic.setEditTopicText}
                onSubmit={logic.handleEditSubmit}
                onClose={logic.handleEditCancel}
            />
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline with useTheme)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    greeting: {
        fontSize: 14,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    statsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        gap: Spacing.xs,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: Spacing.xs,
    },
    listHeader: {
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionCount: {
        fontSize: 12,
    },
    swipeHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.sm,
    },
    swipeHint: {
        fontSize: 12,
    },
    activeFiltersBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
        alignSelf: 'flex-start',
    },
    activeFiltersText: {
        fontSize: 12,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.xl,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TopicsListScreen;
