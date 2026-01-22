/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo, useCallback } from 'react';
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
import { ProfileButton } from '@/features/profile';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { Spacing, BorderRadius, useTheme } from '@/theme';

import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicsListScreen = memo(function TopicsListScreen() {
    const logic = useTopicsList();
    const { colors, isDark } = useTheme();

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderListHeader = useCallback(
        () => (
            <View style={styles.listHeader}>
                {/* Titre de section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                        Mes Sujets
                    </Text>
                    <Text style={[styles.sectionCount, { color: colors.text.muted }]}>
                        {logic.filteredTopics.length} sujets
                    </Text>
                </View>

                {/* Indication de swipe */}
                <View style={styles.swipeHintContainer}>
                    <MaterialIcons name="swipe" size={14} color={colors.text.muted} />
                    <Text style={[styles.swipeHint, { color: colors.text.muted }]}>
                        Glissez pour plus d'options
                    </Text>
                </View>

                {/* Indicateur de filtres actifs */}
                {logic.hasActiveFilters && (
                    <Pressable 
                        onPress={logic.resetFilters} 
                        style={[styles.activeFiltersBar, { backgroundColor: colors.surface.glass }]}
                    >
                        <Text style={[styles.activeFiltersText, { color: colors.text.primary }]}>
                            Filtres actifs
                        </Text>
                        <MaterialCommunityIcons name="close-circle" size={16} color={colors.text.primary} />
                    </Pressable>
                )}
            </View>
        ),
        [logic.filteredTopics.length, logic.hasActiveFilters, logic.resetFilters, colors]
    );

    const renderItem = useCallback(
        ({ item }: { item: TopicItemData }) => (
            <TopicCard
                data={item}
                onPress={() => logic.handleTopicPress(item.id)}
                onEdit={() => logic.handleEditTopic(item.id)}
                onShare={() => logic.handleShareTopic(item.id)}
                onDelete={() => logic.handleDeleteTopic(item.id)}
            />
        ),
        [logic.handleTopicPress, logic.handleEditTopic, logic.handleShareTopic, logic.handleDeleteTopic]
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
                    Aucun sujet trouvé
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
                    {logic.hasActiveFilters
                        ? 'Essayez de modifier vos filtres'
                        : 'Créez votre premier sujet pour commencer'}
                </Text>
                {!logic.hasActiveFilters && (
                    <Pressable
                        style={[styles.emptyButton, { backgroundColor: colors.text.primary }]}
                        onPress={logic.openAddModal}
                    >
                        <MaterialIcons name="add" size={20} color={colors.text.inverse} />
                        <Text style={[styles.emptyButtonText, { color: colors.text.inverse }]}>
                            Créer un sujet
                        </Text>
                    </Pressable>
                )}
            </View>
        ),
        [logic.hasActiveFilters, logic.openAddModal, colors]
    );

    const keyExtractor = useCallback((item: TopicItemData) => item.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper scrollable={false} padding={0}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.text.secondary }]}>
                        Bonjour 👋
                    </Text>
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        Prêt à apprendre ?
                    </Text>
                </View>
                <ProfileButton />
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.surface.glass }]}>
                            <MaterialCommunityIcons name="book-multiple" size={22} color={colors.text.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.topicsCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>Sujets</Text>
                    </GlassView>

                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.surface.glass }]}>
                            <MaterialCommunityIcons name="microphone" size={22} color={colors.text.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.totalSessions}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>Sessions</Text>
                    </GlassView>

                    <GlassView style={[styles.statCard, { borderColor: colors.glass.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.surface.glass }]}>
                            <MaterialCommunityIcons name="fire" size={22} color={colors.text.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>Streak</Text>
                    </GlassView>
                </View>

                {/* Recherche */}
                <GlassView style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={22} color={colors.text.muted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text.primary }]}
                        placeholder="Rechercher un sujet..."
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
                            refreshing={logic.isRefreshing}
                            onRefresh={logic.refresh}
                            tintColor={colors.text.primary}
                            colors={[colors.text.primary]}
                        />
                    }
                />
            )}

            {/* FAB - Theme Aware */}
            <View style={styles.fabContainer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.fab,
                        { backgroundColor: colors.text.primary },
                        pressed && styles.fabPressed,
                    ]}
                    onPress={logic.openAddModal}
                >
                    <MaterialIcons name="add" size={28} color={colors.text.inverse} />
                </Pressable>
            </View>

            {/* Add Topic Modal */}
            <AddTopicModal
                visible={logic.isAddModalVisible}
                onClose={logic.closeAddModal}
                onSubmit={logic.handleCreateTopic}
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
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 16,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
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
});

export default TopicsListScreen;
