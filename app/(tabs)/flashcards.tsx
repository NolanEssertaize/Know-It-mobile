/**
 * @file (tabs)/flashcards.tsx
 * @description Flashcards tab - shows daily review cards (swipeable to Home)
 */

import { FlashcardDailyReviewScreen } from '@/features/flashcards';
import { SwipeableTabView } from '@/shared/components';

export default function FlashcardsTab() {
  return (
    <SwipeableTabView position="right" targetRoute="/(tabs)">
      <FlashcardDailyReviewScreen />
    </SwipeableTabView>
  );
}
