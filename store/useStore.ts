import { create } from 'zustand';
import { Topic, Session } from '../types';
import { StorageService } from '../services/StorageService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface State {
    topics: Topic[];
    loadTopics: () => Promise<void>;
    addTopic: (title: string) => void;
    addSessionToTopic: (topicId: string, session: Session) => void;
}

export const useStore = create<State>((set, get) => ({
    topics: [],

    loadTopics: async () => {
        const loaded = await StorageService.getTopics();
        set({ topics: loaded });
    },

    addTopic: (title: string) => {
        const newTopic: Topic = { id: uuidv4(), title, sessions: [] };
        const newTopics = [...get().topics, newTopic];
        set({ topics: newTopics });
        StorageService.saveTopics(newTopics);
    },

    addSessionToTopic: (topicId: string, session: Session) => {
        const newTopics = get().topics.map((t) =>
            t.id === topicId ? { ...t, sessions: [session, ...t.sessions] } : t
        );
        set({ topics: newTopics });
        StorageService.saveTopics(newTopics);
    }
}));