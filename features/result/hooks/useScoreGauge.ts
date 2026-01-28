/**
 * @file useScoreGauge.ts
 * @description Logic Controller pour l'animation du ScoreGauge
 *
 * FIXED:
 * - Animation now properly resets when targetValue changes
 * - Added cleanup for animation frame
 * - Fixed initial state to ensure animation always runs from 0
 */

import { useEffect, useState, useRef } from 'react';
import {
    useSharedValue,
    withTiming,
    Easing,
    type SharedValue,
} from 'react-native-reanimated';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface UseScoreGaugeAnimationReturn {
    /** Display value as string (animated) */
    displayValue: string;
    /** Shared value for rotation animation */
    rotation: SharedValue<number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const ANIMATION_DURATION = 1500;

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useScoreGaugeAnimation(targetValue: number): UseScoreGaugeAnimationReturn {
    const [displayValue, setDisplayValue] = useState('0');
    const rotation = useSharedValue(0);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    // Animate to target value
    useEffect(() => {
        // Cancel any existing animation
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Reset to initial state
        setDisplayValue('0');
        rotation.value = 0;

        // Small delay to ensure reset is visible before starting animation
        const timeoutId = setTimeout(() => {
            // Animate the rotation (0 to 360 degrees based on percentage)
            rotation.value = withTiming((targetValue / 100) * 360, {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.cubic),
            });

            // Animate the display value using JS interval
            startTimeRef.current = Date.now();
            const startValue = 0;
            const endValue = targetValue;

            const animateValue = () => {
                const elapsed = Date.now() - startTimeRef.current;
                const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
                // Apply easing: cubic ease out
                const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
                const currentValue = startValue + (endValue - startValue) * easedProgress;

                setDisplayValue(Math.round(currentValue).toString());

                if (rawProgress < 1) {
                    animationFrameRef.current = requestAnimationFrame(animateValue);
                } else {
                    // Ensure final value is exact
                    setDisplayValue(Math.round(endValue).toString());
                    animationFrameRef.current = null;
                }
            };

            animationFrameRef.current = requestAnimationFrame(animateValue);
        }, 50); // Small delay for reset to be visible

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [targetValue, rotation]);

    return {
        displayValue,
        rotation,
    };
}