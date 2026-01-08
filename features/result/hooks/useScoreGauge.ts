/**
 * @file useScoreGauge.ts
 * @description Logic Controller pour l'animation du ScoreGauge
 */

import { useEffect, useState } from 'react';
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

    // Animate to target value
    useEffect(() => {
        // Animate the rotation (0 to 360 degrees based on percentage)
        rotation.value = withTiming((targetValue / 100) * 360, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
        });

        // Animate the display value using JS interval
        const startTime = Date.now();
        const startValue = 0;
        const endValue = targetValue;

        const animateValue = () => {
            const elapsed = Date.now() - startTime;
            const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
            // Apply easing: cubic ease out
            const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
            const currentValue = startValue + (endValue - startValue) * easedProgress;

            setDisplayValue(Math.round(currentValue).toString());

            if (rawProgress < 1) {
                requestAnimationFrame(animateValue);
            }
        };

        requestAnimationFrame(animateValue);
    }, [targetValue, rotation]);

    return {
        displayValue,
        rotation,
    };
}