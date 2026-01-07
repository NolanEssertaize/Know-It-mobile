/**
 * @file useTopicsList.ts
 * @description Logic Controller pour l'écran de liste des topics
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useStore, selectTopics } from '@/store/useStore';
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
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTopicsList(): UseTopicsListReturn {
  const router = useRouter();
  const topics = useStore(selectTopics);
  const { addTopic, deleteTopic } = useStore();

  // État local
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicText, setNewTopicText] = useState('');
  const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);

  // Refs pour les swipeables
  const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

  // Salutation selon l'heure
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  // Topics filtrés et enrichis
  const filteredTopics = useMemo((): TopicItemData[] => {
    let result = [...topics];

    // Filtre par recherche
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
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
  }, [topics, searchText, selectedCategory]);

  // Stats
  const totalSessions = useMemo(
    () => topics.reduce((acc, t) => acc + t.sessions.length, 0),
    [topics]
  );

  // Handlers
  const handleAddTopic = useCallback(() => {
    const trimmed = newTopicText.trim();
    if (!trimmed) return;
    
    addTopic(trimmed);
    setNewTopicText('');
    setShowAddModal(false);
    Keyboard.dismiss();
  }, [newTopicText, addTopic]);

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
      // TODO: Implémenter l'édition
    },
    [closeAllSwipeables]
  );

  const handleShare = useCallback(
    (topicId: string) => {
      console.log('Share topic:', topicId);
      closeAllSwipeables();
      // TODO: Implémenter le partage
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
    swipeableRefs.current.set(id, ref);
  }, []);

  const unregisterSwipeableRef = useCallback((id: string) => {
    swipeableRefs.current.delete(id);
  }, []);

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
  };
}
