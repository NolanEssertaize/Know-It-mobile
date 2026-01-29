/**
 * @file WelcomeScreen.tsx
 * @description Vue Dumb pour l'écran de bienvenue avec animations
 */

import React, { memo } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassColors } from '@/theme';
import { useWelcome } from '../hooks/useWelcome';
import { styles } from './WelcomeScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WelcomeScreenProps {
  onFinish: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function WelcomeScreenComponent({ onFinish }: WelcomeScreenProps): React.JSX.Element {
  const {
    fadeAnim,
    progressAnim,
    orb1Animation,
    orb2Animation,
    orb3Animation,
  } = useWelcome(onFinish);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[GlassColors.gradient.start, GlassColors.gradient.middle, GlassColors.gradient.end]}
        style={styles.gradient}
      />

      {/* Floating orbs */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orb,
            styles.orb1,
            {
              transform: [
                { translateX: orb1Animation.translateX },
                { translateY: orb1Animation.translateY },
                { scale: orb1Animation.scale },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb2,
            {
              transform: [
                { translateX: orb2Animation.translateX },
                { translateY: orb2Animation.translateY },
                { scale: orb2Animation.scale },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb3,
            {
              transform: [
                { translateX: orb3Animation.translateX },
                { translateY: orb3Animation.translateY },
                { scale: orb3Animation.scale },
              ],
            },
          ]}
        />
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
            style={styles.logoGradient}
          >
            <View style={styles.logoInner}>
              <Text style={styles.logoIcon}>K</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Text */}
        <Text style={styles.title}>Know it</Text>
        <Text style={styles.subtitle}>Mémorisez. Maîtrisez.</Text>

        {/* Loading bar */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[styles.loadingProgress, { width: progressWidth }]}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

export const WelcomeScreen = memo(WelcomeScreenComponent);
export default WelcomeScreen;
