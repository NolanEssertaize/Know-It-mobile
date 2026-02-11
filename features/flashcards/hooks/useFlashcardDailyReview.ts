/**
 * @file useFlashcardDailyReview.ts
 * @description Hook for managing daily flashcard review
 *
 * Swipe gestures:
 * - RIGHT = "good" (correct, advance to next step)
 * - LEFT = "forgot" (wrong, reset to step 0)
 * - UP = "hard" (difficult, stay at current step)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlashcardsService } from '@/shared/services';
import type { ReviewCard, SwipeDirection } from '../types';
import type { ReviewDifficulty, FlashcardWithReview, TimelinePeriod } from '@/shared/api';

interface ReviewStats {
  total: number;
  reviewed: number;
  forgot: number;  // wrong, reset to step 0
  hard: number;    // difficult, stay at current step
  good: number;    // correct, advance to next step
}

interface UseFlashcardDailyReviewReturn {
  cards: ReviewCard[];
  currentIndex: number;
  currentCard: ReviewCard | null;
  totalCards: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isComplete: boolean;
  error: string | null;
  stats: ReviewStats;
  nextDueLabel: string | null;
  handleSwipe: (direction: SwipeDirection) => void;
  handleClose: () => void;
  handleRestart: () => void;
  handleManage: () => void;
  refresh: () => Promise<void>;
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

function computeNextDueLabel(
  periods: TimelinePeriod[],
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  // Find the earliest non-"due" period with cards
  const nextPeriod = periods.find((p) => p.period !== 'due' && p.count > 0);
  if (!nextPeriod || nextPeriod.cards.length === 0) return null;

  // Find the card with the earliest next_review date
  let earliestDate: Date | null = null;
  for (const card of nextPeriod.cards) {
    if (card.next_review_at) {
      const d = new Date(card.next_review_at);
      if (!earliestDate || d < earliestDate) {
        earliestDate = d;
      }
    }
  }

  if (!earliestDate) return null;

  const now = new Date();
  const diffMs = earliestDate.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let when: string;
  if (diffHours <= 1) {
    when = t('relativeTime.inOneHour');
  } else if (diffHours < 24) {
    when = t('relativeTime.inHours', { count: diffHours });
  } else if (diffDays === 1) {
    when = t('relativeTime.tomorrow');
  } else {
    when = t('relativeTime.inDays', { count: diffDays });
  }

  return t('flashcards.daily.nextDue', { when });
}

export function useFlashcardDailyReview(): UseFlashcardDailyReviewReturn {
  const router = useRouter();
  const { t } = useTranslation();

  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextDueLabel, setNextDueLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    reviewed: 0,
    forgot: 0,
    hard: 0,
    good: 0,
  });

  // Fetch all due flashcards directly
  const fetchAllDueCards = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log('[useFlashcardDailyReview] Fetching all due flashcards');
      const response = await FlashcardsService.getAllDueCards();

      if (response.cards.length === 0) {
        console.log('[useFlashcardDailyReview] No due cards found');
        setCards([]);
        setStats({
          total: 0,
          reviewed: 0,
          forgot: 0,
          hard: 0,
          good: 0,
        });
        // Fetch timeline to compute next due label
        try {
          const timeline = await FlashcardsService.getTimeline();
          setNextDueLabel(computeNextDueLabel(timeline.periods, t));
        } catch {
          setNextDueLabel(null);
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Map API cards to review cards
      const reviewCards = response.cards.map(mapApiCardToReviewCard);

      // Shuffle cards for variety
      const shuffledCards = reviewCards.sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
      setCurrentIndex(0);
      setStats({
        total: shuffledCards.length,
        reviewed: 0,
        forgot: 0,
        hard: 0,
        good: 0,
      });

      console.log(`[useFlashcardDailyReview] Loaded ${shuffledCards.length} due cards`);
    } catch (err) {
      console.error('[useFlashcardDailyReview] Failed to fetch due cards:', err);
      setError('Failed to load cards');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDueCards();
  }, [fetchAllDueCards]);

  const currentCard = useMemo(() => {
    return cards[currentIndex] || null;
  }, [cards, currentIndex]);

  const isComplete = currentIndex >= cards.length && cards.length > 0;

  // Fetch timeline for next due label when session completes
  useEffect(() => {
    if (isComplete) {
      FlashcardsService.getTimeline()
        .then((timeline) => {
          setNextDueLabel(computeNextDueLabel(timeline.periods, t));
        })
        .catch(() => {
          setNextDueLabel(null);
        });
    }
  }, [isComplete, t]);

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
      console.error('[useFlashcardDailyReview] Failed to submit review:', err);
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

  const handleManage = useCallback(() => {
    router.push('/flashcards-manage');
  }, [router]);

  const refresh = useCallback(async () => {
    await fetchAllDueCards(true);
  }, [fetchAllDueCards]);

  return {
    cards,
    currentIndex,
    currentCard,
    totalCards: cards.length,
    isLoading,
    isRefreshing,
    isComplete,
    error,
    stats,
    nextDueLabel,
    handleSwipe,
    handleClose,
    handleRestart,
    handleManage,
    refresh,
  };
}
