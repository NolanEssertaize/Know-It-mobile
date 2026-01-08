/**
 * @file VoiceRecordButton.tsx
 * @description Bouton d'enregistrement vocal style "Gemini Glow"
 * Correction: Ajout du retour haptique + Centrage parfait de l'icône stop.
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing, // Import correct pour Reanimated
    interpolate,
    Extrapolation,
    withSpring,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics'; // Import pour les vibrations

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

interface VoiceRecordButtonProps {
    isRecording: boolean;
    audioLevel: number; // 0 à 1
    onPress: () => void;
    size?: number;
    disabled?: boolean;
}

const GLOW_COLORS = {
    core: '#FFFFFF',
    primary: '#00D4FF',
    secondary: '#4285F4',
    accent: '#7B2CBF',
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANT : ORBE DE LUMIÈRE
// ═══════════════════════════════════════════════════════════════════════════

const GlowingOrb = ({ color, size, opacity = 1 }: { color: string; size: number; opacity?: number }) => (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
            <RadialGradient
                id={`grad-${color}`}
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
                gradientUnits="userSpaceOnUse"
            >
                <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
                <Stop offset="50%" stopColor={color} stopOpacity={opacity * 0.5} />
                <Stop offset="100%" stopColor={color} stopOpacity={0} />
            </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#grad-${color})`} />
    </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const VoiceRecordButton = memo(function VoiceRecordButton({
                                                                     isRecording,
                                                                     audioLevel,
                                                                     onPress,
                                                                     size = 100,
                                                                     disabled = false,
                                                                 }: VoiceRecordButtonProps) {

    // --- Valeurs partagées pour l'animation ---
    const rotation = useSharedValue(0);
    const pulse = useSharedValue(1);
    const audioScale = useSharedValue(0);

    // --- Gestion du retour Haptique ---
    useEffect(() => {
        if (isRecording) {
            // Vibration nette au début de l'enregistrement
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            // Petite vibration de confirmation à la fin (facultatif, retire si trop verbeux)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [isRecording]);

    // --- Boucle d'animation continue ---
    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 8000, easing: Easing.linear }),
            -1
        );

        pulse.value = withRepeat(
            withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    // --- Réaction à l'audio ---
    useEffect(() => {
        if (isRecording) {
            audioScale.value = withSpring(audioLevel, {
                damping: 10,
                stiffness: 80,
                mass: 0.5
            });
        } else {
            audioScale.value = withSpring(0);
        }
    }, [audioLevel, isRecording]);

    // --- Styles Animés ---
    const styleOrbPrimary = useAnimatedStyle(() => {
        const scale = interpolate(audioScale.value, [0, 1], [0.8, 1.8], Extrapolation.CLAMP);
        return {
            opacity: isRecording ? 0.8 : 0,
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: withTiming(isRecording ? scale : 0, { duration: 300 }) }
            ]
        };
    });

    const styleOrbSecondary = useAnimatedStyle(() => {
        const scale = interpolate(audioScale.value, [0, 1], [0.9, 2.2], Extrapolation.CLAMP);
        return {
            opacity: isRecording ? 0.6 : 0,
            transform: [
                { rotate: `-${rotation.value * 0.7}deg` },
                { scale: withTiming(isRecording ? scale : 0, { duration: 400 }) }
            ]
        };
    });

    const styleButton = useAnimatedStyle(() => {
        const baseScale = isRecording
            ? interpolate(audioScale.value, [0, 1], [1, 1.15])
            : pulse.value;
        return { transform: [{ scale: baseScale }] };
    });

    const ORB_SIZE = size * 2;

    return (
        <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }]}>

            {/* GLOW BACKGROUND */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={styles.centerAbsolute}>
                    <Animated.View style={styleOrbSecondary}>
                        <GlowingOrb color={GLOW_COLORS.secondary} size={ORB_SIZE} opacity={0.5} />
                    </Animated.View>
                </View>

                <View style={styles.centerAbsolute}>
                    <Animated.View style={styleOrbPrimary}>
                        <GlowingOrb color={GLOW_COLORS.primary} size={ORB_SIZE} opacity={0.6} />
                    </Animated.View>
                </View>
            </View>

            {/* BUTTON */}
            <Animated.View style={[styles.buttonWrapper, styleButton]}>
                <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.9}
                    disabled={disabled}
                    style={{ width: size, height: size }}
                >
                    <LinearGradient
                        colors={isRecording ? [GLOW_COLORS.primary, GLOW_COLORS.secondary] : ['#ffffff', '#f0f0f0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                shadowColor: isRecording ? GLOW_COLORS.primary : "#000",
                                shadowOpacity: isRecording ? 0.5 : 0.1,
                                shadowRadius: isRecording ? 20 : 10,
                                elevation: 8,
                            }
                        ]}
                    >
                        <View style={[
                            styles.innerRing,
                            {
                                borderRadius: size / 2,
                                borderColor: isRecording ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)'
                            }
                        ]} />

                        {/* Correction Centrage : Rendu Conditionnel Strict */}
                        {isRecording ? (
                            <View style={styles.stopIcon} />
                        ) : (
                            <Text style={styles.buttonText}>PARLER</Text>
                        )}

                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerAbsolute: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWrapper: {
        zIndex: 10,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
    },
    innerRing: {
        position: 'absolute',
        top: 2, left: 2, right: 2, bottom: 2,
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#333',
    },
    stopIcon: {
        width: 20, // Légèrement réduit pour l'élégance
        height: 20,
        backgroundColor: '#FFF',
        borderRadius: 4,
    }
});

export default VoiceRecordButton;