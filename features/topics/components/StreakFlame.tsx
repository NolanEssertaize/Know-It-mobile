/**
 * @file StreakFlame.tsx
 * @description GPU-accelerated fire + smoke particle system using Skia
 *
 * Renders a realistic flame burst with:
 * - Fire particles (yellow -> orange -> red, rising + fading)
 * - Glowing embers (small bright dots floating upward)
 * - Smoke wisps (gray translucent circles drifting up and expanding)
 * - Warm glow halo behind the flame core
 *
 * Plays once on mount (~2s), then calls onDone.
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Canvas,
    Circle,
    BlurMask,
    Group,
    Blur,
    vec,
    interpolateColors,
} from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    useFrameCallback,
    withTiming,
    withDelay,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CANVAS_W = 80;
const CANVAS_H = 100;
const CENTER_X = CANVAS_W / 2;
const FIRE_BASE_Y = CANVAS_H - 18; // flame origin near bottom

const DURATION = 2200; // total animation ms

// Fire color stops (life 1.0 -> 0.0)
const FIRE_COLOR_STOPS = [1.0, 0.75, 0.5, 0.25, 0.0];
const FIRE_COLORS = [
    'rgba(255, 255, 120, 1)',   // bright yellow core
    'rgba(255, 170, 0, 1)',     // orange
    'rgba(255, 70, 10, 0.9)',   // red-orange
    'rgba(200, 20, 0, 0.5)',    // dark red
    'rgba(80, 0, 0, 0)',        // transparent
];

// Smoke color stops
const SMOKE_COLOR_STOPS = [1.0, 0.5, 0.0];
const SMOKE_COLORS = [
    'rgba(120, 120, 120, 0.25)', // visible gray
    'rgba(100, 100, 100, 0.12)', // fading
    'rgba(80, 80, 80, 0)',       // gone
];

// ═══════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM (deterministic per particle index, worklet-safe)
// ═══════════════════════════════════════════════════════════════════════════

function seededRandom(seed: number): number {
    'worklet';
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE CONFIGS — pre-computed per particle
// ═══════════════════════════════════════════════════════════════════════════

interface ParticleConfig {
    startDelay: number;   // ms before this particle spawns
    lifetime: number;     // ms of active life
    startX: number;       // initial X offset from center
    driftX: number;       // horizontal drift over lifetime
    riseSpeed: number;    // px/s upward
    startRadius: number;
    endRadius: number;
    blurAmount: number;
}

function makeFireConfigs(count: number): ParticleConfig[] {
    const configs: ParticleConfig[] = [];
    for (let i = 0; i < count; i++) {
        const r1 = seededRandom(i * 3 + 1);
        const r2 = seededRandom(i * 3 + 2);
        const r3 = seededRandom(i * 3 + 3);
        const r4 = seededRandom(i * 3 + 4);
        configs.push({
            startDelay: r1 * 400,
            lifetime: 600 + r2 * 800,
            startX: (r3 - 0.5) * 16,
            driftX: (r4 - 0.5) * 20,
            riseSpeed: 45 + r1 * 35,
            startRadius: 4 + r2 * 6,
            endRadius: 1 + r3 * 2,
            blurAmount: 6 + r4 * 10,
        });
    }
    return configs;
}

function makeEmberConfigs(count: number): ParticleConfig[] {
    const configs: ParticleConfig[] = [];
    for (let i = 0; i < count; i++) {
        const r1 = seededRandom(i * 5 + 100);
        const r2 = seededRandom(i * 5 + 101);
        const r3 = seededRandom(i * 5 + 102);
        const r4 = seededRandom(i * 5 + 103);
        configs.push({
            startDelay: 100 + r1 * 600,
            lifetime: 500 + r2 * 700,
            startX: (r3 - 0.5) * 12,
            driftX: (r4 - 0.5) * 30,
            riseSpeed: 55 + r1 * 50,
            startRadius: 1.5 + r2 * 2.5,
            endRadius: 0.5,
            blurAmount: 3 + r3 * 4,
        });
    }
    return configs;
}

function makeSmokeConfigs(count: number): ParticleConfig[] {
    const configs: ParticleConfig[] = [];
    for (let i = 0; i < count; i++) {
        const r1 = seededRandom(i * 7 + 200);
        const r2 = seededRandom(i * 7 + 201);
        const r3 = seededRandom(i * 7 + 202);
        const r4 = seededRandom(i * 7 + 203);
        configs.push({
            startDelay: 200 + r1 * 500,
            lifetime: 800 + r2 * 600,
            startX: (r3 - 0.5) * 10,
            driftX: (r4 - 0.5) * 24,
            riseSpeed: 30 + r1 * 25,
            startRadius: 5 + r2 * 4,
            endRadius: 10 + r3 * 8,
            blurAmount: 12 + r4 * 10,
        });
    }
    return configs;
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE FIRE PARTICLE (Skia Circle with color interpolation + glow)
// ═══════════════════════════════════════════════════════════════════════════

function FireParticle({ config, elapsed }: { config: ParticleConfig; elapsed: { value: number } }) {
    const progress = useDerivedValue(() => {
        'worklet';
        const t = elapsed.value - config.startDelay;
        if (t < 0) return -1;
        return Math.min(t / config.lifetime, 1);
    });

    const life = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        return 1 - p;
    });

    const cx = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return CENTER_X;
        return CENTER_X + config.startX + config.driftX * p;
    });

    const cy = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return FIRE_BASE_Y;
        return FIRE_BASE_Y - config.riseSpeed * p;
    });

    const r = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        // Grow quickly then shrink
        const growPhase = Math.min(p / 0.2, 1);
        const shrinkPhase = p > 0.3 ? (p - 0.3) / 0.7 : 0;
        const baseR = config.startRadius * growPhase;
        return baseR * (1 - shrinkPhase * 0.7) + config.endRadius * shrinkPhase;
    });

    const color = useDerivedValue(() => {
        'worklet';
        return interpolateColors(life.value, FIRE_COLOR_STOPS, FIRE_COLORS);
    });

    const opacity = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        // Fade in quickly, hold, fade out
        if (p < 0.1) return p / 0.1;
        if (p > 0.6) return 1 - (p - 0.6) / 0.4;
        return 1;
    });

    return (
        <Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity}>
            <BlurMask blur={config.blurAmount} style="solid" />
        </Circle>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBER PARTICLE (tiny bright dot)
// ═══════════════════════════════════════════════════════════════════════════

function EmberParticle({ config, elapsed }: { config: ParticleConfig; elapsed: { value: number } }) {
    const progress = useDerivedValue(() => {
        'worklet';
        const t = elapsed.value - config.startDelay;
        if (t < 0) return -1;
        return Math.min(t / config.lifetime, 1);
    });

    const cx = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return CENTER_X;
        // Add a little wiggle
        const wiggle = Math.sin(p * 12) * 3;
        return CENTER_X + config.startX + config.driftX * p + wiggle;
    });

    const cy = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return FIRE_BASE_Y;
        return FIRE_BASE_Y - config.riseSpeed * p;
    });

    const r = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        return config.startRadius * (1 - p * 0.6);
    });

    const opacity = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        if (p < 0.1) return p / 0.1;
        return 1 - p;
    });

    return (
        <Circle cx={cx} cy={cy} r={r} color="rgba(255, 220, 80, 1)" opacity={opacity}>
            <BlurMask blur={config.blurAmount} style="solid" />
        </Circle>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SMOKE PARTICLE (gray expanding wisp)
// ═══════════════════════════════════════════════════════════════════════════

function SmokeParticle({ config, elapsed }: { config: ParticleConfig; elapsed: { value: number } }) {
    const progress = useDerivedValue(() => {
        'worklet';
        const t = elapsed.value - config.startDelay;
        if (t < 0) return -1;
        return Math.min(t / config.lifetime, 1);
    });

    const cx = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return CENTER_X;
        return CENTER_X + config.startX + config.driftX * p;
    });

    const cy = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return FIRE_BASE_Y - 20;
        return FIRE_BASE_Y - 20 - config.riseSpeed * p;
    });

    // Smoke expands as it rises
    const r = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        return config.startRadius + (config.endRadius - config.startRadius) * p;
    });

    const life = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        return 1 - p;
    });

    const color = useDerivedValue(() => {
        'worklet';
        return interpolateColors(life.value, SMOKE_COLOR_STOPS, SMOKE_COLORS);
    });

    const opacity = useDerivedValue(() => {
        'worklet';
        const p = progress.value;
        if (p < 0) return 0;
        if (p < 0.15) return (p / 0.15) * 0.3;
        return 0.3 * (1 - p);
    });

    return (
        <Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity}>
            <BlurMask blur={config.blurAmount} style="normal" />
        </Circle>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — StreakFlame
// ═══════════════════════════════════════════════════════════════════════════

interface StreakFlameProps {
    onDone: () => void;
}

export function StreakFlame({ onDone }: StreakFlameProps) {
    const elapsed = useSharedValue(0);
    const running = useSharedValue(true);

    // Pre-compute particle configs (stable across renders)
    const fireConfigs = useMemo(() => makeFireConfigs(14), []);
    const emberConfigs = useMemo(() => makeEmberConfigs(10), []);
    const smokeConfigs = useMemo(() => makeSmokeConfigs(6), []);

    // Glow animation
    const glowOpacity = useSharedValue(0);
    const glowRadius = useSharedValue(5);

    // Icon reveal animation — fades in + scales up as flames settle
    const iconOpacity = useSharedValue(0);
    const iconScale = useSharedValue(0.3);

    useEffect(() => {
        // Warm glow pulse
        glowOpacity.value = withSequence(
            withTiming(0.5, { duration: 250, easing: Easing.out(Easing.ease) }),
            withDelay(800, withTiming(0, { duration: 900, easing: Easing.in(Easing.ease) })),
        );
        glowRadius.value = withSequence(
            withTiming(18, { duration: 300, easing: Easing.out(Easing.ease) }),
            withDelay(600, withTiming(22, { duration: 1000 })),
        );

        // Icon appears from the flames at ~60% through
        iconOpacity.value = withDelay(1100,
            withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
        );
        iconScale.value = withDelay(1100, withSequence(
            withTiming(1.25, { duration: 300, easing: Easing.out(Easing.back(3)) }),
            withTiming(1, { duration: 250, easing: Easing.inOut(Easing.ease) }),
        ));

        // End timer
        const timer = setTimeout(() => onDone(), DURATION);
        return () => clearTimeout(timer);
    }, []);

    // Frame callback — just increment elapsed time
    useFrameCallback((info) => {
        'worklet';
        if (!running.value) return;
        elapsed.value = info.timeSinceFirstFrame ?? 0;
        if (elapsed.value > DURATION) {
            running.value = false;
        }
    });

    const glowOp = useDerivedValue(() => glowOpacity.value);
    const glowR = useDerivedValue(() => glowRadius.value);

    const iconAnimStyle = useAnimatedStyle(() => ({
        opacity: iconOpacity.value,
        transform: [{ scale: iconScale.value }],
    }));

    return (
        <View style={componentStyles.container}>
            {/* Skia particle canvas */}
            <Canvas style={componentStyles.canvas}>
                {/* Layer 1: Warm glow halo */}
                <Circle
                    cx={CENTER_X}
                    cy={FIRE_BASE_Y}
                    r={glowR}
                    color="rgba(255, 120, 0, 1)"
                    opacity={glowOp}
                >
                    <BlurMask blur={20} style="normal" />
                </Circle>

                {/* Layer 2: Smoke wisps (behind fire) */}
                <Group>
                    {smokeConfigs.map((cfg, i) => (
                        <SmokeParticle key={`s${i}`} config={cfg} elapsed={elapsed} />
                    ))}
                </Group>

                {/* Layer 3: Fire glow layer (blurred copies for ambient light) */}
                <Group>
                    <Blur blur={12} />
                    {fireConfigs.slice(0, 6).map((cfg, i) => (
                        <FireParticle key={`fg${i}`} config={{ ...cfg, startRadius: cfg.startRadius * 1.4, blurAmount: 0 }} elapsed={elapsed} />
                    ))}
                </Group>

                {/* Layer 4: Fire particles (main) */}
                <Group>
                    {fireConfigs.map((cfg, i) => (
                        <FireParticle key={`f${i}`} config={cfg} elapsed={elapsed} />
                    ))}
                </Group>

                {/* Layer 5: Hot embers (on top) */}
                <Group>
                    {emberConfigs.map((cfg, i) => (
                        <EmberParticle key={`e${i}`} config={cfg} elapsed={elapsed} />
                    ))}
                </Group>
            </Canvas>

            {/* Fire icon — revealed by the flames */}
            <Animated.View style={[componentStyles.iconOverlay, iconAnimStyle]}>
                <MaterialCommunityIcons name="fire" size={22} color="#FF3B30" />
            </Animated.View>
        </View>
    );
}

const componentStyles = StyleSheet.create({
    container: {
        width: CANVAS_W,
        height: CANVAS_H,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    canvas: {
        width: CANVAS_W,
        height: CANVAS_H,
        position: 'absolute',
    },
    iconOverlay: {
        position: 'absolute',
        bottom: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default StreakFlame;
