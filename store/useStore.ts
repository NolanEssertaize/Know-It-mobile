/**
 * @file useStore.ts
 * @description Topics Store - Global state management with Zustand + API integration
 *
 * FIXED: loadTopics now fetches topic details (with sessions) for all topics
 * so sessions are visible from the main topic list.
 *
 * Manages:
 * - Topics list
 * - Topic CRUD operations via API
 * - Sessions within topics
 * - Loading and error states
 */

import { create } from 'zustand';
import { TopicsService, LLMService } from '@/shared/services';
import { ApiException } from '@/shared/api';
import type {
    TopicRead,
    TopicDetail,
    SessionRead,
    AnalysisResult,
} from '@/shared/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES (Frontend-compatible interfaces)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Topic with sessions (for local state)
 */
export interface Topic {
    readonly id: string;
    readonly title: string;
    readonly createdAt: string;
    readonly sessions: Session[];
}

/**
 * Session interface (compatible with existing frontend)
 */
export interface Session {
    readonly id: string;
    readonly date: string;
    readonly audioUri?: string;
    readonly transcription?: string;
    readonly analysis: AnalysisResult;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert API TopicRead to frontend Topic (without sessions)
 */
function mapTopicReadToTopic(topic: TopicRead): Topic {
    return {
        id: topic.id,
        title: topic.title,
        createdAt: topic.created_at,
        sessions: [],
    };
}

/**
 * Convert API TopicDetail to frontend Topic (with sessions)
 */
function mapTopicDetailToTopic(topic: TopicDetail): Topic {
    return {
        id: topic.id,
        title: topic.title,
        createdAt: topic.created_at,
        sessions: topic.sessions?.map(mapSessionReadToSession) || [],
    };
}

/**
 * Convert API SessionRead to frontend Session
 */
function mapSessionReadToSession(session: SessionRead): Session {
    return {
        id: session.id,
        date: session.date,
        audioUri: session.audio_uri || undefined,
        transcription: session.transcription || undefined,
        analysis: session.analysis,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

interface TopicsState {
    /** List of all topics */
    topics: Topic[];
    /** Currently selected topic (with full details) */
    currentTopic: Topic | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
}

interface TopicsActions {
    /** Fetch all topics from API (with sessions) */
    loadTopics: () => Promise<void>;
    /** Fetch a single topic with sessions */
    loadTopicDetail: (topicId: string) => Promise<Topic | null>;
    /** Create a new topic */
    addTopic: (title: string) => Promise<Topic | null>;
    /** Update topic title */
    updateTopicTitle: (topicId: string, newTitle: string) => Promise<void>;
    /** Delete a topic */
    deleteTopic: (topicId: string) => Promise<void>;
    /** Add a session to a topic (after recording) */
    addSessionToTopic: (topicId: string, session: Session) => void;
    /** Get topic by ID (from local state) */
    getTopicById: (topicId: string) => Topic | undefined;
    /** Set current topic */
    setCurrentTopic: (topic: Topic | null) => void;
    /** Clear error */
    clearError: () => void;
}

type Store = TopicsState & TopicsActions;

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export const selectTopics = (state: Store) => state.topics;
export const selectCurrentTopic = (state: Store) => state.currentTopic;
export const selectIsLoading = (state: Store) => state.isLoading;
export const selectError = (state: Store) => state.error;

// ═══════════════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const useStore = create<Store>((set, get) => ({
    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────
    topics: [],
    currentTopic: null,
    isLoading: false,
    error: null,

    // ─────────────────────────────────────────────────────────────────────────
    // ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Load all topics from API WITH sessions
     * FIXED: Now fetches topic details (with sessions) for each topic
     */
    loadTopics: async () => {
        console.log('[Store] Loading topics with sessions...');
        set({ isLoading: true, error: null });

        try {
            // First, get the list of topics
            const response = await TopicsService.getTopics();
            console.log(`[Store] Got ${response.topics.length} topics, fetching details...`);

            // Then, fetch details (with sessions) for each topic in parallel
            const topicsWithSessions = await Promise.all(
                response.topics.map(async (topicRead) => {
                    try {
                        const detail = await TopicsService.getTopic(topicRead.id);
                        return mapTopicDetailToTopic(detail);
                    } catch (error) {
                        // If fetching details fails, fallback to topic without sessions
                        console.warn(`[Store] Failed to load details for topic ${topicRead.id}:`, error);
                        return mapTopicReadToTopic(topicRead);
                    }
                })
            );

            set({
                topics: topicsWithSessions,
                isLoading: false,
            });

            const totalSessions = topicsWithSessions.reduce((acc, t) => acc + t.sessions.length, 0);
            console.log(`[Store] Loaded ${topicsWithSessions.length} topics with ${totalSessions} total sessions`);
        } catch (error) {
            const message = error instanceof ApiException
                ? error.message
                : 'Failed to load topics';

            console.error('[Store] Failed to load topics:', message);
            set({
                isLoading: false,
                error: message,
            });
        }
    },

    /**
     * Load topic detail with sessions
     */
    loadTopicDetail: async (topicId: string) => {
        console.log(`[Store] Loading topic detail: ${topicId}`);
        set({ isLoading: true, error: null });

        try {
            const topicDetail = await TopicsService.getTopic(topicId);
            const topic = mapTopicDetailToTopic(topicDetail);

            // Update current topic
            set({
                currentTopic: topic,
                isLoading: false,
            });

            // Also update in topics list if present
            set((state) => ({
                topics: state.topics.map((t) =>
                    t.id === topicId ? topic : t
                ),
            }));

            console.log(`[Store] Loaded topic with ${topic.sessions.length} sessions`);
            return topic;
        } catch (error) {
            const message = error instanceof ApiException
                ? error.message
                : 'Failed to load topic';

            console.error('[Store] Failed to load topic:', message);
            set({
                isLoading: false,
                error: message,
            });
            return null;
        }
    },

    /**
     * Create a new topic via API
     */
    addTopic: async (title: string) => {
        console.log(`[Store] Creating topic: "${title}"`);
        set({ isLoading: true, error: null });

        try {
            const created = await TopicsService.createTopic({ title: title.trim() });
            const newTopic = mapTopicReadToTopic(created);

            set((state) => ({
                topics: [...state.topics, newTopic],
                isLoading: false,
            }));

            console.log(`[Store] Topic created: ${newTopic.id}`);
            return newTopic;
        } catch (error) {
            const message = error instanceof ApiException
                ? error.message
                : 'Failed to create topic';

            console.error('[Store] Failed to create topic:', message);
            set({
                isLoading: false,
                error: message,
            });
            return null;
        }
    },

    /**
     * Update topic title via API
     */
    updateTopicTitle: async (topicId: string, newTitle: string) => {
        console.log(`[Store] Updating topic ${topicId} title to: "${newTitle}"`);
        set({ error: null });

        try {
            const updated = await TopicsService.updateTopic(topicId, {
                title: newTitle.trim(),
            });

            set((state) => ({
                topics: state.topics.map((t) =>
                    t.id === topicId
                        ? { ...t, title: updated.title }
                        : t
                ),
                currentTopic: state.currentTopic?.id === topicId
                    ? { ...state.currentTopic, title: updated.title }
                    : state.currentTopic,
            }));

            console.log('[Store] Topic title updated');
        } catch (error) {
            const message = error instanceof ApiException
                ? error.message
                : 'Failed to update topic';

            console.error('[Store] Failed to update topic:', message);
            set({ error: message });
        }
    },

    /**
     * Delete a topic via API
     */
    deleteTopic: async (topicId: string) => {
        console.log(`[Store] Deleting topic: ${topicId}`);
        set({ error: null });

        try {
            await TopicsService.deleteTopic(topicId);

            set((state) => ({
                topics: state.topics.filter((t) => t.id !== topicId),
                currentTopic: state.currentTopic?.id === topicId
                    ? null
                    : state.currentTopic,
            }));

            console.log('[Store] Topic deleted');
        } catch (error) {
            const message = error instanceof ApiException
                ? error.message
                : 'Failed to delete topic';

            console.error('[Store] Failed to delete topic:', message);
            set({ error: message });
        }
    },

    /**
     * Add a session to a topic (called after recording)
     */
    addSessionToTopic: (topicId: string, session: Session) => {
        console.log(`[Store] Adding session to topic ${topicId}`);

        set((state) => ({
            topics: state.topics.map((t) =>
                t.id === topicId
                    ? { ...t, sessions: [...t.sessions, session] }
                    : t
            ),
            currentTopic: state.currentTopic?.id === topicId
                ? { ...state.currentTopic, sessions: [...state.currentTopic.sessions, session] }
                : state.currentTopic,
        }));
    },

    /**
     * Get topic by ID from local state
     */
    getTopicById: (topicId: string) => {
        return get().topics.find((t) => t.id === topicId);
    },

    /**
     * Set current topic
     */
    setCurrentTopic: (topic: Topic | null) => {
        set({ currentTopic: topic });
    },

    /**
     * Clear error
     */
    clearError: () => {
        set({ error: null });
    },
}));