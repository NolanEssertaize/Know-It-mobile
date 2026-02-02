/**
 * @file ScoreGauge/index.tsx
 * @description Circular score gauge with animated progress
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme, Spacing, Typography } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreGauge = memo(function ScoreGauge({
  score,
  size = 180,
  strokeWidth = 12,
}: ScoreGaugeProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const progress = useSharedValue(0);

  // Animated progress
  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [score, progress]);

  // Circle calculations
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated stroke dash offset
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Get color based on score
  const getScoreColor = () => {
    if (score >= 80) return colors.status.success;
    if (score >= 60) return colors.status.warning;
    return colors.status.error;
  };

  // Get feedback text
  const getFeedbackText = () => {
    if (score >= 80) return t('result.feedback.excellent');
    if (score >= 60) return t('result.feedback.good');
    return t('result.feedback.needsWork');
  };

  const scoreColor = getScoreColor();

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.glass.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Score Text */}
      <View style={[styles.scoreContainer, { width: size, height: size }]}>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}%</Text>
        <Text style={[styles.feedbackText, { color: colors.text.secondary }]}>
          {getFeedbackText()}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  feedbackText: {
    ...Typography.body.medium,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
});
