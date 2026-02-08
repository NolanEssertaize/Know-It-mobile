/**
 * @file useFlashcardReview.ts
 * @description Hook for managing flashcard review session state (deck-specific)
 *
 * Swipe gestures:
 * - RIGHT = "good" (correct, advance to next step)
 * - LEFT = "forgot" (wrong, reset to step 0)
 * - UP = "hard" (difficult, stay at current step)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashcardsService } from '@/shared/services';
import type { ReviewCard, SwipeDirection } from '../types';
import type { ReviewDifficulty, FlashcardWithReview } from '@/shared/api';

interface ReviewStats {
  total: number;
  reviewed: number;
  forgot: number;  // wrong, reset to step 0
  hard: number;    // difficult, stay at current step
  good: number;    // correct, advance to next step
}

interface UseFlashcardReviewReturn {
  cards: ReviewCard[];
  currentIndex: number;
  currentCard: ReviewCard | null;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  stats: ReviewStats;
  deckName: string;
  handleSwipe: (direction: SwipeDirection) => void;
  handleClose: () => void;
  handleRestart: () => void;
}

/**
 * Map swipe direction to review difficulty
 * - LEFT = forgot (wrong, reset to step 0)
 * - RIGHT = good (correct, advance to next step)
 * - UP = hard (difficult, stay at current step)
 */
function mapDifficultyFromSwipe(direction: SwipeDirection): ReviewDifficulty {
  switch (direction) {
    case 'left':
      return 'forgot';  // Wrong - reset to step 0 (1 day)
    case 'right':
      return 'good';    // Correct - advance to next step
    case 'up':
      return 'hard';    // Difficult - stay at current step
    default:
      return 'forgot';
  }
}

function mapApiCardToReviewCard(card: FlashcardWithReview): ReviewCard {
  return {
    id: card.id,
    front: card.front_content,
    back: card.back_content,
    deckId: card.deck_id,
    isNew: card.review_count === 0,
  };
}

export function useFlashcardReview(): UseFlashcardReviewReturn {
  const params = useLocalSearchParams<{
    deckId?: string;
  }>();
  const router = useRouter();

  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    reviewed: 0,
    forgot: 0,
    hard: 0,
    good: 0,
  });

  const deckId = params.deckId || '';

  // Fetch due cards on mount
  useEffect(() => {
    if (!deckId) {
      setError('No deck selected');
      setIsLoading(false);
      return;
    }

    const fetchDueCards = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[useFlashcardReview] Fetching due cards for deck:', deckId);
        const response = await FlashcardsService.getAllDueCards(deckId);

        const reviewCards = response.cards.map(mapApiCardToReviewCard);
        setCards(reviewCards);
        setDeckName('Flashcards'); // Deck name not available from this endpoint
        setStats({
          total: reviewCards.length,
          reviewed: 0,
          forgot: 0,
          hard: 0,
          good: 0,
        });

        console.log(`[useFlashcardReview] Loaded ${reviewCards.length} cards`);
      } catch (err) {
        console.error('[useFlashcardReview] Failed to fetch due cards:', err);
        setError('Failed to load cards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDueCards();
  }, [deckId]);

  const currentCard = useMemo(() => {
    return cards[currentIndex] || null;
  }, [cards, currentIndex]);

  const isComplete = currentIndex >= cards.length && cards.length > 0;

  const handleSwipe = useCallback(async (direction: SwipeDirection) => {
    if (!direction || !currentCard) return;

    const difficulty = mapDifficultyFromSwipe(direction);

    // Update stats based on difficulty
    setStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [difficulty]: (prev[difficulty as keyof typeof prev] as number) + 1,
    }));

    // Submit review to API
    FlashcardsService.submitReview(currentCard.id, difficulty).catch((err) => {
      console.error('[useFlashcardReview] Failed to submit review:', err);
    });

    // Move to next card
    setCurrentIndex((prev) => prev + 1);
  }, [currentCard]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setStats({
      total: cards.length,
      reviewed: 0,
      forgot: 0,
      hard: 0,
      good: 0,
    });
  }, [cards.length]);

  return {
    cards,
    currentIndex,
    currentCard,
    isLoading,
    isComplete,
    error,
    stats,
    deckName,
    handleSwipe,
    handleClose,
    handleRestart,
  };
}
