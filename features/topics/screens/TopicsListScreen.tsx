/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets (Vue Dumb)
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
                    <Text style={styles.swipeHint}>Glissez pour plus d'options</Text>
                </View>
            </View>
        ),
        [logic.filteredTopics.length]
    );

    const renderTopic = useCallback(
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
        [logic.handleCardPress, logic.handleEdit, logic.handleShare, logic.handleDelete, logic.registerSwipeableRef, logic.unregisterSwipeableRef]
    );

    const renderEmpty = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                {logic.hasActiveFilters ? (
                    // État vide avec filtres actifs
                    <>
                        <MaterialCommunityIcons
                            name="filter-off-outline"
                            size={64}
                            color={GlassColors.text.tertiary}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>Aucun sujet avec ces filtres</Text>
                        <Text style={styles.emptySubtitle}>
                            Essayez de modifier vos critères de recherche
                        </Text>
                        <GlassButton
                            title="Réinitialiser les filtres"
                            variant="secondary"
                            size="md"
                            onPress={logic.resetFilters}
                            style={styles.resetButton}
                            icon={
                                <MaterialIcons
                                    name="refresh"
                                    size={18}
                                    color={GlassColors.text.primary}
                                />
                            }
                        />
                    </>
                ) : (
                    // État vide sans filtres (pas de sujets du tout)
                    <>
                        <MaterialCommunityIcons
                            name="book-open-page-variant-outline"
                            size={64}
                            color={GlassColors.text.tertiary}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>Aucun sujet</Text>
                        <Text style={styles.emptySubtitle}>
                            Créez votre premier sujet pour commencer à réviser
                        </Text>
                    </>
                )}
            </View>
        ),
        [logic.hasActiveFilters, logic.resetFilters]
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
                    <GlassView style={styles.statCard}>
                        <MaterialCommunityIcons
                            name="fire"
                            size={24}
                            color={GlassColors.semantic.warning}
                        />
                        <View>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                    </GlassView>
                </View>

                {/* Barre de recherche - Isolée pour éviter les re-renders */}
                <GlassView style={styles.searchContainer}>
                    <MaterialIcons
                        name="search"
                        size={22}
                        color={GlassColors.text.tertiary}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un sujet..."
                        placeholderTextColor={GlassColors.text.tertiary}
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                    {logic.searchText.length > 0 && (
                        <Pressable
                            onPress={() => logic.setSearchText('')}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialIcons
                                name="close"
                                size={20}
                                color={GlassColors.text.tertiary}
                            />
                        </Pressable>
                    )}
                </GlassView>

                {/* Catégories */}
                <CategoryFilter
                    selectedCategory={logic.selectedCategory}
                    onSelectCategory={logic.setSelectedCategory}
                />
            </View>

            {/* Liste */}
            <FlatList
                data={logic.filteredTopics}
                keyExtractor={keyExtractor}
                renderItem={renderTopic}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <View style={styles.fab}>
                <Pressable onPress={() => logic.setShowAddModal(true)}>
                    <LinearGradient
                        colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                        style={styles.fabGradient}
                    >
                        <MaterialIcons name="add" size={28} color="#FFFFFF" />
                    </LinearGradient>
                </Pressable>
            </View>

            {/* Modal d'ajout */}
            <AddTopicModal
                visible={logic.showAddModal}
                value={logic.newTopicText}
                onChangeText={logic.setNewTopicText}
                onSubmit={logic.handleAddTopic}
                onClose={() => logic.setShowAddModal(false)}
            />
        </ScreenWrapper>
    );
});