/**
 * @file UsageIndicator.tsx
 * @description Compact usage display for home screen with animated bars
 */

import React, { memo, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useSubscription } from '../hooks/useSubscription';

const AnimatedBar = memo(function AnimatedBar({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.max(progress * 100, 4),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.miniTrack, { backgroundColor: colors.surface.glass }]}>
      <Animated.View
        style={[
          styles.miniFill,
          {
            backgroundColor: color,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
});

export const UsageIndicator = memo(function UsageIndicator() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const sub = useSubscription();

  // Refresh usage every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      sub.fetchUsage();
    }, [sub.fetchUsage]),
  );

  const handlePress = () => {
    router.push('/profile?tab=subscription');
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <GlassView style={styles.container}>
        {/* Sessions bar */}
        <View style={styles.barGroup}>
          <AnimatedBar progress={sub.sessionsProgress} color={sub.sessionsColor} />
          <Text style={[styles.text, { color: colors.text.secondary }]}>
            {t('subscription.usage.remaining', { count: sub.sessionsRemaining })}{' '}
            {t('subscription.usage.sessions').toLowerCase()}
          </Text>
        </View>

        {/* Generations bar */}
        <View style={styles.barGroup}>
          <AnimatedBar progress={sub.generationsProgress} color={sub.generationsColor} />
          <Text style={[styles.text, { color: colors.text.secondary }]}>
            {t('subscription.usage.remaining', { count: sub.generationsRemaining })}{' '}
            {t('subscription.usage.generations').toLowerCase()}
          </Text>
        </View>
      </GlassView>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  barGroup: {
    marginBottom: Spacing.xs,
  },
  miniTrack: {
    height: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  text: {
    fontSize: 11,
    textAlign: 'center',
  },
});
