/**
 * @file useSessionWithAudio.ts
 * @description Logic Controller pour l'écran d'enregistrement avec audio réel
 * Combine useSession et useAudioRecording
 *
 * FIXED:
 * - Replaced mock setTimeout with real LLMService.processRecording() API call
 * - Added proper error handling
 * - Uses selectCurrentTopic instead of selectTopicById
 * - NOW ADDS SESSION TO STORE after successful analysis
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectCurrentTopic } from '@/store/useStore';
import { useAudioRecording } from './useAudioRecording';
import { LLMService } from '@/shared/services';
import type { Topic, RecordingState } from '@/types';
import type { Session } from '@/store';

const ANALYSIS_TIMEOUT = 60_000;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseSessionWithAudioReturn {
    // Data
    topic: Topic | null;
    recordingState: RecordingState;
    isRecording: boolean;
    isAnalyzing: boolean;
    audioLevel: number;
    audioUri: string | null;
    error: string | null;
    hasPermission: boolean;
    duration: number;

    // Methods
    toggleRecording: () => Promise<void>;
    handleClose: () => void;
    requestPermission: () => Promise<boolean>;
    cancelAnalysis: () => void;
    retryAnalysis: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a simple UUID v4
 * Note: If you have uuid package installed, use import { v4 as uuidv4 } from 'uuid'
 */
function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSessionWithAudio(): UseSessionWithAudioReturn {
    const { topicId } = useLocalSearchParams<{ topicId: string }>();
    const router = useRouter();

    // FIX: Use currentTopic instead of selectTopicById
    // The topic is already loaded by TopicDetailScreen before navigating here
    const topic = useStore(selectCurrentTopic);

    // Get addSessionToTopic from store
    const addSessionToTopic = useStore((state) => state.addSessionToTopic);

    // Hook d'enregistrement audio
    const audio = useAudioRecording();

    // État d'analyse
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Store last recording URI for retry
    const lastRecordingUriRef = useRef<string | null>(null);

    // Derived state pour combiner les états
    const recordingState: RecordingState = isAnalyzing
        ? 'analyzing'
        : audio.isRecording
            ? 'recording'
            : analysisError
                ? 'error'
                : 'idle';

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const processAndNavigate = useCallback(async (uri: string, currentTopic: Topic) => {
        setIsAnalyzing(true);
        setAnalysisError(null);

        console.log('[useSessionWithAudio] Audio URI:', uri);
        console.log('[useSessionWithAudio] Processing recording for topic:', currentTopic.title);

        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('ANALYSIS_TIMEOUT')), ANALYSIS_TIMEOUT)
            );

            const result = await Promise.race([
                LLMService.processRecording(uri, currentTopic.title, {
                    topicId: currentTopic.id,
                    language: 'fr',
                }),
                timeoutPromise,
            ]);

            console.log('[useSessionWithAudio] Transcription:', result.transcription.substring(0, 100) + '...');
            console.log('[useSessionWithAudio] Analysis:', result.analysis);

            const newSession: Session = {
                id: generateId(),
                date: new Date().toISOString(),
                audioUri: uri,
                transcription: result.transcription,
                analysis: result.analysis,
            };

            addSessionToTopic(currentTopic.id, newSession);
            console.log('[useSessionWithAudio] Session added to store:', newSession.id);

            setIsAnalyzing(false);

            router.replace({
                pathname: `/${topicId}/result`,
                params: {
                    topicId: currentTopic.id,
                    topicTitle: currentTopic.title,
                    sessionId: newSession.id,
                    audioUri: uri,
                    transcription: result.transcription,
                    valid: JSON.stringify(result.analysis.valid),
                    corrections: JSON.stringify(result.analysis.corrections),
                    missing: JSON.stringify(result.analysis.missing),
                },
            });
        } catch (error) {
            console.error('[useSessionWithAudio] API Error:', error);
            setIsAnalyzing(false);

            const errorMessage = error instanceof Error && error.message === 'ANALYSIS_TIMEOUT'
                ? 'ANALYSIS_TIMEOUT'
                : error instanceof Error
                    ? error.message
                    : 'ANALYSIS_ERROR';

            setAnalysisError(errorMessage);
        }
    }, [topicId, router, addSessionToTopic]);

    const cancelAnalysis = useCallback(() => {
        setIsAnalyzing(false);
        setAnalysisError(null);
    }, []);

    const retryAnalysis = useCallback(async () => {
        const uri = lastRecordingUriRef.current;
        if (uri && topic) {
            await processAndNavigate(uri, topic);
        }
    }, [topic, processAndNavigate]);

    const toggleRecording = useCallback(async () => {
        if (audio.isRecording) {
            // Arrêter l'enregistrement
            const uri = await audio.stopRecording();

            if (uri && topic) {
                lastRecordingUriRef.current = uri;
                await processAndNavigate(uri, topic);
            } else if (!topic) {
                console.error('[useSessionWithAudio] No topic found');
                setAnalysisError('Topic introuvable');
            }
        } else {
            // Démarrer l'enregistrement
            setAnalysisError(null);
            await audio.startRecording();
        }
    }, [audio, topic, processAndNavigate]);

    const handleClose = useCallback(() => {
        // Arrêter l'enregistrement si en cours
        if (audio.isRecording) {
            audio.stopRecording();
        }
        router.back();
    }, [audio, router]);

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            // Reset audio state on unmount
            audio.reset();
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        // Data
        topic,
        recordingState,
        isRecording: audio.isRecording,
        isAnalyzing,
        audioLevel: audio.audioLevel,
        audioUri: audio.audioUri,
        error: audio.error || analysisError,
        hasPermission: audio.hasPermission,
        duration: audio.duration,

        // Methods
        toggleRecording,
        handleClose,
        requestPermission: audio.requestPermission,
        cancelAnalysis,
        retryAnalysis,
    };
}

export default useSessionWithAudio;