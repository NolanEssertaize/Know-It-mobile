/**
 * @file LLMService.ts
 * @description AI Service - Transcription (Whisper) & Analysis (GPT-4)
 *
 * Responsibilities:
 * - Audio transcription via Whisper API
 * - Text analysis via GPT-4 API
 * - Session retrieval
 */

import * as FileSystem from 'expo-file-system';
import { api, API_ENDPOINTS, uploadFile } from '@/shared/api';
import type {
    TranscriptionResponse,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisResult,
    SessionRead,
} from '@/shared/api';

/**
 * Interface for transcription options
 */
interface TranscriptionOptions {
    /** Optional language code (e.g., 'fr', 'en') */
    language?: string;
}

/**
 * Interface for analysis options
 */
interface AnalysisOptions {
    /** Topic ID to save the session (optional) */
    topicId?: string;
}

export const LLMService = {
    /**
     * Transcribe audio file to text using Whisper API
     *
     * @param uri - Local file URI of the audio (e.g., from expo-av recording)
     * @param options - Transcription options
     * @returns Transcribed text
     *
     * @example
     * const text = await LLMService.transcribeAudio(recording.getURI());
     */
    async transcribeAudio(
        uri: string,
        options?: TranscriptionOptions,
    ): Promise<string> {
        console.log(`[LLMService] Transcribing audio file: ${uri}`);

        try {
            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(uri);

            if (!fileInfo.exists) {
                throw new Error(`Audio file not found: ${uri}`);
            }

            // Determine file extension and MIME type
            const fileExtension = uri.split('.').pop()?.toLowerCase() || 'm4a';
            const mimeTypes: Record<string, string> = {
                m4a: 'audio/m4a',
                mp3: 'audio/mpeg',
                mp4: 'audio/mp4',
                wav: 'audio/wav',
                webm: 'audio/webm',
                ogg: 'audio/ogg',
                flac: 'audio/flac',
            };
            const mimeType = mimeTypes[fileExtension] || 'audio/m4a';

            // Create FormData for file upload
            const formData = new FormData();

            // Append file - React Native style
            formData.append('file', {
                uri,
                type: mimeType,
                name: `recording.${fileExtension}`,
            } as unknown as Blob);

            // Add language if specified
            if (options?.language) {
                formData.append('language', options.language);
            }

            // Upload and transcribe
            const response = await uploadFile<TranscriptionResponse>(
                API_ENDPOINTS.TRANSCRIPTION,
                formData,
            );

            console.log(`[LLMService] Transcription successful, length: ${response.text.length} chars`);

            if (response.language) {
                console.log(`[LLMService] Detected language: ${response.language}`);
            }

            return response.text;
        } catch (error) {
            console.error('[LLMService] Transcription failed:', error);
            throw error;
        }
    },

    /**
     * Analyze transcribed text using GPT-4
     *
     * @param text - Transcribed text to analyze
     * @param topicTitle - Topic title for context
     * @param options - Analysis options (including topicId to save session)
     * @returns Analysis result with valid points, corrections, and missing concepts
     *
     * @example
     * const analysis = await LLMService.analyzeText(
     *   "Le polymorphisme en Java...",
     *   "Polymorphisme Java",
     *   { topicId: "uuid-here" }
     * );
     */
    async analyzeText(
        text: string,
        topicTitle: string,
        options?: AnalysisOptions,
    ): Promise<AnalysisResult> {
        console.log(`[LLMService] Analyzing text for topic: "${topicTitle}"`);

        try {
            const requestBody: AnalysisRequest = {
                text,
                topic_title: topicTitle,
                topic_id: options?.topicId || null,
            };

            const response = await api.post<AnalysisResponse>(
                API_ENDPOINTS.ANALYSIS.ANALYZE,
                requestBody,
            );

            console.log(`[LLMService] Analysis complete:`);
            console.log(`  - Valid points: ${response.analysis.valid.length}`);
            console.log(`  - Corrections: ${response.analysis.corrections.length}`);
            console.log(`  - Missing concepts: ${response.analysis.missing.length}`);

            if (response.session_id) {
                console.log(`[LLMService] Session saved with ID: ${response.session_id}`);
            }

            return response.analysis;
        } catch (error) {
            console.error('[LLMService] Analysis failed:', error);
            throw error;
        }
    },

    /**
     * Transcribe and analyze audio in one operation
     *
     * @param uri - Audio file URI
     * @param topicTitle - Topic title for context
     * @param options - Options including topicId and language
     * @returns Object containing transcription and analysis
     *
     * @example
     * const result = await LLMService.processRecording(
     *   recording.getURI(),
     *   topic.title,
     *   { topicId: topic.id }
     * );
     */
    async processRecording(
        uri: string,
        topicTitle: string,
        options?: {
            topicId?: string;
            language?: string;
        },
    ): Promise<{
        transcription: string;
        analysis: AnalysisResult;
    }> {
        console.log(`[LLMService] Processing recording for topic: "${topicTitle}"`);

        // Step 1: Transcribe audio
        const transcription = await this.transcribeAudio(uri, {
            language: options?.language,
        });

        // Step 2: Analyze transcription
        const analysis = await this.analyzeText(transcription, topicTitle, {
            topicId: options?.topicId,
        });

        return {
            transcription,
            analysis,
        };
    },

    /**
     * Get a specific session by ID
     *
     * @param sessionId - Session ID
     * @returns Session details including analysis
     */
    async getSession(sessionId: string): Promise<SessionRead> {
        console.log(`[LLMService] Fetching session: ${sessionId}`);

        const response = await api.get<SessionRead>(
            API_ENDPOINTS.ANALYSIS.SESSION(sessionId),
        );

        console.log(`[LLMService] Session fetched for topic: ${response.topic_id}`);
        return response;
    },
} as const;

// Re-export types for convenience
export type { AnalysisResult, TranscriptionResponse, SessionRead } from '@/shared/api';