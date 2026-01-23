/**
 * @file VoiceRecordButton.tsx
 * @description Bouton d'enregistrement vocal - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

interface VoiceRecordButtonProps {
    isRecording: boolean;
    audioLevel: number; // 0 to 1
    onPress: () => void;
    size?: number;
    disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// PULSE RING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PulseRingProps {
    size: number;
    audioLevel: number;
    isActive: boolean;
    color: string;
}

const PulseRing = memo(function PulseRing({
    size,
    audioLevel,
    isActive,
    color,
}: PulseRingProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            opacity.value = withTiming(0.3, { duration: 300 });
            const targetScale = 1 + (audioLevel * 1.5);
            scale.value = withSpring(targetScale, {
                damping: 10,
                stiffness: 80,
                mass: 0.5,
            });
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(1, { duration: 200 });
        }
    }, [isActive, audioLevel]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.pulseRing,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: color,
                },
                animatedStyle,
            ]}
        />
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const VoiceRecordButton = memo(function VoiceRecordButton({
    isRecording,
    audioLevel,
    onPress,
    size = 100,
    disabled = false,
}: VoiceRecordButtonProps) {
    const { colors } = useTheme();
    
    // Animation values
    const buttonScale = useSharedValue(1);
    const breathe = useSharedValue(1);

    // Haptic feedback
    useEffect(() => {
        if (isRecording) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [isRecording]);

    // Breathing animation when idle
    useEffect(() => {
        if (!isRecording) {
            breathe.value = withRepeat(
                withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        } else {
            breathe.value = withTiming(1, { duration: 200 });
        }
    }, [isRecording]);

    // Button press animation
    const handlePressIn = () => {
        buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    // Animated styles
    const buttonAnimatedStyle = useAnimatedStyle(() => {
        const scale = isRecording ? 1 : breathe.value;
        return {
            transform: [{ scale: buttonScale.value * scale }],
        };
    });

    // Determine button appearance based on state
    const buttonBackground = isRecording
        ? colors.text.primary
        : colors.surface.glass;

    const buttonBorder = isRecording
        ? colors.text.primary
        : colors.glass.borderLight;

    const textColor = isRecording
        ? colors.text.inverse
        : colors.text.primary;

    return (
        <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }]}>
            {/* Pulse ring */}
            <View style={styles.pulseContainer}>
                <PulseRing
                    size={size}
                    audioLevel={audioLevel}
                    isActive={isRecording}
                    color={colors.text.primary}
                />
            </View>

            {/* Main button */}
            <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    disabled={disabled}
                    style={[
                        styles.button,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: buttonBackground,
                            borderWidth: isRecording ? 0 : 2,
                            borderColor: buttonBorder,
                        },
                    ]}
                >
                    {/* Inner ring for visual depth */}
                    <View
                        style={[
                            styles.innerRing,
                            {
                                width: size * 0.85,
                                height: size * 0.85,
                                borderRadius: size * 0.425,
                                borderColor: isRecording
                                    ? colors.text.inverse + '20'
                                    : colors.text.primary + '20',
                            },
                        ]}
                    />

                    {/* Icon: Stop square when recording, "PARLER" text when idle */}
                    {isRecording ? (
                        <View
                            style={[
                                styles.stopIcon,
                                { backgroundColor: textColor },
                            ]}
                        />
                    ) : (
                        <Text style={[styles.buttonText, { color: textColor }]}>
                            PARLER
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseRing: {
        position: 'absolute',
        borderWidth: 2,
    },

    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    innerRing: {
        position: 'absolute',
        borderWidth: 1,
    },

    stopIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default VoiceRecordButton;
