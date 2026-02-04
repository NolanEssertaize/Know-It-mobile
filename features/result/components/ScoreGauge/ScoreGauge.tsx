/**
 * @file ScoreGauge.tsx
 * @description Composant d'affichage du score avec animation circulaire SVG
 *
 * FIXED: Now uses SVG for proper circular progress animation
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    useDerivedValue,
    runOnJS,
} from 'react-native-reanimated';
import { GlassView } from '@/shared/components';
import { Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 10;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIMATION_DURATION = 1500;

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScoreGaugeProps {
    /** Score value (0-100) */
    readonly value: number;
    /** Label to display */
    readonly label: string;
    /** Color for the score (passed from parent using useTheme) */
    readonly color: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ScoreGaugeComponent({ value, label, color }: ScoreGaugeProps): React.JSX.Element {
    const progress = useSharedValue(0);
    const [displayValue, setDisplayValue] = React.useState(0);

    // Animate progress when value changes
    useEffect(() => {
        // Reset to 0 first
        progress.value = 0;
        setDisplayValue(0);

        // Small delay before starting animation
        const timeout = setTimeout(() => {
            progress.value = withTiming(value / 100, {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.cubic),
            });
        }, 100);

        return () => clearTimeout(timeout);
    }, [value, progress]);

    // Update display value based on progress
    useDerivedValue(() => {
        const currentValue = Math.round(progress.value * 100);
        runOnJS(setDisplayValue)(currentValue);
    }, [progress]);

    // Animated props for the progress circle
    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
        return {
            strokeDashoffset,
        };
    });

    return (
        <GlassView variant="default" style={styles.container}>
            {/* Score Circle Display */}
            <View style={styles.circleContainer}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
                    {/* Background Circle Track */}
                    <Circle
                        cx={CIRCLE_SIZE / 2}
                        cy={CIRCLE_SIZE / 2}
                        r={RADIUS}
                        stroke={`${color}20`}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />
                    {/* Animated Progress Circle */}
                    <AnimatedCircle
                        cx={CIRCLE_SIZE / 2}
                        cy={CIRCLE_SIZE / 2}
                        r={RADIUS}
                        stroke={color}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        animatedProps={animatedProps}
                        transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                    />
                </Svg>

                {/* Center Score Display */}
                <View style={styles.centerContent}>
                    <View style={styles.scoreRow}>
                        <Text style={[styles.scoreValue, { color }]}>{displayValue}</Text>
                        <Text style={[styles.scoreUnit, { color: `${color}99` }]}>%</Text>
                    </View>
                    <Text style={[styles.label, { color }]}>{label}</Text>
                </View>
            </View>
        </GlassView>
    );
}

export const ScoreGauge = memo(ScoreGaugeComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
    },

    circleContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    svg: {
        position: 'absolute',
    },

    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    scoreRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },

    scoreValue: {
        fontSize: 52,
        fontWeight: '700',
        letterSpacing: -2,
    },

    scoreUnit: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 2,
    },

    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
});

export default ScoreGauge;
