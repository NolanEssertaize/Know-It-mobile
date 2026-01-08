/**
 * @file useResult.ts
 * @description Logic Controller pour l'écran de résultats
 * Utilise des noms d'icônes Material au lieu d'emojis
 */

import { useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { AnalysisResult } from '@/types';
import { GlassColors } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScoreData {
    readonly value: number;
    readonly label: string;
    readonly color: string;
}

export interface SummaryData {
    readonly validCount: number;
    readonly correctionsCount: number;
    readonly missingCount: number;
    readonly totalPoints: number;
}

export interface AnalysisSection {
    readonly id: string;
    readonly title: string;
    /** Material Icon name */
    readonly icon: string;
    readonly items: readonly string[];
    readonly color: string;
    readonly glowColor: string;
}

export interface UseResultReturn {
    // Data
    readonly analysis: AnalysisResult;
    readonly score: ScoreData;
    readonly summary: SummaryData;
    readonly sections: readonly AnalysisSection[];

    // Methods
    readonly handleClose: () => void;
    readonly handleRetry: () => void;
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

function calculateSummary(analysis: AnalysisResult): SummaryData {
    return {
        validCount: analysis.valid.length,
        correctionsCount: analysis.corrections.length,
        missingCount: analysis.missing.length,
        totalPoints: analysis.valid.length + analysis.corrections.length + analysis.missing.length,
    };
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

    // Calculate summary
    const summary = useMemo(() => calculateSummary(analysis), [analysis]);

    // Build sections with Material Icon names (filter out empty ones)
    const sections = useMemo(
        (): readonly AnalysisSection[] => [
            {
                id: 'valid',
                title: 'Points validés',
                icon: 'check-circle',
                items: analysis.valid,
                color: GlassColors.semantic.success,
                glowColor: GlassColors.semantic.successGlow,
            },
            {
                id: 'corrections',
                title: 'À corriger',
                icon: 'error',
                items: analysis.corrections,
                color: GlassColors.semantic.warning,
                glowColor: GlassColors.semantic.warningGlow,
            },
            {
                id: 'missing',
                title: 'Points manquants',
                icon: 'cancel',
                items: analysis.missing,
                color: GlassColors.semantic.error,
                glowColor: GlassColors.semantic.errorGlow,
            },
        ].filter(section => section.items.length > 0),
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
        summary,
        sections,

        // Methods
        handleClose,
        handleRetry,
    };
}