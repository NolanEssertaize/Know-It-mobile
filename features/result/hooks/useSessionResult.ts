/**
 * @file useSessionResult.ts
 * @description Hook for fetching and managing session result/analysis data
 *
 * Usage:
 * const { session, analysis, isLoading, error } = useSessionResult(sessionId);
 */

import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SessionAnalysis {
    score?: number;
    correctPoints?: string[];
    corrections?: string[];
    missingElements?: string[];
}

export interface Session {
    id: string;
    topicId: string;
    transcription?: string;
    analysis?: SessionAnalysis;
    duration?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface UseSessionResultReturn {
    /** The session data */
    session: Session | null;
    /** Parsed analysis data */
    analysis: SessionAnalysis | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refresh the session data */
    refresh: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSessionResult(sessionId: string | undefined): UseSessionResultReturn {
    const [session, setSession] = useState<Session | null>(null);
    const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get session from store if available
    const sessionStore = useSessionStore();

    // ─────────────────────────────────────────────────────────────────────────
    // FETCH SESSION DATA
    // ─────────────────────────────────────────────────────────────────────────

    const fetchSession = useCallback(async () => {
        if (!sessionId) {
            setIsLoading(false);
            setError('No session ID provided');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // First, try to get from store
            const storedSession = sessionStore.getSessionById?.(sessionId);

            if (storedSession) {
                setSession(storedSession);
                setAnalysis(storedSession.analysis || null);
                setIsLoading(false);
                return;
            }

            // If not in store, fetch from API
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/sessions/${sessionId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch session: ${response.status}`);
            }

            const data = await response.json();

            setSession(data);
            setAnalysis(data.analysis || null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
            setError(errorMessage);
            console.error('[useSessionResult] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, sessionStore]);

    // ─────────────────────────────────────────────────────────────────────────
    // REFRESH FUNCTION
    // ─────────────────────────────────────────────────────────────────────────

    const refresh = useCallback(async () => {
        await fetchSession();
    }, [fetchSession]);

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    return {
        session,
        analysis,
        isLoading,
        error,
        refresh,
    };
}

export default useSessionResult;