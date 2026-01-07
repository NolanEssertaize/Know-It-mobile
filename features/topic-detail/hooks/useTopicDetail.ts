/**
 * @file useTopicDetail.ts
 * @description Logic Controller pour l'écran de détail d'un topic
 */

import { useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectTopicById } from '@/store/useStore';
import type { Topic, Session } from '@/types';
import { formatDateFull } from '@/shared/utils/dateUtils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SessionItemData {
  session: Session;
  formattedDate: string;
}

export interface UseTopicDetailReturn {
  // Data
  topic: Topic | undefined;
  sessions: SessionItemData[];
  isLoading: boolean;

  // Methods
  handleStartSession: () => void;
  handleNavigateBack: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTopicDetail(): UseTopicDetailReturn {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();

  const topic = useStore(selectTopicById(topicId ?? ''));

  // Sessions enrichies
  const sessions = useMemo((): SessionItemData[] => {
    if (!topic) return [];

    return topic.sessions.map((session) => ({
      session,
      formattedDate: formatDateFull(session.date),
    }));
  }, [topic]);

  // Handlers
  const handleStartSession = useCallback(() => {
    if (topicId) {
      router.push(`/${topicId}/session`);
    }
  }, [topicId, router]);

  const handleNavigateBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    // Data
    topic,
    sessions,
    isLoading: false,

    // Methods
    handleStartSession,
    handleNavigateBack,
  };
}
