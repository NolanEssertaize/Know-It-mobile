/**
 * @file useFlashcards.ts
 * @description Hook for managing flashcards screen state (deck list)
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { FlashcardsService } from '@/shared/services';
import type { DeckWithStats } from '@/shared/api';

interface UseFlashcardsReturn {
  decks: DeckWithStats[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  totalDue: number;
  refresh: () => Promise<void>;
  handleDeckPress: (deckId: string) => void;
  handleStartReview: (deckId: string) => void;
}

export function useFlashcards(): UseFlashcardsReturn {
  const router = useRouter();

  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log('[useFlashcards] Fetching decks');
      const fetchedDecks = await FlashcardsService.getDecks();
      setDecks(fetchedDecks);
      console.log(`[useFlashcards] Fetched ${fetchedDecks.length} decks`);
    } catch (err) {
      console.error('[useFlashcards] Failed to fetch decks:', err);
      setError('Failed to load decks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const refresh = useCallback(async () => {
    await fetchDecks(true);
  }, [fetchDecks]);

  const totalDue = decks.reduce((sum, deck) => sum + deck.due_count, 0);

  const handleDeckPress = useCallback((deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    router.push({
      pathname: '/deck-detail',
      params: { deckId, deckName: deck?.name || '' },
    });
  }, [router, decks]);

  const handleStartReview = useCallback((deckId: string) => {
    router.push({
      pathname: '/flashcard-review',
      params: { deckId },
    });
  }, [router]);

  return {
    decks,
    isLoading,
    isRefreshing,
    error,
    totalDue,
    refresh,
    handleDeckPress,
    handleStartReview,
  };
}
