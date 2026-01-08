/**
 * @file ScoreGauge.tsx
 * @description Composant d'affichage du score avec cercle et animation fonctionnelle
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GlassView } from '@/shared/components';
import { GlassColors, Spacing, BorderRadius } from '@/theme';
import { useScoreGaugeAnimation } from '@/features/result/hooks/useScoreGauge';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CIRCLE_SIZE = 180;
const CIRCLE_STROKE = 10;

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
    const { displayValue, rotation } = useScoreGaugeAnimation(value);

    // Animated style for progress ring
    const animatedProgressStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value - 45}deg` }],
    }));

    return (
        <GlassView variant="default" style={styles.container}>
            {/* Score Circle Display */}
            <View style={styles.circleContainer}>
                {/* Background Circle Track */}
                <View style={[styles.circleTrack, { borderColor: `${color}20` }]} />

                {/* Animated Progress Ring */}
                <Animated.View
                    style={[
                        styles.progressRing,
                        { borderTopColor: color, borderRightColor: color },
                        animatedProgressStyle
                    ]}
                />

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

    circleTrack: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: CIRCLE_STROKE,
    },

    progressRing: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: CIRCLE_STROKE,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
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