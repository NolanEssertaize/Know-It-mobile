/**
 * @file SwipeableTabView.tsx
 * @description Wrapper that enables horizontal swipe navigation between tabs
 * Detects swipe gestures and navigates - no view animation to avoid white screen
 */

import React, { memo, type ReactNode, useCallback, useRef } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.15;
const VELOCITY_THRESHOLD = 500;

type TabPosition = 'left' | 'right';

interface SwipeableTabViewProps {
  children: ReactNode;
  /** Current tab position - determines which direction can be swiped */
  position: TabPosition;
  /** Route to navigate to when swiping */
  targetRoute: string;
}

function SwipeableTabViewComponent({
  children,
  position,
  targetRoute,
}: SwipeableTabViewProps): React.JSX.Element {
  const router = useRouter();
  const hasNavigated = useRef(false);

  const navigate = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.navigate(targetRoute as any);
    // Reset after navigation completes
    setTimeout(() => {
      hasNavigated.current = false;
    }, 300);
  }, [router, targetRoute]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-25, 25]) // Require 25px horizontal before activating
    .failOffsetY([-20, 20])   // Fail if vertical movement > 20px (allows scrolling)
    .onEnd((event) => {
      'worklet';
      const { translationX, velocityX } = event;

      // Check if should navigate based on position
      if (position === 'left') {
        // On Home (left), swipe left to go to Flashcards
        if (translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD) {
          runOnJS(navigate)();
        }
      } else if (position === 'right') {
        // On Flashcards (right), swipe right to go to Home
        if (translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD) {
          runOnJS(navigate)();
        }
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {children}
      </View>
    </GestureDetector>
  );
}

export const SwipeableTabView = memo(SwipeableTabViewComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
