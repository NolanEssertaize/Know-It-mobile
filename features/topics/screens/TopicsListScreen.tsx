/**
 * @file TopicsListScreen.tsx
 * @description Main topics list screen with search, stats, and topic cards
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import { useTopicsList, CATEGORIES } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';
import type { TopicItemData } from '@/types';

export function TopicsListScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const {
    // Data
    filteredTopics,
    stats,
    isLoading,
    error,
    // Search
    searchQuery,
    setSearchQuery,
    // Filters
    selectedCategory,
    setSelectedCategory,
    // Modal
    isAddModalVisible,
    setIsAddModalVisible,
    newTopicTitle,
    setNewTopicTitle,
    isAddingTopic,
    // Actions
    handleAddTopic,
    handleCardPress,
    handleEdit,
    handleShare,
    handleDelete,
    registerSwipeableRef,
    unregisterSwipeableRef,
    refreshTopics,
  } = useTopicsList();

  const renderTopicCard = useCallback(
    ({ item }: { item: TopicItemData }) => (
      <TopicCard
        data={item}
        onPress={() => handleCardPress(item.topic.id)}
        onEdit={() => handleEdit(item.topic.id)}
        onShare={() => handleShare(item.topic.id)}
        onDelete={() => handleDelete(item.topic.id)}
        registerRef={(ref) => registerSwipeableRef(item.topic.id, ref)}
        unregisterRef={() => unregisterSwipeableRef(item.topic.id)}
      />
    ),
    [handleCardPress, handleEdit, handleShare, handleDelete, registerSwipeableRef, unregisterSwipeableRef]
  );

  const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

  const ListHeader = (
    <>
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <GlassView style={styles.statCard} padding="md" radius="lg">
          <MaterialIcons name="book" size={24} color={colors.accent.primary} />
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {stats.topicsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>
            {t('topics.stats.topics')}
          </Text>
        </GlassView>

        <GlassView style={styles.statCard} padding="md" radius="lg">
          <MaterialIcons name="mic" size={24} color={colors.accent.secondary} />
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {stats.sessionsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>
            {t('topics.stats.sessions')}
          </Text>
        </GlassView>

        <GlassView style={styles.statCard} padding="md" radius="lg">
          <MaterialIcons name="local-fire-department" size={24} color={colors.status.warning} />
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {stats.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.muted }]}>
            {t('topics.stats.streak')}
          </Text>
        </GlassView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GlassView
          style={styles.searchInputContainer}
          padding="sm"
          radius="lg"
        >
          <MaterialIcons name="search" size={20} color={colors.text.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder={t('topics.search.placeholder')}
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </GlassView>
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          {t('topics.list.title')}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.text.muted }]}>
          {filteredTopics.length} {filteredTopics.length === 1 ? t('topics.list.item') : t('topics.list.items')}
        </Text>
      </View>
    </>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name={searchQuery ? 'search-off' : 'library-books'}
        size={64}
        color={colors.text.muted}
      />
      <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
        {searchQuery ? t('topics.search.noResults') : t('topics.empty.title')}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.text.muted }]}>
        {searchQuery ? t('topics.search.tryAgain') : t('topics.empty.message')}
      </Text>
      {!searchQuery && (
        <GlassButton
          title={t('topics.empty.addFirst')}
          onPress={() => setIsAddModalVisible(true)}
          variant="primary"
          size="md"
          icon={<MaterialIcons name="add" size={20} color={colors.text.inverse} />}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  return (
    <ScreenWrapper scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('topics.title')}
        </Text>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push('/profile')}
        >
          <MaterialIcons name="person" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.status.error} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            {error}
          </Text>
          <GlassButton
            title={t('common.retry')}
            onPress={refreshTopics}
            variant="secondary"
            size="sm"
          />
        </View>
      ) : (
        <FlatList
          data={filteredTopics}
          renderItem={renderTopicCard}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refreshTopics}
              tintColor={colors.accent.primary}
            />
          }
        />
      )}

      {/* FAB - Add Topic */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent.primary }]}
        onPress={() => setIsAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color={colors.text.inverse} />
      </TouchableOpacity>

      {/* Add Topic Modal */}
      <AddTopicModal
        visible={isAddModalVisible}
        value={newTopicTitle}
        onChangeText={setNewTopicTitle}
        onSubmit={handleAddTopic}
        onClose={() => {
          setIsAddModalVisible(false);
          setNewTopicTitle('');
        }}
        isLoading={isAddingTopic}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading.h1,
    fontWeight: '700',
  },
  headerAction: {
    padding: Spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.heading.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.body.small,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body.medium,
    paddingVertical: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading.h3,
    fontWeight: '600',
  },
  sectionCount: {
    ...Typography.body.small,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Space for FAB
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body.medium,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    ...Typography.body.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.heading.h3,
    fontWeight: '600',
  },
  emptyMessage: {
    ...Typography.body.medium,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyButton: {
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
export default TopicsListScreen;
