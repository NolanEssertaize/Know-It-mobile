/**
 * @file useTopicsList.ts
 * @description Logic Controller pour l'écran de liste des topics
 *
 * FIX: Added useEffect to load topics on mount for synchronization
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useStore, selectTopics, selectIsLoading, selectError } from '@/store/useStore';
import type { Topic, TopicTheme, TopicCategory } from '@/types';
import { formatDateRelative } from '@/shared/utils/dateUtils';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

export const TOPIC_THEMES: TopicTheme[] = [
    { icon: 'laptop', color: '#3B82F6', gradient: ['#3B82F6', '#1D4ED8'] },
    { icon: 'brain', color: '#8B5CF6', gradient: ['#8B5CF6', '#6D28D9'] },
    { icon: 'chart-line', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { icon: 'palette', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { icon: 'flask', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
    { icon: 'book-open-variant', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
];

export const CATEGORIES: TopicCategory[] = [
    { id: 'all', label: 'Tous', icon: 'view-grid' },
    { id: 'recent', label: 'Récents', icon: 'clock-outline' },
    { id: 'favorites', label: 'Favoris', icon: 'star-outline' },
];

const DEBOUNCE_DELAY = 300; // ms

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TopicItemData {
    topic: Topic;
    theme: TopicTheme;
    lastSessionDate: string;
}

export interface UseTopicsListReturn {
    // Data
    filteredTopics: TopicItemData[];
    searchText: string;
    selectedCategory: string;
    showAddModal: boolean;
    newTopicText: string;
    totalSessions: number;
    topicsCount: number;
    greeting: string;
    hasActiveFilters: boolean;
    isLoading: boolean;
    error: string | null;

    // Methods
    setSearchText: (text: string) => void;
    setSelectedCategory: (category: string) => void;
    setShowAddModal: (show: boolean) => void;
    setNewTopicText: (text: string) => void;
    handleAddTopic: () => void;
    handleCardPress: (topicId: string) => void;
    handleEdit: (topicId: string) => void;
    handleShare: (topicId: string) => void;
    handleDelete: (topicId: string) => void;
    closeAllSwipeables: (exceptId?: string) => void;
    registerSwipeableRef: (id: string, ref: SwipeableMethods) => void;
    unregisterSwipeableRef: (id: string) => void;
    resetFilters: () => void;
    refreshTopics: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK - useDebounce
// ═══════════════════════════════════════════════════════════════════════════

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTopicsList(): UseTopicsListReturn {
    const router = useRouter();

    // Store state
    const topics = useStore(selectTopics);
    const isLoading = useStore(selectIsLoading);
    const error = useStore(selectError);

    // Store actions
    const { addTopic, deleteTopic, loadTopics } = useStore();

    // État local
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTopicText, setNewTopicText] = useState('');
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);

    // Debounce du texte de recherche
    const debouncedSearchText = useDebounce(searchText, DEBOUNCE_DELAY);

    // Refs pour les swipeables
    const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

    // ─────────────────────────────────────────────────────────────────────────
    // FIX: Load topics on mount to sync with API
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        console.log('[useTopicsList] Loading topics on mount...');
        loadTopics();
    }, [loadTopics]);

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    // Vérifier si des filtres sont actifs
    const hasActiveFilters = useMemo(() => {
        return debouncedSearchText.trim().length > 0 || selectedCategory !== 'all';
    }, [debouncedSearchText, selectedCategory]);

    // Salutation selon l'heure
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }, []);

    // Topics filtrés et enrichis (utilise le texte debounced)
    const filteredTopics = useMemo((): TopicItemData[] => {
        let result = [...topics];

        // Filtre par recherche (avec debounce)
        if (debouncedSearchText.trim()) {
            const query = debouncedSearchText.toLowerCase();
            result = result.filter((t) => t.title.toLowerCase().includes(query));
        }

        // Tri par catégorie
        if (selectedCategory === 'recent') {
            result.sort((a, b) => {
                const dateA = a.sessions[0]?.date || '';
                const dateB = b.sessions[0]?.date || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        }

        // Enrichissement avec thème et date
        return result.map((topic, index) => ({
            topic,
            theme: TOPIC_THEMES[index % TOPIC_THEMES.length],
            lastSessionDate: topic.sessions[0]?.date
                ? formatDateRelative(topic.sessions[0].date)
                : 'Jamais',
        }));
    }, [topics, debouncedSearchText, selectedCategory]);

    // Stats
    const totalSessions = useMemo(
        () => topics.reduce((acc, t) => acc + t.sessions.length, 0),
        [topics]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    // Réinitialiser les filtres
    const resetFilters = useCallback(() => {
        setSearchText('');
        setSelectedCategory('all');
    }, []);

    // Refresh topics from API
    const refreshTopics = useCallback(async () => {
        console.log('[useTopicsList] Refreshing topics...');
        await loadTopics();
    }, [loadTopics]);

    // Add topic handler
    const handleAddTopic = useCallback(async () => {
        const trimmed = newTopicText.trim();
        if (!trimmed) return;

        console.log('[useTopicsList] Adding topic:', trimmed);

        try {
            const newTopic = await addTopic(trimmed);

            if (newTopic) {
                console.log('[useTopicsList] Topic created:', newTopic.id);
                setNewTopicText('');
                setShowAddModal(false);
                Keyboard.dismiss();
            } else {
                console.error('[useTopicsList] Failed to create topic - no topic returned');
            }
        } catch (error) {
            console.error('[useTopicsList] Error creating topic:', error);
        }
    }, [newTopicText, addTopic]);

    // Close all swipeables
    const closeAllSwipeables = useCallback((exceptId?: string) => {
        swipeableRefs.current.forEach((ref, id) => {
            if (id !== exceptId) {
                ref.close();
            }
        });
        if (!exceptId) {
            setOpenSwipeableId(null);
        }
    }, []);

    // Card press handler
    const handleCardPress = useCallback(
        (topicId: string) => {
            if (openSwipeableId) {
                closeAllSwipeables();
                return;
            }
            router.push(`/${topicId}`);
        },
        [openSwipeableId, closeAllSwipeables, router]
    );

    // Edit handler
    const handleEdit = useCallback(
        (topicId: string) => {
            console.log('Edit topic:', topicId);
            closeAllSwipeables();
            // TODO: Implémenter l'édition
        },
        [closeAllSwipeables]
    );

    // Share handler
    const handleShare = useCallback(
        (topicId: string) => {
            console.log('Share topic:', topicId);
            closeAllSwipeables();
            // TODO: Implémenter le partage
        },
        [closeAllSwipeables]
    );

    // Delete handler
    const handleDelete = useCallback(
        (topicId: string) => {
            deleteTopic(topicId);
            closeAllSwipeables();
        },
        [deleteTopic, closeAllSwipeables]
    );

    // Swipeable ref management
    const registerSwipeableRef = useCallback((id: string, ref: SwipeableMethods) => {
        swipeableRefs.current.set(id, ref);
    }, []);

    const unregisterSwipeableRef = useCallback((id: string) => {
        swipeableRefs.current.delete(id);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        // Data
        filteredTopics,
        searchText,
        selectedCategory,
        showAddModal,
        newTopicText,
        totalSessions,
        topicsCount: topics.length,
        greeting,
        hasActiveFilters,
        isLoading,
        error,

        // Methods
        setSearchText,
        setSelectedCategory,
        setShowAddModal,
        setNewTopicText,
        handleAddTopic,
        handleCardPress,
        handleEdit,
        handleShare,
        handleDelete,
        closeAllSwipeables,
        registerSwipeableRef,
        unregisterSwipeableRef,
        resetFilters,
        refreshTopics,
    };
}