/**
 * @file TopicDetailScreen.tsx
 * @description Topic detail page with session history
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import { useTopicDetail } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';
import type { SessionItemData } from '@/types';

export function TopicDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    // Data
    topic,
    sessionsData,
    isLoading,
    error,
    // Edit Modal
    isEditModalVisible,
    editTitle,
    setEditTitle,
    isUpdating,
    // Actions
    handleGoBack,
    handleStartSession,
    handleOpenEditModal,
    handleCloseEditModal,
    handleUpdateTitle,
    handleDeleteTopic,
    handleViewSession,
    handleDeleteSession,
    refreshTopic,
  } = useTopicDetail();

  const renderSessionCard = useCallback(
    ({ item }: { item: SessionItemData }) => (
      <SessionHistoryCard
        data={item}
        onPress={() => handleViewSession(item.session.id)}
        onDelete={() => handleDeleteSession(item.session.id)}
      />
    ),
    [handleViewSession, handleDeleteSession]
  );

  const keyExtractor = useCallback((item: SessionItemData) => item.session.id, []);

  const ListHeader = (
    <>
      {/* Topic Header */}
      <GlassView style={styles.topicHeader} padding="lg" radius="xl" variant="elevated">
        <View style={[styles.topicIcon, { backgroundColor: colors.accent.primary + '20' }]}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={40}
            color={colors.accent.primary}
          />
        </View>

        <Text style={[styles.topicTitle, { color: colors.text.primary }]}>
          {topic?.title || t('common.loading')}
        </Text>

        <View style={styles.topicStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="mic" size={20} color={colors.text.muted} />
            <Text style={[styles.statText, { color: colors.text.muted }]}>
              {sessionsData.length} {sessionsData.length === 1 ? t('topicDetail.session') : t('topicDetail.sessions')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.topicActions}>
          <TouchableOpacity
            style={[styles.topicActionButton, { backgroundColor: colors.surface.glass }]}
            onPress={handleOpenEditModal}
          >
            <MaterialIcons name="edit" size={20} color={colors.text.secondary} />
            <Text style={[styles.topicActionText, { color: colors.text.secondary }]}>
              {t('common.edit')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topicActionButton, { backgroundColor: colors.status.error + '15' }]}
            onPress={handleDeleteTopic}
          >
            <MaterialIcons name="delete" size={20} color={colors.status.error} />
            <Text style={[styles.topicActionText, { color: colors.status.error }]}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassView>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          {t('topicDetail.history.title')}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.text.muted }]}>
          {sessionsData.length} {sessionsData.length === 1 ? t('topicDetail.history.session') : t('topicDetail.history.sessions')}
        </Text>
      </View>
    </>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="mic-none" size={64} color={colors.text.muted} />
      <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
        {t('topicDetail.empty.title')}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.text.muted }]}>
        {t('topicDetail.empty.message')}
      </Text>
    </View>
  );

  if (isLoading && !topic) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>
            {t('common.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error && !topic) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.status.error} />
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            {error}
          </Text>
          <GlassButton
            title={t('common.goBack')}
            onPress={handleGoBack}
            variant="secondary"
            size="md"
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {topic?.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <FlatList
        data={sessionsData}
        renderItem={renderSessionCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshTopic}
            tintColor={colors.accent.primary}
          />
        }
      />

      {/* Start Session Button */}
      <View style={styles.bottomActions}>
        <GlassButton
          title={t('topicDetail.startSession')}
          onPress={handleStartSession}
          variant="primary"
          size="lg"
          icon={<MaterialIcons name="mic" size={24} color={colors.text.inverse} />}
          style={styles.startButton}
        />
      </View>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseEditModal}
          />
          <GlassView style={styles.modalContent} padding="lg" radius="xl" variant="elevated">
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {t('topicDetail.edit.title')}
            </Text>

            <View style={[styles.inputContainer, { borderColor: colors.glass.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder={t('topicDetail.edit.placeholder')}
                placeholderTextColor={colors.text.muted}
                value={editTitle}
                onChangeText={setEditTitle}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleUpdateTitle}
              />
            </View>

            <View style={styles.modalActions}>
              <GlassButton
                title={t('common.cancel')}
                onPress={handleCloseEditModal}
                variant="ghost"
                size="md"
                style={styles.modalButton}
              />
              <GlassButton
                title={t('common.save')}
                onPress={handleUpdateTitle}
                variant="primary"
                size="md"
                loading={isUpdating}
                disabled={!editTitle.trim() || editTitle.trim() === topic?.title}
                style={styles.modalButton}
              />
            </View>
          </GlassView>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.heading.h3,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
    flexGrow: 1,
  },
  topicHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  topicIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  topicTitle: {
    ...Typography.heading.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  topicStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    ...Typography.body.medium,
  },
  topicActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  topicActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  topicActionText: {
    ...Typography.body.small,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading.h3,
    fontWeight: '600',
  },
  sectionCount: {
    ...Typography.body.small,
  },
  emptyContainer: {
    alignItems: 'center',
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  startButton: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.heading.h3,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  input: {
    ...Typography.body.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
export default TopicDetailScreen;
