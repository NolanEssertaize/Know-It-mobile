/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets (Vue Dumb)
 *
 * FIX: Added loading state and pull-to-refresh support
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ProfileButton } from '@/features/profile';


import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';

import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';
import { styles } from './TopicsListScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicsListScreen = memo(function TopicsListScreen() {
    // Setup Hook - Logic Controller
    const logic = useTopicsList();

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    // Header de la liste (sans la barre de recherche pour éviter les re-renders)
    const renderListHeader = useCallback(
        () => (
            <View style={styles.listHeader}>
                {/* Titre de section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes Sujets</Text>
                    <Text style={styles.sectionCount}>
                        {logic.filteredTopics.length} sujets
                    </Text>
                </View>

                {/* Indication de swipe */}
                <View style={styles.swipeHintContainer}>
                    <MaterialIcons name="swipe" size={14} color={GlassColors.text.tertiary} />
                    <Text style={styles.swipeHint}>
                        Glissez pour plus d'options
                    </Text>
                </View>

                {/* Indicateur de filtres actifs */}
                {logic.hasActiveFilters && (
                    <Pressable onPress={logic.resetFilters} style={styles.activeFiltersBar}>
                        <Text style={styles.activeFiltersText}>
                            Filtres actifs
                        </Text>
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={16}
                            color={GlassColors.accent.primary}
                        />
                    </Pressable>
                )}
            </View>
        ),
        [logic.filteredTopics.length, logic.hasActiveFilters, logic.resetFilters]
    );

    // Render topic card
    const renderTopicCard = useCallback(
        ({ item }: { item: TopicItemData }) => (
            <TopicCard
                data={item}
                onPress={() => logic.handleCardPress(item.topic.id)}
                onEdit={() => logic.handleEdit(item.topic.id)}
                onShare={() => logic.handleShare(item.topic.id)}
                onDelete={() => logic.handleDelete(item.topic.id)}
                registerRef={(ref) => logic.registerSwipeableRef(item.topic.id, ref)}
                unregisterRef={() => logic.unregisterSwipeableRef(item.topic.id)}
            />
        ),
        [
            logic.handleCardPress,
            logic.handleEdit,
            logic.handleShare,
            logic.handleDelete,
            logic.registerSwipeableRef,
            logic.unregisterSwipeableRef,
        ]
    );

    // Empty state component
    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                {logic.isLoading ? (
                    <>
                        <ActivityIndicator
                            size="large"
                            color={GlassColors.accent.primary}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>Chargement...</Text>
                        <Text style={styles.emptySubtitle}>
                            Synchronisation de vos sujets
                        </Text>
                    </>
                ) : logic.error ? (
                    <>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={64}
                            color={GlassColors.semantic.error}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>Erreur</Text>
                        <Text style={styles.emptySubtitle}>{logic.error}</Text>
                        <GlassButton
                            title="Réessayer"
                            onPress={logic.refreshTopics}
                            variant="primary"
                            style={styles.retryButton}
                        />
                    </>
                ) : logic.hasActiveFilters ? (
                    <>
                        <MaterialCommunityIcons
                            name="magnify-close"
                            size={64}
                            color={GlassColors.text.tertiary}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>Aucun résultat</Text>
                        <Text style={styles.emptySubtitle}>
                            Aucun sujet ne correspond à votre recherche
                        </Text>
                        <GlassButton
                            title="Effacer les filtres"
                            onPress={logic.resetFilters}
                            variant="secondary"
                            style={styles.retryButton}
                        />
                    </>
                ) : (
                    <>
                        <LinearGradient
                            colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                            style={styles.emptyIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons
                                name="book-plus-multiple"
                                size={64}
                                color={GlassColors.text.primary}
                            />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>Commencez à apprendre</Text>
                        <Text style={styles.emptySubtitle}>
                            Créez votre premier sujet pour démarrer vos révisions
                        </Text>
                    </>
                )}
            </View>
        ),
        [logic.isLoading, logic.error, logic.hasActiveFilters, logic.resetFilters, logic.refreshTopics]
    );

    const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            {/* Header fixe (ne se re-render pas avec la liste) */}
            <View style={styles.fixedHeader}>
                {/* Salutation */}
                <View style={styles.greetingSection}>
                    <View style={styles.greetingLeft}>
                        <View style={styles.greetingRow}>
                            <Text style={styles.greeting}>{logic.greeting}</Text>
                            <MaterialCommunityIcons
                                name="hand-wave"
                                size={28}
                                color={GlassColors.semantic.warning}
                            />
                        </View>
                        <Text style={styles.subtitle}>Prêt à réviser ?</Text>
                        <ProfileButton initials="Me" />
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <GlassView style={styles.statCard}>
                        <MaterialCommunityIcons
                            name="book-multiple"
                            size={24}
                            color={GlassColors.accent.primary}
                        />
                        <View>
                            <Text style={styles.statNumber}>{logic.topicsCount}</Text>
                            <Text style={styles.statLabel}>Sujets</Text>
                        </View>
                    </GlassView>
                    <GlassView style={styles.statCard}>
                        <MaterialCommunityIcons
                            name="microphone"
                            size={24}
                            color={GlassColors.semantic.success}
                        />
                        <View>
                            <Text style={styles.statNumber}>{logic.totalSessions}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                    </GlassView>
                </View>

                {/* Recherche */}
                <GlassView style={styles.searchContainer}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={22}
                        color={GlassColors.text.tertiary}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un sujet..."
                        placeholderTextColor={GlassColors.text.tertiary}
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
                    />
                    {logic.searchText.length > 0 && (
                        <Pressable onPress={() => logic.setSearchText('')}>
                            <MaterialCommunityIcons
                                name="close-circle"
                                size={20}
                                color={GlassColors.text.tertiary}
                            />
                        </Pressable>
                    )}
                </GlassView>

                {/* Filtres par catégorie */}
                <CategoryFilter
                    selectedCategory={logic.selectedCategory}
                    onSelectCategory={logic.setSelectedCategory}
                />
            </View>

            {/* Liste des topics avec pull-to-refresh */}
            <FlatList
                data={logic.filteredTopics}
                keyExtractor={keyExtractor}
                renderItem={renderTopicCard}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshTopics}
                        tintColor={GlassColors.accent.primary}
                        colors={[GlassColors.accent.primary]}
                    />
                }
            />

            {/* FAB pour ajouter un topic */}
            <Pressable
                style={styles.fabContainer}
                onPress={() => logic.setShowAddModal(true)}
            >
                <LinearGradient
                    colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <MaterialCommunityIcons
                        name="plus"
                        size={28}
                        color={GlassColors.text.primary}
                    />
                </LinearGradient>
            </Pressable>

            {/* Modal d'ajout */}
            <AddTopicModal
                visible={logic.showAddModal}
                onClose={() => logic.setShowAddModal(false)}
                onSubmit={logic.handleAddTopic}
                value={logic.newTopicText}
                onChangeText={logic.setNewTopicText}
            />
        </ScreenWrapper>
    );
});