/**
 * @file ScoreGauge.tsx
 * @description Composant d'affichage du score avec gauge circulaire
 */

import React, { memo, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from '@/shared/components';
import { styles } from './ScoreGauge.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScoreGaugeProps {
  /** Score value (0-100) */
  readonly value: number;
  /** Label to display */
  readonly label: string;
  /** Color for the score */
  readonly color: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ScoreGaugeComponent({ value, label, color }: ScoreGaugeProps): React.JSX.Element {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: value / 100,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(displayValue, {
        toValue: value,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, animatedValue, displayValue]);

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <GlassView variant="default" style={styles.container}>
      <View style={styles.gaugeContainer}>
        {/* Background arc */}
        <View style={styles.gaugeBackground}>
          <View style={[styles.gaugeHalf, styles.gaugeLeft]} />
          <View style={[styles.gaugeHalf, styles.gaugeRight]} />
        </View>

        {/* Animated arc */}
        <Animated.View
          style={[
            styles.gaugeProgress,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <LinearGradient
            colors={[color, `${color}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gaugeProgressInner}
          />
        </Animated.View>

        {/* Center content */}
        <View style={styles.gaugeCenter}>
          <Animated.Text style={[styles.scoreValue, { color }]}>
            {displayValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0', '100'],
              extrapolate: 'clamp',
            })}
          </Animated.Text>
          <Text style={styles.scoreUnit}>%</Text>
        </View>
      </View>

      <Text style={[styles.label, { color }]}>{label}</Text>
    </GlassView>
  );
}

export const ScoreGauge = memo(ScoreGaugeComponent);
