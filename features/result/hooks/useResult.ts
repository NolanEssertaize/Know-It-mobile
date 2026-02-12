/**
 * @file useResult.ts
 * @description Logic Controller pour l'écran de résultats
 * Utilise des noms d'icônes Material au lieu d'emojis
 *
 * Supports two scenarios:
 * 1. Fresh recording: analysis data passed via URL params
 * 2. Session history: only sessionId passed, data fetched from store
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { AnalysisResult } from '@/types';
import { GlassColors } from '@/theme';
import { LLMService } from '@/shared/services';
import { useQuotaGuard } from '@/features/subscription';

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
    /** True while loading session data from API */
    readonly isLoading: boolean;
    readonly topicId: string | undefined;
    readonly topicTitle: string | undefined;

    // Methods
    readonly handleClose: () => void;
    readonly handleRetry: () => void;
    readonly handleGenerateFlashcards: () => void;

    // Quota guard
    readonly quotaModalVisible: boolean;
    readonly quotaType: 'session' | 'generation';
    readonly dismissQuotaModal: () => void;
    readonly openPaywall: () => void;
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
    const { quotaModalVisible, quotaType, checkAndProceed, dismissQuotaModal, openPaywall } = useQuotaGuard();
    const params = useLocalSearchParams<{
        topicId?: string;
        topicTitle?: string;
        sessionId?: string;
        transcription?: string;
        valid?: string;
        corrections?: string;
        missing?: string;
    }>();
    const router = useRouter();

    // State for API-fetched session
    const [fetchedSession, setFetchedSession] = useState<{
        analysis: AnalysisResult;
        transcription?: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Determine if viewing from session history (no analysis params = from history)
    const isFromHistory = useMemo(() => {
        return !params.valid && !params.corrections && !params.missing && !!params.sessionId;
    }, [params.valid, params.corrections, params.missing, params.sessionId]);

    // Debug logging
    console.log('[useResult] params:', {
        topicId: params.topicId,
        sessionId: params.sessionId,
        hasValid: !!params.valid,
        hasCorrections: !!params.corrections,
        hasMissing: !!params.missing,
        isFromHistory,
    });

    // Fetch session from API when viewing from history
    useEffect(() => {
        if (!isFromHistory || !params.sessionId) {
            return;
        }

        console.log('[useResult] Fetching session from API:', params.sessionId);
        setIsLoading(true);

        LLMService.getSession(params.sessionId)
            .then((session) => {
                console.log('[useResult] Fetched session:', session.id, 'analysis:', session.analysis);
                setFetchedSession({
                    analysis: session.analysis || { valid: [], corrections: [], missing: [] },
                    transcription: session.transcription || undefined,
                });
            })
            .catch((error) => {
                console.error('[useResult] Failed to fetch session:', error);
                setFetchedSession(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [isFromHistory, params.sessionId]);

    // Get analysis data: prefer URL params (fresh recording), fallback to API fetch (session history)
    const analysis = useMemo((): AnalysisResult => {
        // Check if we have analysis data in URL params (from fresh recording)
        const hasParamsData = params.valid || params.corrections || params.missing;

        if (hasParamsData) {
            // Fresh recording: parse from URL params
            const result = {
                valid: parseJsonParam(params.valid, []),
                corrections: parseJsonParam(params.corrections, []),
                missing: parseJsonParam(params.missing, []),
            };
            console.log('[useResult] Using URL params analysis:', result);
            return result;
        }

        // Session history: use fetched data from API
        if (fetchedSession?.analysis) {
            console.log('[useResult] Using API-fetched analysis:', fetchedSession.analysis);
            return fetchedSession.analysis;
        }

        // Fallback: empty analysis (while loading or if fetch failed)
        console.log('[useResult] No analysis found, using empty fallback');
        return { valid: [], corrections: [], missing: [] };
    }, [params.valid, params.corrections, params.missing, fetchedSession]);

    // Get transcription: prefer URL params, fallback to API fetch
    const transcription = useMemo(() => {
        if (params.transcription) {
            return params.transcription;
        }
        return fetchedSession?.transcription;
    }, [params.transcription, fetchedSession]);

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

    const handleGenerateFlashcards = useCallback(() => {
        if (!checkAndProceed('generation')) return;

        // Build content string from analysis
        const contentParts: string[] = [];

        if (analysis.valid.length > 0) {
            contentParts.push('Valid points:\n' + analysis.valid.map(p => `- ${p}`).join('\n'));
        }
        if (analysis.corrections.length > 0) {
            contentParts.push('Points to correct:\n' + analysis.corrections.map(p => `- ${p}`).join('\n'));
        }
        if (analysis.missing.length > 0) {
            contentParts.push('Missing points:\n' + analysis.missing.map(p => `- ${p}`).join('\n'));
        }

        const content = contentParts.join('\n\n');
        const topicTitle = params.topicTitle || 'Topic';

        // Navigate to flashcards editor
        router.push({
            pathname: `/${params.topicId}/flashcards-editor`,
            params: {
                topicId: params.topicId,
                topicTitle,
                content,
            },
        });
    }, [analysis, params.topicId, params.topicTitle, router, checkAndProceed]);

    return {
        // Data
        analysis,
        score,
        summary,
        sections,
        transcription,
        isFromHistory,
        isLoading,
        topicId: params.topicId,
        topicTitle: params.topicTitle,

        // Methods
        handleClose,
        handleRetry,
        handleGenerateFlashcards,

        // Quota guard
        quotaModalVisible,
        quotaType,
        dismissQuotaModal,
        openPaywall,
    };
}