/**
 * Welcome Screen - Splash animé
 * Background avec orbes LED animées et texte de bienvenue
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassColors } from '@/theme/theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
    onFinish: () => void;
}

// Configuration des orbes LED
const LED_ORBS = [
    { size: 180, x: -40, y: 80, delay: 0 },
    { size: 120, x: width - 80, y: 150, delay: 200 },
    { size: 200, x: width / 2 - 100, y: height / 2 - 50, delay: 400 },
    { size: 90, x: 30, y: height - 250, delay: 100 },
    { size: 150, x: width - 120, y: height - 300, delay: 300 },
    { size: 70, x: width / 2 + 50, y: 200, delay: 500 },
    { size: 100, x: 80, y: height / 2 + 100, delay: 250 },
];

const LedOrb = ({
                    size,
                    x,
                    y,
                    delay
                }: {
    size: number;
    x: number;
    y: number;
    delay: number;
}) => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation de pulsation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 2000 + delay,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 2000 + delay,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        // Animation de flottement
        const floatAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 15,
                    duration: 3000 + delay,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: -15,
                    duration: 3000 + delay,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        setTimeout(() => {
            pulseAnimation.start();
            floatAnimation.start();
        }, delay);

        return () => {
            pulseAnimation.stop();
            floatAnimation.stop();
        };
    }, []);

    return (
        <Animated.View
            style={[
                styles.orbContainer,
                {
                    width: size,
                    height: size,
                    left: x,
                    top: y,
                    opacity: pulseAnim,
                    transform: [{ translateY: floatAnim }],
                },
            ]}
        >
            <LinearGradient
                colors={[
                    'rgba(0, 212, 255, 0.6)',
                    'rgba(0, 212, 255, 0.2)',
                    'rgba(0, 212, 255, 0)',
                ]}
                style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
            />
        </Animated.View>
    );
};

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Transition vers le dashboard après 3 secondes
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={[
                    GlassColors.gradient.start,
                    GlassColors.gradient.middle,
                    GlassColors.gradient.end,
                ]}
                style={styles.gradient}
            />

            {/* LED Orbs */}
            {LED_ORBS.map((orb, index) => (
                <LedOrb key={index} {...orb} />
            ))}

            {/* Contenu */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: logoScale },
                        ],
                    },
                ]}
            >
                {/* Logo / Icône */}
                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                        style={styles.logoGradient}
                    >
                        <View style={styles.logoInner}>
                            <Text style={styles.logoIcon}>K</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Texte de bienvenue */}
                <Text style={styles.title}>KnowIt</Text>
                <Text style={styles.subtitle}>Apprenez. Mémorisez. Maîtrisez.</Text>

                {/* Indicateur de chargement */}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingBar}>
                        <Animated.View style={styles.loadingProgress} />
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GlassColors.gradient.end,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    orbContainer: {
        position: 'absolute',
    },
    orb: {
        position: 'absolute',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        marginBottom: 32,
    },
    logoGradient: {
        width: 100,
        height: 100,
        borderRadius: 28,
        padding: 3,
        shadowColor: GlassColors.accent.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    logoInner: {
        flex: 1,
        backgroundColor: GlassColors.gradient.middle,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 48,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    title: {
        fontSize: 42,
        fontWeight: '700',
        color: GlassColors.text.primary,
        marginBottom: 12,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: GlassColors.text.secondary,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        width: 200,
    },
    loadingBar: {
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingProgress: {
        height: '100%',
        width: '100%',
        backgroundColor: GlassColors.accent.primary,
        borderRadius: 2,
    },
});