/**
 * @file useResult.ts
 * @description Logic Controller pour l'écran de résultats
 * Utilise des noms d'icônes Material au lieu d'emojis
 *
 * Supports two scenarios:
 * 1. Fresh recording: analysis data passed via URL params
 * 2. Session history: only sessionId passed, data fetched from store
 */

import { useMemo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { AnalysisResult } from '@/types';
import { GlassColors } from '@/theme';
import { useStore, selectCurrentTopic } from '@/store';

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
    readonly transcription: string | undefined;
    /** True if viewing a past session from history, false if fresh recording */
    readonly isFromHistory: boolean;

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
    const params = useLocalSearchParams<{
        topicId?: string;
        sessionId?: string;
        transcription?: string;
        valid?: string;
        corrections?: string;
        missing?: string;
    }>();
    const router = useRouter();

    // Get current topic from store (for session history lookup)
    const currentTopic = useStore(selectCurrentTopic);
    const getTopicById = useStore((state) => state.getTopicById);

    // Find session from store if needed
    const sessionFromStore = useMemo(() => {
        if (!params.sessionId) return null;

        // First try currentTopic
        if (currentTopic) {
            const session = currentTopic.sessions.find((s) => s.id === params.sessionId);
            if (session) return session;
        }

        // Fallback: try to find in topics list using topicId
        if (params.topicId) {
            const topic = getTopicById(params.topicId);
            if (topic) {
                return topic.sessions.find((s) => s.id === params.sessionId) || null;
            }
        }

        return null;
    }, [params.sessionId, params.topicId, currentTopic, getTopicById]);

    // Determine if viewing from session history (no analysis params = from history)
    const isFromHistory = useMemo(() => {
        return !params.valid && !params.corrections && !params.missing && !!params.sessionId;
    }, [params.valid, params.corrections, params.missing, params.sessionId]);

    // Get analysis data: prefer URL params (fresh recording), fallback to store (session history)
    const analysis = useMemo((): AnalysisResult => {
        // Check if we have analysis data in URL params (from fresh recording)
        const hasParamsData = params.valid || params.corrections || params.missing;

        if (hasParamsData) {
            // Fresh recording: parse from URL params
            return {
                valid: parseJsonParam(params.valid, []),
                corrections: parseJsonParam(params.corrections, []),
                missing: parseJsonParam(params.missing, []),
            };
        }

        // Session history: get from store
        if (sessionFromStore?.analysis) {
            return sessionFromStore.analysis;
        }

        // Fallback: empty analysis
        return { valid: [], corrections: [], missing: [] };
    }, [params.valid, params.corrections, params.missing, sessionFromStore]);

    // Get transcription: prefer URL params, fallback to store
    const transcription = useMemo(() => {
        if (params.transcription) {
            return params.transcription;
        }
        return sessionFromStore?.transcription;
    }, [params.transcription, sessionFromStore]);

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

    // Handlers - different behavior for history vs fresh recording
    const handleClose = useCallback(() => {
        if (isFromHistory) {
            // From history: go back to topic detail (one step)
            router.back();
        } else {
            // From fresh recording: go back to topic detail (skip session screen)
            router.back();
            router.back();
        }
    }, [router, isFromHistory]);

    const handleRetry = useCallback(() => {
        if (isFromHistory) {
            // From history: start a new session
            if (params.topicId) {
                router.replace(`/${params.topicId}/session`);
            } else {
                router.back();
            }
        } else {
            // From fresh recording: go back to session screen
            router.back();
        }
    }, [router, isFromHistory, params.topicId]);

    return {
        // Data
        analysis,
        score,
        summary,
        sections,
        transcription,
        isFromHistory,

        // Methods
        handleClose,
        handleRetry,
    };
}