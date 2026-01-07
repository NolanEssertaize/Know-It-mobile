import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Circle, Paint, BlurMask, useDerivedValue, mix } from '@shopify/react-native-skia';
import { THEME } from '../theme/theme';

/**
 * Un anneau unique qui réagit au niveau audio.
 * On peut en empiler plusieurs avec des paramètres différents.
 */
const ReactiveRing = ({ center, baseRadius, audioLevel, responsiveness, thickness, opacityFactor }) => {

    // Le rayon change dynamiquement en fonction du niveau audio
    const animatedRadius = useDerivedValue(() => {
        // mix(progress, startValue, endValue)
        // Plus 'responsiveness' est élevé, plus l'anneau bouge fort.
        return mix(audioLevel.value, baseRadius, baseRadius + (40 * responsiveness));
    }, [audioLevel]);

    // L'opacité change aussi pour un effet de "flash" lumineux
    const animatedOpacity = useDerivedValue(() => {
        return mix(audioLevel.value, 0.3 * opacityFactor, 1.0 * opacityFactor);
    }, [audioLevel]);

    // L'épaisseur du trait change légèrement
    const animatedStroke = useDerivedValue(() => {
        return mix(audioLevel.value, thickness, thickness + 2);
    }, [audioLevel]);

    return (
        <Circle c={center} r={animatedRadius}>
            {/* Paint définit le style : couleur, trait, flou (glow) */}
            <Paint
                style="stroke"
                strokeWidth={animatedStroke}
                color={THEME.colors.primary}
                opacity={animatedOpacity}
            >
                {/* C'est le BlurMask qui crée l'effet Néon réaliste */}
                <BlurMask blur={10} style="solid" />
            </Paint>

            {/* Deuxième Paint pour le cœur du trait blanc/bleu très chaud, pour plus de réalisme */}
            <Paint
                style="stroke"
                strokeWidth={thickness / 2}
                color="#FFFFFF"
                opacity={useDerivedValue(() => mix(audioLevel.value, 0.1, 0.6))}
            />
        </Circle>
    );
};

export const ActiveRecordingVisualizer = ({ audioLevel, size = 300 }) => {
    const center = { x: size / 2, y: size / 2 };
    const baseRingRadius = (size / 2) - 60; // Laisser de la place pour le bouton central

    return (
        // Le Canvas doit avoir une taille définie
        <View style={{ width: size, height: size, ...styles.centeringContainer }}>
            <Canvas style={{ flex: 1 }}>
                {/* Anneau extérieur : Lent, grand mouvement, faible opacité */}
                <ReactiveRing
                    center={center}
                    baseRadius={baseRingRadius}
                    audioLevel={audioLevel}
                    responsiveness={1.2}
                    thickness={2}
                    opacityFactor={0.5}
                />

                {/* Anneau intermédiaire : Vitesse moyenne */}
                <ReactiveRing
                    center={center}
                    baseRadius={baseRingRadius - 20}
                    audioLevel={audioLevel}
                    responsiveness={0.8}
                    thickness={3}
                    opacityFactor={0.7}
                />

                {/* Anneau intérieur : Très rapide, petit mouvement, très lumineux (le cœur de l'énergie) */}
                <ReactiveRing
                    center={center}
                    baseRadius={baseRingRadius - 35}
                    audioLevel={audioLevel}
                    responsiveness={0.4}
                    thickness={4}
                    opacityFactor={1}
                />
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    // Astuce pour centrer absolument le canvas sous le bouton
    centeringContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        // pointerEvents: 'none' est important pour que le canvas ne bloque pas les touches sur le bouton au dessus
        pointerEvents: 'none',
    }
});