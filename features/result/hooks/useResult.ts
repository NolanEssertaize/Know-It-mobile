/**
 * @file useResult.ts
 * @description Logic Controller pour l'écran de résultats
 *
 * MODIFICATIONS:
 * - icon (emoji) remplacé par iconName (nom d'icône MaterialIcons)
 */

import { useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { AnalysisResult } from '@/types';
import { GlassColors } from '@/theme';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScoreData {
    value: number;
    label: string;
    color: string;
}

export interface AnalysisSection {
    id: string;
    title: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    items: string[];
    color: string;
    glowColor: string;
}

export interface UseResultReturn {
    // Data
    analysis: AnalysisResult;
    score: ScoreData;
    sections: AnalysisSection[];

    // Methods
    handleClose: () => void;
    handleRetry: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function parseJsonParam<T>(param: string | string[] | undefined, fallback: T): T {
    if (!param || Array.isArray(param)) return fallback;
    try {
        return JSON.parse(param);
    } catch {
        return fallback;
    }
}

function calculateScore(analysis: AnalysisResult): ScoreData {
    const total = analysis.valid.length + analysis.corrections.length + analysis.missing.length;
    const value = total > 0 ? Math.round((analysis.valid.length / total) * 100) : 0;

    if (value >= 70) {
        return { value, label: 'Excellent !', color: GlassColors.semantic.success };
    }
    if (value >= 40) {
        return { value, label: 'Bien, continuez !', color: GlassColors.semantic.warning };
    }
    return { value, label: 'À améliorer', color: GlassColors.semantic.error };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useResult(): UseResultReturn {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Parse params
    const analysis = useMemo(
        (): AnalysisResult => ({
            valid: parseJsonParam(params.valid, []),
            corrections: parseJsonParam(params.corrections, []),
            missing: parseJsonParam(params.missing, []),
        }),
        [params.valid, params.corrections, params.missing]
    );

    // Calculate score
    const score = useMemo(() => calculateScore(analysis), [analysis]);

    // Build sections - Icônes Material au lieu d'émojis
    const sections = useMemo(
        (): AnalysisSection[] => [
            {
                id: 'valid',
                title: 'Points validés',
                iconName: 'check-circle',
                items: analysis.valid,
                color: GlassColors.semantic.success,
                glowColor: GlassColors.semantic.successGlow,
            },
            {
                id: 'corrections',
                title: 'À corriger',
                iconName: 'warning',
                items: analysis.corrections,
                color: GlassColors.semantic.warning,
                glowColor: GlassColors.semantic.warningGlow,
            },
            {
                id: 'missing',
                title: 'Points manquants',
                iconName: 'cancel',
                items: analysis.missing,
                color: GlassColors.semantic.error,
                glowColor: GlassColors.semantic.errorGlow,
            },
        ],
        [analysis]
    );

    // Handlers
    const handleClose = useCallback(() => {
        router.back();
        router.back(); // Retour à la liste des topics
    }, [router]);

    const handleRetry = useCallback(() => {
        router.back(); // Retour à l'écran de session
    }, [router]);

    return {
        // Data
        analysis,
        score,
        sections,

        // Methods
        handleClose,
        handleRetry,
    };
}