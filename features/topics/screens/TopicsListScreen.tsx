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

import React, { memo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ProfileButton } from '@/features/profile';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { Spacing, BorderRadius, useTheme } from '@/theme';
import { UsageIndicator } from '@/features/subscription';

import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { EditTopicModal } from '../components/EditTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';
import { StatsRow } from '../components/StatsRow';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicsListScreen = memo(function TopicsListScreen() {
    const logic = useTopicsList();
    const { colors } = useTheme();
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

            {/* Stats Cards + Search + Filters */}
            <View style={styles.statsContainer}>
                <StatsRow
                    topicsCount={logic.topicsCount}
                    totalSessions={logic.totalSessions}
                    streak={logic.streak}
                    streakActiveToday={logic.streakActiveToday}
                    streakAtRisk={logic.streakAtRisk}
                    yesterdayStreak={logic.yesterdayStreak}
                />

                {/* Usage Indicator */}
                <UsageIndicator />

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
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    statsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
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
