/**
 * @file useTopicsList.ts
 * @description Logic Controller pour l'écran de liste des topics
 *
 * FIXES:
 * - Removed emoji from greeting (no emoji policy)
 * - Added safety filters to prevent crashes on undefined topics
 * - Added useEffect to load topics on mount for synchronization
 * - Added streak property for tracking consecutive days of study
 * - Uses corrected formatDateRelative from dateUtils for proper Today/Yesterday
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Keyboard, Alert } from 'react-native';
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
    streakActiveToday: boolean;
    streakAtRisk: boolean;
    yesterdayStreak: number;

    // Edit modal data
    editingTopicId: string | null;
    editTopicText: string;

    // Methods
    setSearchText: (text: string) => void;
    setSelectedCategory: (category: string) => void;
    setShowAddModal: (show: boolean) => void;
    setNewTopicText: (text: string) => void;
    handleAddTopic: () => void;
    handleCardPress: (topicId: string) => void;
    handleEdit: (topicId: string) => void;
    handleFavorite: (topicId: string) => void;
    handleDelete: (topicId: string) => void;
    closeAllSwipeables: (exceptId?: string) => void;
    registerSwipeableRef: (id: string, ref: SwipeableMethods) => void;
    unregisterSwipeableRef: (id: string) => void;
    resetFilters: () => void;
    refreshTopics: () => Promise<void>;

    // Edit modal methods
    setEditTopicText: (text: string) => void;
    handleEditSubmit: () => void;
    handleEditCancel: () => void;
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

function calculateStreak(topics: Topic[]): {
    streak: number;
    activeToday: boolean;
    streakAtRisk: boolean;
    yesterdayStreak: number;
} {
    if (!topics || !Array.isArray(topics)) return { streak: 0, activeToday: false, streakAtRisk: false, yesterdayStreak: 0 };

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

    if (allSessionDates.length === 0) return { streak: 0, activeToday: false, streakAtRisk: false, yesterdayStreak: 0 };

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

    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const activeToday = uniqueDays.has(todayKey);

    const sortedDays = Array.from(uniqueDays).sort().reverse();

    for (let i = 0; i < sortedDays.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        const expectedKey = `${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`;

        if (sortedDays.includes(expectedKey)) {
            streak++;
        } else {
            break;
        }
    }

    // Calculate yesterday streak (streak counting from yesterday)
    let yesterdayStreak = 0;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    const activeYesterday = uniqueDays.has(yesterdayKey);

    if (activeYesterday) {
        for (let i = 0; i < sortedDays.length; i++) {
            const expectedDate = new Date(yesterday);
            expectedDate.setDate(yesterday.getDate() - i);
            const expectedKey = `${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`;

            if (sortedDays.includes(expectedKey)) {
                yesterdayStreak++;
            } else {
                break;
            }
        }
    }

    // At risk = not active today but had activity yesterday (streak to lose)
    const streakAtRisk = !activeToday && yesterdayStreak > 0;

    return { streak, activeToday, streakAtRisk, yesterdayStreak };
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
    const { addTopic, deleteTopic, loadTopics, toggleFavorite, updateTopicTitle } = useStore();

    // État local
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTopicText, setNewTopicText] = useState('');
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);

    // Edit modal state
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [editTopicText, setEditTopicText] = useState('');

    // Debounce du texte de recherche
    const debouncedSearchText = useDebounce(searchText, DEBOUNCE_DELAY);

    // Refs pour les swipeables
    const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS - Load topics on mount
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        console.log('[useTopicsList] Loading topics on mount...');
        loadTopics();
    }, [loadTopics]);

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    const hasActiveFilters = useMemo(() => {
        return debouncedSearchText.trim().length > 0 || selectedCategory !== 'all';
    }, [debouncedSearchText, selectedCategory]);

    // FIXED: Greeting without emoji (no emoji policy)
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }, []);

    // Topics filtrés et enrichis
    const filteredTopics = useMemo((): TopicItemData[] => {
        if (!topics || !Array.isArray(topics)) return [];

        let result = topics.filter((t) => t && t.id);

        // Filtre par recherche
        if (debouncedSearchText.trim()) {
            const query = debouncedSearchText.toLowerCase();
            result = result.filter((t) => t.title && t.title.toLowerCase().includes(query));
        }

        // Filter/sort by category
        if (selectedCategory === 'recent') {
            result.sort((a, b) => {
                const dateA = (a.sessions && a.sessions[0]?.date) || '';
                const dateB = (b.sessions && b.sessions[0]?.date) || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        } else if (selectedCategory === 'favorites') {
            result = result.filter((t) => t.isFavorite);
        }

        // Enrichissement
        return result.map((topic, index) => ({
            topic,
            theme: TOPIC_THEMES[index % TOPIC_THEMES.length],
            lastSessionDate: topic.sessions && topic.sessions[0]?.date
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
    const { streak, activeToday: streakActiveToday, streakAtRisk, yesterdayStreak } = useMemo(() => calculateStreak(topics), [topics]);

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
            const topic = topics.find((t) => t.id === topicId);
            if (!topic) return;

            closeAllSwipeables();
            setEditingTopicId(topicId);
            setEditTopicText(topic.title);
        },
        [closeAllSwipeables, topics]
    );

    const handleEditSubmit = useCallback(() => {
        if (editingTopicId && editTopicText.trim()) {
            updateTopicTitle(editingTopicId, editTopicText.trim());
        }
        setEditingTopicId(null);
        setEditTopicText('');
    }, [editingTopicId, editTopicText, updateTopicTitle]);

    const handleEditCancel = useCallback(() => {
        setEditingTopicId(null);
        setEditTopicText('');
    }, []);

    const handleFavorite = useCallback(
        (topicId: string) => {
            console.log('Toggle favorite for topic:', topicId);
            // Don't close swipeable - let user see the star change
            toggleFavorite(topicId);
        },
        [toggleFavorite]
    );

    const handleDelete = useCallback(
        (topicId: string) => {
            const topic = topics.find((t) => t.id === topicId);
            const topicName = topic?.title || 'ce sujet';

            Alert.alert(
                'Supprimer le sujet',
                `Voulez-vous vraiment supprimer "${topicName}" ? Cette action est irréversible et toutes les sessions associées seront perdues.`,
                [
                    {
                        text: 'Annuler',
                        style: 'cancel',
                        onPress: () => closeAllSwipeables(),
                    },
                    {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: () => {
                            deleteTopic(topicId);
                            closeAllSwipeables();
                        },
                    },
                ]
            );
        },
        [deleteTopic, closeAllSwipeables, topics]
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
        streakActiveToday,
        streakAtRisk,
        yesterdayStreak,
        editingTopicId,
        editTopicText,
        setSearchText,
        setSelectedCategory,
        setShowAddModal,
        setNewTopicText,
        handleAddTopic,
        handleCardPress,
        handleEdit,
        handleFavorite,
        handleDelete,
        closeAllSwipeables,
        registerSwipeableRef,
        unregisterSwipeableRef,
        resetFilters,
        refreshTopics,
        setEditTopicText,
        handleEditSubmit,
        handleEditCancel,
    };
}