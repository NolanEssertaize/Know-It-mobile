/**
 * @file useWelcome.ts
 * @description Logic Controller pour l'écran de bienvenue
 */

import { useEffect, useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface OrbAnimation {
  translateX: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
  scale: Animated.AnimatedInterpolation<number>;
}

export interface UseWelcomeReturn {
  // Animations
  fadeAnim: Animated.Value;
  progressAnim: Animated.Value;
  orb1Animation: OrbAnimation;
  orb2Animation: OrbAnimation;
  orb3Animation: OrbAnimation;

  // Data
  isAnimating: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function createOrbAnimation(
  animValue: Animated.Value,
  config: {
    xRange: [number, number];
    yRange: [number, number];
    scaleRange: [number, number];
  }
): OrbAnimation {
  return {
    translateX: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [config.xRange[0], config.xRange[1], config.xRange[0]],
    }),
    translateY: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [config.yRange[0], config.yRange[1], config.yRange[0]],
    }),
    scale: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [config.scaleRange[0], config.scaleRange[1], config.scaleRange[0]],
    }),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useWelcome(onFinish: () => void): UseWelcomeReturn {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;

  // Create orb animations
  const orb1Animation = createOrbAnimation(orb1Anim, {
    xRange: [0, 30],
    yRange: [0, -20],
    scaleRange: [1, 1.2],
  });

  const orb2Animation = createOrbAnimation(orb2Anim, {
    xRange: [0, -25],
    yRange: [0, 15],
    scaleRange: [1, 0.9],
  });

  const orb3Animation = createOrbAnimation(orb3Anim, {
    xRange: [0, 20],
    yRange: [0, 25],
    scaleRange: [1, 1.1],
  });

  const startAnimations = useCallback(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      // Fade out then finish
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onFinish);
    });

    // Floating orb animations (looped)
    const createOrbLoop = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createOrbLoop(orb1Anim, 3000);
    createOrbLoop(orb2Anim, 4000);
    createOrbLoop(orb3Anim, 3500);
  }, [fadeAnim, progressAnim, orb1Anim, orb2Anim, orb3Anim, onFinish]);

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  return {
    fadeAnim,
    progressAnim,
    orb1Animation,
    orb2Animation,
    orb3Animation,
    isAnimating: true,
  };
}
