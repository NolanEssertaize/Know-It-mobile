/**
 * @file useResult.ts
 * @description Hook for result screen - displays analysis from a session
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useStore, selectCurrentTopic } from '@/store';
import type { Session, Analysis } from '@/types';

interface UseResultReturn {
  // Data
  session: Session | null;
  topic: ReturnType<typeof selectCurrentTopic>;
  analysis: Analysis | null;
  score: number;
  isLoading: boolean;
  showTranscription: boolean;

  // Actions
  toggleTranscription: () => void;
  handleTryAgain: () => void;
  handleBackToTopic: () => void;
  handleShare: () => void;
  handleGoHome: () => void;
}

export function useResult(): UseResultReturn {
  const { t } = useTranslation();
  const router = useRouter();
  const { topicId, sessionId } = useLocalSearchParams<{ topicId: string; sessionId: string }>();

  // Store
  const currentTopic = useStore(selectCurrentTopic);
  const loadTopicDetail = useStore((state) => state.loadTopicDetail);

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [showTranscription, setShowTranscription] = useState(false);

  // Track if we've loaded
  const hasLoadedRef = useRef(false);

  // Load topic if needed
  useEffect(() => {
    if (topicId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setIsLoading(true);
      loadTopicDetail(topicId).finally(() => {
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // Find the specific session
  const session = useMemo(() => {
    if (!currentTopic?.sessions || !sessionId) return null;
    return currentTopic.sessions.find((s) => s.id === sessionId) || null;
  }, [currentTopic?.sessions, sessionId]);

  // Get analysis
  const analysis = session?.analysis || null;

  // Calculate score
  const score = useMemo(() => {
    if (!analysis) return 0;

    const validCount = analysis.valid?.length || 0;
    const correctionsCount = analysis.corrections?.length || 0;
    const missingCount = analysis.missing?.length || 0;
    const total = validCount + correctionsCount + missingCount;

    if (total === 0) return 0;
    return Math.round((validCount / total) * 100);
  }, [analysis]);

  // Toggle transcription visibility
  const toggleTranscription = useCallback(() => {
    setShowTranscription((prev) => !prev);
  }, []);

  // Try again - go back to session
  const handleTryAgain = useCallback(() => {
    if (topicId) {
      router.replace(`/${topicId}/session`);
    }
  }, [router, topicId]);

  // Back to topic detail
  const handleBackToTopic = useCallback(() => {
    router.back();
  }, [router]);

  // Go to home
  const handleGoHome = useCallback(() => {
    router.replace('/');
  }, [router]);

  // Share results
  const handleShare = useCallback(async () => {
    if (!session || !analysis || !currentTopic) return;

    const validCount = analysis.valid?.length || 0;
    const correctionsCount = analysis.corrections?.length || 0;
    const missingCount = analysis.missing?.length || 0;

    const message = t('result.share.message', {
      topic: currentTopic.title,
      score,
      valid: validCount,
      corrections: correctionsCount,
      missing: missingCount,
    });

    try {
      await Share.share({
        message,
        title: t('result.share.title'),
      });
    } catch (err) {
      if (err instanceof Error && err.message !== 'User did not share') {
        Alert.alert(t('common.error'), t('result.errors.shareFailed'));
      }
    }
  }, [session, analysis, currentTopic, score, t]);

  return {
    // Data
    session,
    topic: currentTopic,
    analysis,
    score,
    isLoading,
    showTranscription,

    // Actions
    toggleTranscription,
    handleTryAgain,
    handleBackToTopic,
    handleShare,
    handleGoHome,
  };
}
