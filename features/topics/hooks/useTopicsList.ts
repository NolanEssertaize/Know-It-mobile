/**
 * @file useTopicsList.ts
 * @description Topics list hook - Business logic for TopicsListScreen
 *
 * CRITICAL: This hook must NOT auto-refresh. Uses useRef to track initial load.
 */

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useStore, selectTopics, selectIsLoading, selectError } from '@/store';
import type { Topic, TopicItemData } from '@/types';
import { formatSessionHistoryDate } from '@/shared/utils/dateUtils';

// Constants
const DEBOUNCE_DELAY = 300;

// Topic categories
export const CATEGORIES = ['all', 'programming', 'science', 'languages', 'history', 'math', 'other'] as const;
export type Category = typeof CATEGORIES[number];

// Topic theme colors for visual variety
export const TOPIC_THEMES = [
    { primary: '#6366F1', secondary: '#818CF8' }, // Indigo
    { primary: '#8B5CF6', secondary: '#A78BFA' }, // Violet
    { primary: '#EC4899', secondary: '#F472B6' }, // Pink
    { primary: '#10B981', secondary: '#34D399' }, // Emerald
    { primary: '#F59E0B', secondary: '#FBBF24' }, // Amber
    { primary: '#3B82F6', secondary: '#60A5FA' }, // Blue
] as const;

// Swipeable ref type
export interface SwipeableMethods {
    close: () => void;
}

interface UseTopicsListReturn {
    // Data
    filteredTopics: TopicItemData[];
    stats: { topicsCount: number; sessionsCount: number; streak: number };

    // State
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    selectedCategory: Category;
    isAddModalVisible: boolean;
    newTopicTitle: string;
    isAddingTopic: boolean;

    // Actions
    setSearchQuery: (text: string) => void;
    setSelectedCategory: (category: Category) => void;
    setIsAddModalVisible: (show: boolean) => void;
    setNewTopicTitle: (text: string) => void;
    handleCardPress: (topicId: string) => void;
    handleAddTopic: () => Promise<void>;
    handleEdit: (topicId: string) => void;
    handleShare: (topicId: string) => void;
    handleDelete: (topicId: string) => Promise<void>;
    registerSwipeableRef: (id: string, ref: SwipeableMethods) => void;
    unregisterSwipeableRef: (id: string) => void;
    resetFilters: () => void;
    refreshTopics: () => Promise<void>;
}

// Custom debounce hook
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

// Calculate streak
function calculateStreak(topics: Topic[]): number {
    const allSessions = topics.flatMap((t) => t.sessions || []);
    if (allSessions.length === 0) return 0;

    const today = new Date();
    const uniqueDays = new Set<string>();

    allSessions.forEach((session) => {
        const date = new Date(session.date);
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        uniqueDays.add(dayKey);
    });

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    let streak = 0;

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

    return streak;
}

export function useTopicsList(): UseTopicsListReturn {
    const router = useRouter();

    // Store state
    const topics = useStore(selectTopics);
    const isLoading = useStore(selectIsLoading);
    const error = useStore(selectError);

    // Store actions
    const { addTopic, deleteTopic, loadTopics } = useStore();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [isAddingTopic, setIsAddingTopic] = useState(false);

    // Debounced search
    const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

    // Swipeable refs
    const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: Load topics ONCE on mount - no auto-refresh
    // ═══════════════════════════════════════════════════════════════════════════
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            console.log('[useTopicsList] Initial load...');
            loadTopics();
        }
        // CRITICAL: Empty dependency array - load ONCE only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // MEMOIZED VALUES
    // ═══════════════════════════════════════════════════════════════════════════

    const hasActiveFilters = useMemo(() => {
        return debouncedSearchQuery.length > 0 || selectedCategory !== 'all';
    }, [debouncedSearchQuery, selectedCategory]);

    // Filter and transform topics
    const filteredTopics: TopicItemData[] = useMemo(() => {
        let filtered = topics || [];

        // Filter by search
        if (debouncedSearchQuery) {
            const searchLower = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter((topic) =>
                topic.title.toLowerCase().includes(searchLower)
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((topic) => topic.category === selectedCategory);
        }

        // Transform to TopicItemData
        return filtered.map((topic, index) => {
            const sessions = topic.sessions || [];
            const sessionCount = sessions.length;
            const lastSession = sessions[0];
            const lastSessionDate = lastSession?.date || null;
            const formattedLastSession = lastSessionDate
                ? formatSessionHistoryDate(lastSessionDate)
                : '';

            return {
                topic: {
                    ...topic,
                    sessions, // Ensure sessions is always an array
                    // Add theme for visual variety
                    _theme: TOPIC_THEMES[index % TOPIC_THEMES.length],
                },
                sessionCount,
                lastSessionDate,
                formattedLastSession,
            } as TopicItemData;
        });
    }, [topics, debouncedSearchQuery, selectedCategory]);

    // Stats
    const stats = useMemo(() => {
        const safeTopics = topics || [];
        const topicsCount = safeTopics.length;
        const sessionsCount = safeTopics.reduce((acc, t) => acc + (t.sessions?.length || 0), 0);
        const streak = calculateStreak(safeTopics);
        return { topicsCount, sessionsCount, streak };
    }, [topics]);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    const handleCardPress = useCallback(
        (topicId: string) => {
            console.log('[useTopicsList] Card pressed:', topicId);
            router.push(`/${topicId}`);
        },
        [router]
    );

    const handleAddTopic = useCallback(async () => {
        const trimmed = newTopicTitle?.trim();
        if (!trimmed) return;

        setIsAddingTopic(true);
        try {
            await addTopic(trimmed, selectedCategory === 'all' ? 'other' : selectedCategory);
            setNewTopicTitle('');
            setIsAddModalVisible(false);
        } catch (err) {
            console.error('[useTopicsList] Error adding topic:', err);
        } finally {
            setIsAddingTopic(false);
        }
    }, [newTopicTitle, selectedCategory, addTopic]);

    const handleEdit = useCallback(
        (topicId: string) => {
            console.log('[useTopicsList] Edit topic:', topicId);
            // Close swipeable
            swipeableRefs.current.get(topicId)?.close();
            // Navigate to topic detail with edit mode
            router.push(`/${topicId}`);
        },
        [router]
    );

    const handleShare = useCallback((topicId: string) => {
        console.log('[useTopicsList] Share topic:', topicId);
        swipeableRefs.current.get(topicId)?.close();
        // TODO: Implement share functionality
    }, []);

    const handleDelete = useCallback(
        async (topicId: string) => {
            console.log('[useTopicsList] Delete topic:', topicId);
            swipeableRefs.current.get(topicId)?.close();
            await deleteTopic(topicId);
        },
        [deleteTopic]
    );

    const registerSwipeableRef = useCallback((id: string, ref: SwipeableMethods) => {
        swipeableRefs.current.set(id, ref);
    }, []);

    const unregisterSwipeableRef = useCallback((id: string) => {
        swipeableRefs.current.delete(id);
    }, []);

    const resetFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('all');
    }, []);

    const refreshTopics = useCallback(async () => {
        await loadTopics();
    }, [loadTopics]);

    return {
        filteredTopics,
        stats,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isAddModalVisible,
        setIsAddModalVisible,
        newTopicTitle,
        setNewTopicTitle,
        isAddingTopic,
        handleCardPress,
        handleAddTopic,
        handleEdit,
        handleShare,
        handleDelete,
        registerSwipeableRef,
        unregisterSwipeableRef,
        resetFilters,
        refreshTopics,
    };
}