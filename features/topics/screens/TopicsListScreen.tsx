/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets (Vue Dumb)
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView } from '@/shared/components';
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

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        {/* Salutation */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingLeft}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{logic.greeting}</Text>
              <Text style={styles.wave}>👋</Text>
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
            <Text style={styles.statNumber}>{logic.topicsCount}</Text>
            <Text style={styles.statLabel}>Sujets</Text>
          </GlassView>
          <GlassView style={styles.statCard}>
            <MaterialCommunityIcons
              name="microphone"
              size={24}
              color={GlassColors.semantic.success}
            />
            <Text style={styles.statNumber}>{logic.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </GlassView>
          <GlassView style={styles.statCard}>
            <MaterialCommunityIcons
              name="fire"
              size={24}
              color={GlassColors.semantic.warning}
            />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </GlassView>
        </View>

        {/* Barre de recherche */}
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
          />
          {logic.searchText.length > 0 && (
            <Pressable onPress={() => logic.setSearchText('')}>
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

        {/* Titre de section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Sujets</Text>
          <Text style={styles.sectionCount}>
            {logic.filteredTopics.length} sujets
          </Text>
        </View>

        {/* Indication de swipe */}
        <Text style={styles.swipeHint}>← Glissez pour plus d'options</Text>
      </View>
    ),
    [logic]
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
    [logic]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>Aucun sujet</Text>
        <Text style={styles.emptySubtitle}>
          Créez votre premier sujet pour commencer à réviser
        </Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper useSafeArea padding={0}>
      {/* Liste */}
      <FlatList
        data={logic.filteredTopics}
        keyExtractor={keyExtractor}
        renderItem={renderTopic}
        ListHeaderComponent={renderHeader}
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
