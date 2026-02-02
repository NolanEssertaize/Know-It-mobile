/**
 * @file useStore.ts
 * @description Main Zustand store for topics and sessions
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import type { Topic, Session } from '@/types';
import type { StoreState, Selector } from './types';

// Storage key
const TOPICS_KEY = '@knowit/topics';

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  topics: [],
  currentTopic: null,
  isLoading: false,
  error: null,

  // ─────────────────────────────────────────────────────────────────────────
  // Load topics from storage
  // ─────────────────────────────────────────────────────────────────────────
  loadTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[useStore] Loading topics from storage...');
      const stored = await AsyncStorage.getItem(TOPICS_KEY);
      const topics: Topic[] = stored ? JSON.parse(stored) : [];
      console.log('[useStore] Loaded topics:', topics.length);
      set({ topics, isLoading: false });
    } catch (error) {
      console.error('[useStore] Error loading topics:', error);
      set({ error: 'Failed to load topics', isLoading: false });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Add a new topic
  // ─────────────────────────────────────────────────────────────────────────
  addTopic: async (title: string, category?: string) => {
    const newTopic: Topic = {
      id: uuidv4(),
      title: title.trim(),
      category: category || 'other',
      sessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const topics = [...get().topics, newTopic];
    set({ topics });

    try {
      await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
      console.log('[useStore] Topic added:', newTopic.id);
    } catch (error) {
      console.error('[useStore] Error saving topic:', error);
    }

    return newTopic;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Update topic title
  // ─────────────────────────────────────────────────────────────────────────
  updateTopicTitle: async (topicId: string, title: string) => {
    const topics = get().topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, title: title.trim(), updatedAt: new Date().toISOString() }
        : topic
    );
    set({ topics });

    // Update currentTopic if it's the one being edited
    const currentTopic = get().currentTopic;
    if (currentTopic?.id === topicId) {
      set({ currentTopic: { ...currentTopic, title: title.trim() } });
    }

    try {
      await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
      console.log('[useStore] Topic updated:', topicId);
    } catch (error) {
      console.error('[useStore] Error updating topic:', error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Delete a topic
  // ─────────────────────────────────────────────────────────────────────────
  deleteTopic: async (topicId: string) => {
    const topics = get().topics.filter((topic) => topic.id !== topicId);
    set({ topics, currentTopic: null });

    try {
      await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
      console.log('[useStore] Topic deleted:', topicId);
    } catch (error) {
      console.error('[useStore] Error deleting topic:', error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Load topic detail
  // ─────────────────────────────────────────────────────────────────────────
  loadTopicDetail: async (topicId: string) => {
    set({ isLoading: true, error: null });
    try {
      const topic = get().topics.find((t) => t.id === topicId) || null;
      set({ currentTopic: topic, isLoading: false });
      console.log('[useStore] Loaded topic detail:', topicId);
      return topic;
    } catch (error) {
      console.error('[useStore] Error loading topic detail:', error);
      set({ error: 'Failed to load topic', isLoading: false });
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Set current topic directly
  // ─────────────────────────────────────────────────────────────────────────
  setCurrentTopic: (topic: Topic | null) => {
    set({ currentTopic: topic });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Add a session to a topic
  // ─────────────────────────────────────────────────────────────────────────
  addSession: async (topicId: string, session: Session) => {
    const topics = get().topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            sessions: [session, ...topic.sessions],
            updatedAt: new Date().toISOString(),
          }
        : topic
    );
    set({ topics });

    // Update currentTopic if it matches
    const currentTopic = get().currentTopic;
    if (currentTopic?.id === topicId) {
      set({
        currentTopic: {
          ...currentTopic,
          sessions: [session, ...currentTopic.sessions],
        },
      });
    }

    try {
      await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
      console.log('[useStore] Session added to topic:', topicId);
    } catch (error) {
      console.error('[useStore] Error saving session:', error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Delete a session
  // ─────────────────────────────────────────────────────────────────────────
  deleteSession: async (topicId: string, sessionId: string) => {
    const topics = get().topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            sessions: topic.sessions.filter((s) => s.id !== sessionId),
            updatedAt: new Date().toISOString(),
          }
        : topic
    );
    set({ topics });

    // Update currentTopic if it matches
    const currentTopic = get().currentTopic;
    if (currentTopic?.id === topicId) {
      set({
        currentTopic: {
          ...currentTopic,
          sessions: currentTopic.sessions.filter((s) => s.id !== sessionId),
        },
      });
    }

    try {
      await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
      console.log('[useStore] Session deleted:', sessionId);
    } catch (error) {
      console.error('[useStore] Error deleting session:', error);
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Utility actions
  // ─────────────────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  reset: async () => {
    set({
      topics: [],
      currentTopic: null,
      isLoading: false,
      error: null,
    });
    try {
      await AsyncStorage.removeItem(TOPICS_KEY);
    } catch (error) {
      console.error('[useStore] Error resetting store:', error);
    }
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════════════════════

export const selectTopics: Selector<Topic[]> = (state) => state.topics;
export const selectCurrentTopic: Selector<Topic | null> = (state) => state.currentTopic;
export const selectIsLoading: Selector<boolean> = (state) => state.isLoading;
export const selectError: Selector<string | null> = (state) => state.error;

export const selectTopicById = (id: string): Selector<Topic | undefined> => (state) =>
  state.topics.find((t) => t.id === id);

export const selectTotalSessions: Selector<number> = (state) =>
  state.topics.reduce((acc, topic) => acc + topic.sessions.length, 0);
