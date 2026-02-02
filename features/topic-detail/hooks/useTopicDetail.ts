/**
 * @file useTopicDetail.ts
 * @description Hook for topic detail page - CRITICAL: Uses ref to prevent auto-refresh
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useStore, selectCurrentTopic, selectIsLoading, selectError } from '@/store';
import { formatSessionHistoryDate } from '@/shared/utils/dateUtils';
import type { Session, SessionItemData } from '@/types';

export function useTopicDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();

  // Store
  const currentTopic = useStore(selectCurrentTopic);
  const isLoading = useStore(selectIsLoading);
  const error = useStore(selectError);
  const loadTopicDetail = useStore((state) => state.loadTopicDetail);
  const updateTopicTitle = useStore((state) => state.updateTopicTitle);
  const deleteTopic = useStore((state) => state.deleteTopic);
  const deleteSession = useStore((state) => state.deleteSession);

  // Local state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ CRITICAL: Track which topic ID has been loaded to prevent auto-refresh
  const loadedTopicIdRef = useRef<string | null>(null);

  // ✅ CRITICAL: Only load if topicId changed
  useEffect(() => {
    if (topicId && topicId !== loadedTopicIdRef.current) {
      loadedTopicIdRef.current = topicId;
      loadTopicDetail(topicId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]); // Only depend on topicId, NOT loadTopicDetail

  // Transform sessions to display data with formatted dates
  const sessionsData = useMemo((): SessionItemData[] => {
    if (!currentTopic?.sessions) return [];

    return currentTopic.sessions.map((session: Session) => ({
      session,
      formattedDate: formatSessionHistoryDate(session.date, t),
    }));
  }, [currentTopic?.sessions, t]);

  // Handlers
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleStartSession = useCallback(() => {
    if (topicId) {
      router.push(`/${topicId}/session`);
    }
  }, [router, topicId]);

  const handleOpenEditModal = useCallback(() => {
    if (currentTopic) {
      setEditTitle(currentTopic.title);
      setIsEditModalVisible(true);
    }
  }, [currentTopic]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setEditTitle('');
  }, []);

  const handleUpdateTitle = useCallback(async () => {
    if (!topicId || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      await updateTopicTitle(topicId, editTitle.trim());
      handleCloseEditModal();
    } catch (err) {
      Alert.alert(
        t('common.error'),
        t('topicDetail.errors.updateFailed')
      );
    } finally {
      setIsUpdating(false);
    }
  }, [topicId, editTitle, updateTopicTitle, handleCloseEditModal, t]);

  const handleDeleteTopic = useCallback(() => {
    if (!topicId) return;

    Alert.alert(
      t('topicDetail.delete.title'),
      t('topicDetail.delete.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTopic(topicId);
              router.back();
            } catch (err) {
              Alert.alert(
                t('common.error'),
                t('topicDetail.errors.deleteFailed')
              );
            }
          },
        },
      ]
    );
  }, [topicId, deleteTopic, router, t]);

  const handleViewSession = useCallback(
    (sessionId: string) => {
      if (topicId) {
        router.push({
          pathname: `/${topicId}/result`,
          params: { sessionId },
        });
      }
    },
    [router, topicId]
  );

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      if (!topicId) return;

      Alert.alert(
        t('topicDetail.deleteSession.title'),
        t('topicDetail.deleteSession.message'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSession(topicId, sessionId);
              } catch (err) {
                Alert.alert(
                  t('common.error'),
                  t('topicDetail.errors.deleteSessionFailed')
                );
              }
            },
          },
        ]
      );
    },
    [topicId, deleteSession, t]
  );

  const refreshTopic = useCallback(() => {
    if (topicId) {
      loadTopicDetail(topicId);
    }
  }, [topicId, loadTopicDetail]);

  return {
    // Data
    topic: currentTopic,
    sessionsData,
    isLoading,
    error,
    topicId,

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
  };
}
