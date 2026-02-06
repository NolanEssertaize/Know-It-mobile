/**
 * @file (tabs)/index.tsx
 * @description Home tab - Topics list (swipeable to Flashcards)
 */

import { TopicsListScreen } from '@/features/topics/screens/TopicsListScreen';
import { SwipeableTabView } from '@/shared/components';

export default function HomeTab() {
  return (
    <SwipeableTabView position="left" targetRoute="/(tabs)/flashcards">
      <TopicsListScreen />
    </SwipeableTabView>
  );
}
