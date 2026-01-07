/**
 * @file useStore.ts
 * @description Store global Zustand pour la gestion des topics
 */

import 'react-native-get-random-values';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Topic, Session } from '@/types';
import { StorageService } from '@/shared/services/StorageService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TopicsState {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
}

interface TopicsActions {
  loadTopics: () => Promise<void>;
  addTopic: (title: string) => void;
  deleteTopic: (topicId: string) => void;
  updateTopicTitle: (topicId: string, newTitle: string) => void;
  addSessionToTopic: (topicId: string, session: Session) => void;
  getTopicById: (topicId: string) => Topic | undefined;
}

type Store = TopicsState & TopicsActions;

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useStore = create<Store>((set, get) => ({
  // State
  topics: [],
  isLoading: false,
  error: null,

  // Actions
  loadTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const loaded = await StorageService.getTopics();
      set({ topics: loaded, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de chargement',
        isLoading: false,
      });
    }
  },

  addTopic: (title: string) => {
    const newTopic: Topic = {
      id: uuidv4(),
      title: title.trim(),
      sessions: [],
    };
    const newTopics = [...get().topics, newTopic];
    set({ topics: newTopics });
    StorageService.saveTopics(newTopics);
  },

  deleteTopic: (topicId: string) => {
    const newTopics = get().topics.filter((t) => t.id !== topicId);
    set({ topics: newTopics });
    StorageService.saveTopics(newTopics);
  },

  updateTopicTitle: (topicId: string, newTitle: string) => {
    const newTopics = get().topics.map((t) =>
      t.id === topicId ? { ...t, title: newTitle.trim() } : t
    );
    set({ topics: newTopics });
    StorageService.saveTopics(newTopics);
  },

  addSessionToTopic: (topicId: string, session: Session) => {
    const newTopics = get().topics.map((t) =>
      t.id === topicId
        ? { ...t, sessions: [session, ...t.sessions] }
        : t
    );
    set({ topics: newTopics });
    StorageService.saveTopics(newTopics);
  },

  getTopicById: (topicId: string) => {
    return get().topics.find((t) => t.id === topicId);
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// SELECTORS (pour optimiser les re-renders)
// ═══════════════════════════════════════════════════════════════════════════

export const selectTopics = (state: Store) => state.topics;
export const selectIsLoading = (state: Store) => state.isLoading;
export const selectError = (state: Store) => state.error;
export const selectTopicById = (topicId: string) => (state: Store) =>
  state.topics.find((t) => t.id === topicId);
