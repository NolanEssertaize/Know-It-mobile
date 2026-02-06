/**
 * @file SwipeableFlashcard.tsx
 * @description Flashcard with flip animation and swipe gestures
 *
 * Gestures:
 * - Tap: Flip card to show answer
 * - Swipe Right: Good (correct, advance step) - Green glow
 * - Swipe Left: Forgot (wrong, reset to step 0) - Red glow
 * - Swipe Up: Hard (difficult, stay at current step) - Orange glow
 */

import React, { memo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
  withDelay,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { ReviewCard, SwipeDirection } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_UP_THRESHOLD = SCREEN_HEIGHT * 0.15;

// Glow colors
const GLOW_COLORS = {
  good: '#22C55E',    // Green for correct (advance step)
  forgot: '#EF4444',  // Red for forgot (reset to step 0)
  hard: '#F97316',    // Orange for hard (stay at current step)
  neutral: 'transparent',
};

interface SwipeableFlashcardProps {
  card: ReviewCard;
  onSwipe: (direction: SwipeDirection) => void;
  isActive: boolean;
}

function SwipeableFlashcardComponent({
  card,
  onSwipe,
  isActive,
}: SwipeableFlashcardProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Swipe lock to prevent rapid successive swipes (useSharedValue for UI thread access)
  const isSwiping = useSharedValue(false);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const isFlipped = useSharedValue(false);
  const flipProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  // Entrance animation - card slides up from behind
  const entranceProgress = useSharedValue(0);

  useEffect(() => {
    // Reset swipe lock when card changes
    isSwiping.value = false;

    // Start entrance animation only for active cards
    if (isActive) {
      entranceProgress.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
        mass: 1,
      });
    } else {
      // Background cards should be immediately visible without animation
      entranceProgress.value = 1;
    }
  }, [card.id, isActive]);

  // Handle flip
  const handleFlip = useCallback(() => {
    'worklet';
    isFlipped.value = !isFlipped.value;
    flipProgress.value = withSpring(isFlipped.value ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  // Handle swipe completion - called after animation delay
  const handleSwipeComplete = useCallback((direction: SwipeDirection) => {
    // Only process if not already swiping
    if (isSwiping.value) return;
    isSwiping.value = true;
    onSwipe(direction);
  }, [onSwipe, isSwiping]);

  // Delayed swipe callback to sync with animation
  const triggerSwipeAfterDelay = useCallback((direction: SwipeDirection) => {
    // Small delay to let animation start, then update state
    setTimeout(() => {
      handleSwipeComplete(direction);
    }, 200); // Slightly before animation ends (300ms) for smoother transition
  }, [handleSwipeComplete]);

  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      'worklet';
      // Don't allow updates if already swiping
      if (isSwiping.value) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotateZ.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      'worklet';
      // Don't process if already swiping
      if (isSwiping.value) return;

      const velocityX = event.velocityX;
      const velocityY = event.velocityY;

      // Check for swipe up (hard)
      if (translateY.value < -SWIPE_UP_THRESHOLD && velocityY < -500) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 });
        scale.value = withTiming(0.8, { duration: 250 });
        runOnJS(triggerSwipeAfterDelay)('up');
        return;
      }

      // Check for swipe right (good)
      if (translateX.value > SWIPE_THRESHOLD || velocityX > 800) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 });
        rotateZ.value = withTiming(30, { duration: 250 });
        runOnJS(triggerSwipeAfterDelay)('right');
        return;
      }

      // Check for swipe left (forgot)
      if (translateX.value < -SWIPE_THRESHOLD || velocityX < -800) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 });
        rotateZ.value = withTiming(-30, { duration: 250 });
        runOnJS(triggerSwipeAfterDelay)('left');
        return;
      }

      // Reset position
      translateX.value = withSpring(0, { damping: 15 });
      translateY.value = withSpring(0, { damping: 15 });
      rotateZ.value = withSpring(0, { damping: 15 });
    });

  // Tap gesture for flipping
  const tapGesture = Gesture.Tap()
    .enabled(isActive)
    .onEnd(() => {
      handleFlip();
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Card container animation with entrance effect
  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Entrance: start slightly scaled down and below, animate to normal
    const entranceScale = interpolate(
      entranceProgress.value,
      [0, 1],
      [0.92, 1],
      Extrapolation.CLAMP
    );
    const entranceTranslateY = interpolate(
      entranceProgress.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + entranceTranslateY },
        { rotateZ: `${rotateZ.value}deg` },
        { scale: scale.value * entranceScale },
      ],
      opacity: entranceProgress.value,
    };
  });

  // Glow effect based on swipe direction
  const glowAnimatedStyle = useAnimatedStyle(() => {
    // Calculate intensities for each direction
    const rightIntensity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    const leftIntensity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    const upIntensity = interpolate(
      translateY.value,
      [-SWIPE_UP_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    // Determine dominant direction and color
    let glowColor = GLOW_COLORS.neutral;
    let glowOpacity = 0;
    let shadowRadius = 0;

    if (upIntensity > Math.max(leftIntensity, rightIntensity)) {
      // Swiping up - Hard (Orange)
      glowColor = GLOW_COLORS.hard;
      glowOpacity = upIntensity * 0.6;
      shadowRadius = upIntensity * 24;
    } else if (rightIntensity > leftIntensity) {
      // Swiping right - Good (Green)
      glowColor = GLOW_COLORS.good;
      glowOpacity = rightIntensity * 0.6;
      shadowRadius = rightIntensity * 24;
    } else if (leftIntensity > 0) {
      // Swiping left - Forgot (Red)
      glowColor = GLOW_COLORS.forgot;
      glowOpacity = leftIntensity * 0.6;
      shadowRadius = leftIntensity * 24;
    }

    return {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity,
      shadowRadius: shadowRadius,
      elevation: shadowRadius > 0 ? 16 : 8,
    };
  });

  // Border glow overlay
  const borderGlowStyle = useAnimatedStyle(() => {
    const rightIntensity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    const leftIntensity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    const upIntensity = interpolate(
      translateY.value,
      [-SWIPE_UP_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    // Determine border color based on dominant direction
    let borderColor = 'transparent';
    let borderOpacity = 0;

    if (upIntensity > Math.max(leftIntensity, rightIntensity)) {
      borderColor = GLOW_COLORS.hard;
      borderOpacity = upIntensity;
    } else if (rightIntensity > leftIntensity) {
      borderColor = GLOW_COLORS.good;
      borderOpacity = rightIntensity;
    } else if (leftIntensity > 0) {
      borderColor = GLOW_COLORS.forgot;
      borderOpacity = leftIntensity;
    }

    return {
      borderColor: borderColor,
      borderWidth: interpolate(borderOpacity, [0, 1], [0, 3], Extrapolation.CLAMP),
      opacity: borderOpacity,
    };
  });

  // Front face animation (question)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: flipProgress.value < 0.5 ? 1 : 0,
    };
  });

  // Back face animation (answer)
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: flipProgress.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        {/* Front Face (Question) */}
        <Animated.View
          style={[
            styles.cardFace,
            {
              backgroundColor: colors.background.elevated,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : colors.glass.border,
            },
            frontAnimatedStyle,
            glowAnimatedStyle,
          ]}
        >
          {/* Glow border overlay */}
          <Animated.View style={[styles.glowBorder, borderGlowStyle]} />

          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.text.secondary }]}>
              QUESTION
            </Text>
            {card.isNew && (
              <View style={[styles.newBadge, { backgroundColor: colors.text.primary }]}>
                <Text style={[styles.newBadgeText, { color: colors.text.inverse }]}>NEW</Text>
              </View>
            )}
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardText, { color: colors.text.primary }]}>
              {card.front}
            </Text>
          </View>
        </Animated.View>

        {/* Back Face (Answer) */}
        <Animated.View
          style={[
            styles.cardFace,
            {
              backgroundColor: colors.background.elevated,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : colors.glass.border,
            },
            backAnimatedStyle,
            glowAnimatedStyle,
          ]}
        >
          {/* Glow border overlay */}
          <Animated.View style={[styles.glowBorder, borderGlowStyle]} />

          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.text.secondary }]}>
              ANSWER
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardText, { color: colors.text.primary }]}>
              {card.back}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.swipeHints}>
              <View style={styles.swipeHint}>
                <MaterialCommunityIcons name="arrow-left" size={16} color={GLOW_COLORS.forgot} />
                <Text style={[styles.swipeHintText, { color: colors.text.muted }]}>Forgot</Text>
              </View>
              <View style={styles.swipeHint}>
                <MaterialCommunityIcons name="arrow-up" size={16} color={GLOW_COLORS.hard} />
                <Text style={[styles.swipeHintText, { color: colors.text.muted }]}>Hard</Text>
              </View>
              <View style={styles.swipeHint}>
                <MaterialCommunityIcons name="arrow-right" size={16} color={GLOW_COLORS.good} />
                <Text style={[styles.swipeHintText, { color: colors.text.muted }]}>Good</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export const SwipeableFlashcard = memo(SwipeableFlashcardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: SCREEN_HEIGHT * 0.55,
    position: 'absolute',
  },

  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },

  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
    pointerEvents: 'none',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  newBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 32,
  },

  cardFooter: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },

  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  swipeHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SwipeableFlashcard;
