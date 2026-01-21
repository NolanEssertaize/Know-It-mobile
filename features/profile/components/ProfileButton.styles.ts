/**
 * @file ProfileButton.styles.ts
 * @description Styles pour le bouton de profil
 */

import { StyleSheet } from 'react-native';
import { GlassColors } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// SIZE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const SIZE_CONFIG = {
    sm: { container: 36, icon: 20, fontSize: 14 },
    md: { container: 44, icon: 24, fontSize: 16 },
    lg: { container: 52, icon: 28, fontSize: 18 },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const styles = StyleSheet.create({
    container: {
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: GlassColors.accent.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },

    initials: {
        color: GlassColors.text.primary,
        fontWeight: '600',
    },
});