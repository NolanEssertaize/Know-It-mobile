/**
 * @file useTopicsList.ts
 * @description Logic Controller pour l'écran de liste des topics
 *
 * MERGED:
 * - MAIN branch: All logic, refs, state management preserved
 * - Compatible with i18n-enabled TopicsListScreen
 *
 * CRITICAL: This hook must NOT auto-refresh. Uses useRef to track initial load.
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
    { icon: 'laptop', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'brain', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'chart-line', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'palette', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'flask', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'book-open-variant', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
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
    streak: number;

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
// HELPER - Calculate streak from sessions
// ═══════════════════════════════════════════════════════════════════════════

function calculateStreak(topics: Topic[]): number {
    if (!topics || !Array.isArray(topics)) return 0;

    const allSessionDates: Date[] = [];

    topics.forEach(topic => {
        if (topic && topic.sessions && Array.isArray(topic.sessions)) {
            topic.sessions.forEach(session => {
                if (session && session.date) {
                    allSessionDates.push(new Date(session.date));
                }
            });
        }
    });

    if (allSessionDates.length === 0) return 0;

    // Sort dates descending
    allSessionDates.sort((a, b) => b.getTime() - a.getTime());

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set<string>();
    allSessionDates.forEach(date => {
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        uniqueDays.add(dayKey);
    });

    const sortedDays = Array.from(uniqueDays).sort().reverse();

    for (let i = 0; i < 365; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        const expectedKey = `${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`;

        if (sortedDays.includes(expectedKey)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
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

    // Ref to track if we've loaded topics (prevent re-fetching)
    const hasLoadedRef = useRef(false);

    // ─────────────────────────────────────────────────────────────────────────
    // CRITICAL: Load topics ONCE on mount - no auto-refresh
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            console.log('[useTopicsList] Loading topics on mount...');
            loadTopics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    // Greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }, []);

    // Vérifier si des filtres sont actifs
    const hasActiveFilters = useMemo(() => {
        return debouncedSearchText.trim().length > 0 || selectedCategory !== 'all';
    }, [debouncedSearchText, selectedCategory]);

    // Topics filtrés et enrichis (utilise le texte debounced)
    const filteredTopics = useMemo((): TopicItemData[] => {
        let result = [...(topics || [])];

        // Filtre par recherche (avec debounce)
        if (debouncedSearchText.trim()) {
            const query = debouncedSearchText.toLowerCase();
            result = result.filter((t) => t.title.toLowerCase().includes(query));
        }

        // Tri par catégorie
        if (selectedCategory === 'recent') {
            result.sort((a, b) => {
                const dateA = a.sessions?.[0]?.date || '';
                const dateB = b.sessions?.[0]?.date || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        }

        // Enrichissement avec thème et date
        return result.map((topic, index) => ({
            topic,
            theme: TOPIC_THEMES[index % TOPIC_THEMES.length],
            lastSessionDate: topic.sessions?.[0]?.date
                ? formatDateRelative(topic.sessions[0].date)
                : 'Jamais',
        }));
    }, [topics, debouncedSearchText, selectedCategory]);

    // Stats (with safety check)
    const totalSessions = useMemo(
        () => (topics || []).reduce((acc, t) => acc + (t?.sessions?.length || 0), 0),
        [topics]
    );

    // Streak
    const streak = useMemo(() => calculateStreak(topics || []), [topics]);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const resetFilters = useCallback(() => {
        setSearchText('');
        setSelectedCategory('all');
    }, []);

    const refreshTopics = useCallback(async () => {
        console.log('[useTopicsList] Refreshing topics...');
        await loadTopics();
    }, [loadTopics]);

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

    const closeAllSwipeables = useCallback((exceptId?: string) => {
        swipeableRefs.current.forEach((ref, id) => {
            if (id !== exceptId) {
                ref?.close();
            }
        });
        if (!exceptId) {
            setOpenSwipeableId(null);
        }
    }, []);

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

    const handleEdit = useCallback(
        (topicId: string) => {
            console.log('Edit topic:', topicId);
            closeAllSwipeables();
            // TODO: Implement edit
        },
        [closeAllSwipeables]
    );

    const handleShare = useCallback(
        (topicId: string) => {
            console.log('Share topic:', topicId);
            closeAllSwipeables();
            // TODO: Implement share
        },
        [closeAllSwipeables]
    );

    const handleDelete = useCallback(
        (topicId: string) => {
            deleteTopic(topicId);
            closeAllSwipeables();
        },
        [deleteTopic, closeAllSwipeables]
    );

    const registerSwipeableRef = useCallback((id: string, ref: SwipeableMethods) => {
        if (ref) {
            swipeableRefs.current.set(id, ref);
        }
    }, []);

    const unregisterSwipeableRef = useCallback((id: string) => {
        swipeableRefs.current.delete(id);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        filteredTopics,
        searchText,
        selectedCategory,
        showAddModal,
        newTopicText,
        totalSessions,
        topicsCount: (topics || []).length,
        greeting,
        hasActiveFilters,
        isLoading,
        error,
        streak,
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

export default useTopicsList;