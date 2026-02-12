/**
 * @file useTopicDetail.ts
 * @description Topic Detail Hook - Business logic for TopicDetailScreen
 *
 * Pattern: MVVM - This hook serves as the ViewModel for topic detail view
 *
 * FIXES:
 * - Sessions are now transformed to SessionItemData with formattedDate
 * - Uses corrected formatSessionHistoryDate for proper Today/Yesterday display
 * - Added refreshSessions method
 * - Added handleSessionPress for navigation
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useStore, selectCurrentTopic, selectIsLoading, selectError } from '@/store';
import type { Topic, Session } from '@/store';
import { formatSessionHistoryDate } from '@/shared/utils/dateUtils';
import { useQuotaGuard } from '@/features/subscription';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Session item data for FlatList rendering
 */
export interface SessionItemData {
    session: Session;
    formattedDate: string;
}

interface UseTopicDetailReturn {
    // State
    topic: Topic | null;
    sessions: SessionItemData[];
    isLoading: boolean;
    error: string | null;
    isEditModalVisible: boolean;
    editTitle: string;

    // Actions
    loadTopicDetail: (topicId: string) => Promise<Topic | null>;
    refreshTopic: () => Promise<void>;
    refreshSessions: () => Promise<void>;
    handleUpdateTitle: () => Promise<void>;
    handleDeleteTopic: () => Promise<void>;
    handleStartSession: () => void;
    handleSessionPress: (sessionId: string) => void;

    // Quota guard
    quotaModalVisible: boolean;
    quotaType: 'session' | 'generation';
    dismissQuotaModal: () => void;
    openPaywall: () => void;
    setEditTitle: (title: string) => void;
    showEditModal: () => void;
    hideEditModal: () => void;
    clearError: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTopicDetail(topicId: string): UseTopicDetailReturn {
    const router = useRouter();
    const { quotaModalVisible, quotaType, checkAndProceed, dismissQuotaModal, openPaywall } = useQuotaGuard();

    // Local state for edit modal
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    // Store state and actions
    const topic = useStore(selectCurrentTopic);
    const isLoading = useStore(selectIsLoading);
    const error = useStore(selectError);
    const {
        loadTopicDetail: loadTopicDetailFromStore,
        updateTopicTitle,
        deleteTopic,
        clearError: clearStoreError,
    } = useStore();

    // ═══════════════════════════════════════════════════════════════════════
    // Transform sessions to SessionItemData with formattedDate
    // Uses the corrected formatSessionHistoryDate from dateUtils
    // ═══════════════════════════════════════════════════════════════════════
    const sessions: SessionItemData[] = useMemo(() => {
        const rawSessions = topic?.sessions || [];

        return rawSessions
            .filter((session): session is Session => {
                // Filter out undefined/null sessions
                return session !== undefined && session !== null && typeof session.id === 'string';
            })
            .map((session) => ({
                session,
                // Use the corrected date formatting function
                formattedDate: formatSessionHistoryDate(session.date),
            }))
            .sort((a, b) => {
                // Sort by date descending (newest first)
                return new Date(b.session.date).getTime() - new Date(a.session.date).getTime();
            });
    }, [topic?.sessions]);

    // ─────────────────────────────────────────────────────────────────────────
    // Load topic detail on mount or when topicId changes
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (topicId) {
            console.log('[useTopicDetail] Loading topic:', topicId);
            loadTopicDetailFromStore(topicId);
        }
    }, [topicId, loadTopicDetailFromStore]);

    /**
     * Load topic detail from API
     */
    const loadTopicDetail = useCallback(async (id: string): Promise<Topic | null> => {
        return await loadTopicDetailFromStore(id);
    }, [loadTopicDetailFromStore]);

    /**
     * Refresh current topic
     */
    const refreshTopic = useCallback(async () => {
        if (topicId) {
            console.log('[useTopicDetail] Refreshing topic:', topicId);
            await loadTopicDetailFromStore(topicId);
        }
    }, [topicId, loadTopicDetailFromStore]);

    /**
     * Refresh sessions (same as refreshTopic for now)
     */
    const refreshSessions = useCallback(async () => {
        if (topicId) {
            console.log('[useTopicDetail] Refreshing sessions for topic:', topicId);
            await loadTopicDetailFromStore(topicId);
        }
    }, [topicId, loadTopicDetailFromStore]);

    /**
     * Update topic title
     */
    const handleUpdateTitle = useCallback(async () => {
        if (!topic || !editTitle.trim()) {
            return;
        }

        console.log('[useTopicDetail] Updating title to:', editTitle);

        try {
            await updateTopicTitle(topic.id, editTitle);
            setIsEditModalVisible(false);
        } catch (error) {
            console.error('[useTopicDetail] Failed to update title:', error);
        }
    }, [topic, editTitle, updateTopicTitle]);

    /**
     * Delete current topic
     */
    const handleDeleteTopic = useCallback(async () => {
        if (!topic) return;

        console.log('[useTopicDetail] Deleting topic:', topic.id);
        await deleteTopic(topic.id);
        // Navigate back after deletion
        router.back();
    }, [topic, deleteTopic, router]);

    /**
     * Navigate to session recording screen
     */
    const handleStartSession = useCallback(() => {
        if (!checkAndProceed('session')) return;
        if (topicId) {
            router.push(`/${topicId}/session`);
        }
    }, [topicId, router, checkAndProceed]);

    /**
     * Navigate to session result screen
     */
    const handleSessionPress = useCallback((sessionId: string) => {
        if (topicId) {
            console.log('[useTopicDetail] Opening session:', sessionId);
            router.push(`/${topicId}/result?sessionId=${sessionId}&topicId=${topicId}&topicTitle=${encodeURIComponent(topic?.title || 'Topic')}`);
        }
    }, [topicId, topic?.title, router]);

    /**
     * Show edit modal
     */
    const showEditModal = useCallback(() => {
        setEditTitle(topic?.title || '');
        setIsEditModalVisible(true);
    }, [topic]);

    /**
     * Hide edit modal
     */
    const hideEditModal = useCallback(() => {
        setIsEditModalVisible(false);
        setEditTitle('');
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        clearStoreError();
    }, [clearStoreError]);

    return {
        // State
        topic,
        sessions,
        isLoading,
        error,
        isEditModalVisible,
        editTitle,

        // Actions
        loadTopicDetail,
        refreshTopic,
        refreshSessions,
        handleUpdateTitle,
        handleDeleteTopic,
        handleStartSession,
        handleSessionPress,
        setEditTitle,
        showEditModal,
        hideEditModal,
        clearError,

        // Quota guard
        quotaModalVisible,
        quotaType,
        dismissQuotaModal,
        openPaywall,
    };
}