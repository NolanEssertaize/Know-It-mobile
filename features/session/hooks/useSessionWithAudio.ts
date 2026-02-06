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

import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectCurrentTopic } from '@/store/useStore';
import { useAudioRecording } from './useAudioRecording';
import { LLMService } from '@/shared/services';
import type { Topic, RecordingState } from '@/types';
import type { Session } from '@/store';

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

    const toggleRecording = useCallback(async () => {
        if (audio.isRecording) {
            // Arrêter l'enregistrement
            const uri = await audio.stopRecording();

            if (uri && topic) {
                setIsAnalyzing(true);
                setAnalysisError(null);

                console.log('[useSessionWithAudio] Audio URI:', uri);
                console.log('[useSessionWithAudio] Duration:', audio.duration, 'seconds');
                console.log('[useSessionWithAudio] Processing recording for topic:', topic.title);

                try {
                    // ═══════════════════════════════════════════════════════════
                    // REAL API CALL - Transcription + Analysis
                    // ═══════════════════════════════════════════════════════════
                    const result = await LLMService.processRecording(
                        uri,
                        topic.title,
                        {
                            topicId: topic.id,
                            language: 'fr', // ou détecter automatiquement
                        }
                    );

                    console.log('[useSessionWithAudio] Transcription:', result.transcription.substring(0, 100) + '...');
                    console.log('[useSessionWithAudio] Analysis:', result.analysis);

                    // ═══════════════════════════════════════════════════════════
                    // FIX: Create session and add to store
                    // ═══════════════════════════════════════════════════════════
                    const newSession: Session = {
                        id: generateId(), // The backend should return session_id, but we generate one for now
                        date: new Date().toISOString(),
                        audioUri: uri,
                        transcription: result.transcription,
                        analysis: result.analysis,
                    };

                    // Add session to store so it appears in TopicDetailScreen
                    addSessionToTopic(topic.id, newSession);
                    console.log('[useSessionWithAudio] Session added to store:', newSession.id);

                    setIsAnalyzing(false);

                    // Navigation vers les résultats avec les vraies données
                    router.replace({
                        pathname: `/${topicId}/result`,
                        params: {
                            topicId: topic.id,
                            topicTitle: topic.title,
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

                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Une erreur est survenue lors de l\'analyse';

                    setAnalysisError(errorMessage);

                    // Optionnel: vous pouvez aussi naviguer vers une page d'erreur
                    // ou afficher l'erreur dans l'UI
                }
            } else if (!topic) {
                console.error('[useSessionWithAudio] No topic found');
                setAnalysisError('Topic introuvable');
            }
        } else {
            // Démarrer l'enregistrement
            setAnalysisError(null);
            await audio.startRecording();
        }
    }, [audio, topic, topicId, router, addSessionToTopic]);

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
    };
}

export default useSessionWithAudio;