/**
 * @file ScoreGauge.styles.ts
 * @description Styles pour le composant ScoreGauge - Version améliorée
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

const CIRCLE_SIZE = 200;
const CIRCLE_STROKE = 12;

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
    },

    // Circle Container
    circleContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    // Background track
    circleBackground: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },

    circleTrack: {
        width: CIRCLE_SIZE - CIRCLE_STROKE,
        height: CIRCLE_SIZE - CIRCLE_STROKE,
        borderRadius: (CIRCLE_SIZE - CIRCLE_STROKE) / 2,
        borderWidth: CIRCLE_STROKE,
    },

    // Progress container for rotation
    progressContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },

    progressArc: {
        width: CIRCLE_SIZE - CIRCLE_STROKE,
        height: CIRCLE_SIZE - CIRCLE_STROKE,
        borderRadius: (CIRCLE_SIZE - CIRCLE_STROKE) / 2,
        borderWidth: CIRCLE_STROKE,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: '-45deg' }],
    },

    // Center content
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    scoreRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },

    scoreValue: {
        fontSize: 56,
        fontWeight: '700',
        letterSpacing: -2,
    },

    scoreUnit: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 2,
    },

    label: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: Spacing.xs,
        textAlign: 'center',
    },

    // Glow effect
    glowEffect: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 60,
        borderRadius: BorderRadius.full,
        opacity: 0.5,
    },
});