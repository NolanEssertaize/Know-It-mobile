/**
 * @file useDeckDetail.ts
 * @description Hook for managing deck detail screen state (timeline, card CRUD)
 */

import { useState, useCallback, useEffect } from 'react';
import { FlashcardsService } from '@/shared/services';
import type { TimelinePeriod, DelayLabel } from '@/shared/api';

interface UseDeckDetailReturn {
  periods: TimelinePeriod[];
  expandedPeriods: Set<string>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  totalUpcoming: number;
  togglePeriod: (period: string) => void;
  addCard: (front: string, back: string, delay?: DelayLabel) => Promise<void>;
  updateCard: (id: string, front: string, back: string, delay?: DelayLabel) => void;
  deleteCard: (id: string) => void;
  refresh: () => Promise<void>;
}

export function useDeckDetail(deckId: string): UseDeckDetailReturn {
  const [periods, setPeriods] = useState<TimelinePeriod[]>([]);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUpcoming, setTotalUpcoming] = useState(0);

  const fetchTimeline = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await FlashcardsService.getDeckTimeline(deckId);
      setPeriods(response.periods);
      setTotalUpcoming(response.total_upcoming);
    } catch (err) {
      console.error('[useDeckDetail] Failed to fetch timeline:', err);
      setError('Failed to load timeline');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const refresh = useCallback(async () => {
    await fetchTimeline(true);
  }, [fetchTimeline]);

  const togglePeriod = useCallback((period: string) => {
    setExpandedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
  }, []);

  const addCard = useCallback(async (front: string, back: string, delay?: DelayLabel) => {
    await FlashcardsService.createFlashcard({
      deck_id: deckId,
      front_content: front,
      back_content: back,
      ...(delay && { delay }),
    });
    await fetchTimeline(true);
  }, [deckId, fetchTimeline]);

  const updateCard = useCallback(async (id: string, front: string, back: string, delay?: DelayLabel) => {
    try {
      await FlashcardsService.updateFlashcard(id, {
        front_content: front,
        back_content: back,
        ...(delay && { delay }),
      });
      await fetchTimeline(true);
    } catch (err) {
      console.error('[useDeckDetail] Failed to update card:', err);
    }
  }, [fetchTimeline]);

  const deleteCard = useCallback(async (id: string) => {
    try {
      await FlashcardsService.deleteFlashcard(id);
      await fetchTimeline(true);
    } catch (err) {
      console.error('[useDeckDetail] Failed to delete card:', err);
    }
  }, [fetchTimeline]);

  return {
    periods,
    expandedPeriods,
    isLoading,
    isRefreshing,
    error,
    totalUpcoming,
    togglePeriod,
    addCard,
    updateCard,
    deleteCard,
    refresh,
  };
}
