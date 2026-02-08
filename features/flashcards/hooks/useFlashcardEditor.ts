/**
 * @file useFlashcardEditor.ts
 * @description Hook for managing flashcard editor state
 */

import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashcardsService } from '@/shared/services';
import type { EditableFlashcard } from '../types';

interface UseFlashcardEditorReturn {
  cards: EditableFlashcard[];
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  topicTitle: string;
  updateCard: (id: string, field: 'front' | 'back', value: string) => void;
  deleteCard: (id: string) => void;
  addCard: () => void;
  saveCards: () => Promise<void>;
  handleClose: () => void;
}

let tempIdCounter = 0;
function generateTempId(): string {
  return `temp-${Date.now()}-${++tempIdCounter}`;
}

export function useFlashcardEditor(): UseFlashcardEditorReturn {
  const params = useLocalSearchParams<{
    topicId?: string;
    topicTitle?: string;
    content?: string;
  }>();
  const router = useRouter();

  const [cards, setCards] = useState<EditableFlashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicId = params.topicId || '';
  const topicTitle = params.topicTitle || '';
  const content = params.content || '';

  // Generate flashcards on mount
  useEffect(() => {
    if (!content || !topicTitle) {
      setIsGenerating(false);
      setError('Missing content or topic');
      return;
    }

    const generateFlashcards = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        console.log('[useFlashcardEditor] Generating flashcards...');
        const response = await FlashcardsService.generateFromContent(topicTitle, content);

        const editableCards: EditableFlashcard[] = response.cards.map((card) => ({
          id: generateTempId(),
          front: card.front,
          back: card.back,
          isNew: false,
        }));

        setCards(editableCards);
        console.log(`[useFlashcardEditor] Generated ${editableCards.length} cards`);
      } catch (err) {
        console.error('[useFlashcardEditor] Failed to generate flashcards:', err);
        setError('Failed to generate flashcards');
      } finally {
        setIsGenerating(false);
      }
    };

    generateFlashcards();
  }, [content, topicTitle]);

  const updateCard = useCallback((id: string, field: 'front' | 'back', value: string) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const addCard = useCallback(() => {
    const newCard: EditableFlashcard = {
      id: generateTempId(),
      front: '',
      back: '',
      isNew: true,
    };
    setCards((prev) => [...prev, newCard]);
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const saveCards = useCallback(async () => {
    if (cards.length === 0) {
      setError('No cards to save');
      return;
    }

    // Filter out empty cards
    const validCards = cards.filter((card) => card.front.trim() && card.back.trim());
    if (validCards.length === 0) {
      setError('All cards are empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log('[useFlashcardEditor] Creating deck...');
      // Create deck
      const deck = await FlashcardsService.createDeck({
        name: `${topicTitle} - Flashcards`,
        description: `Generated from session on ${new Date().toLocaleDateString()}`,
        topic_id: topicId || null,
      });

      console.log('[useFlashcardEditor] Bulk creating flashcards...');
      // Bulk create flashcards
      await FlashcardsService.bulkCreateFlashcards(
        deck.id,
        validCards.map((card) => ({ front: card.front, back: card.back }))
      );

      console.log('[useFlashcardEditor] Flashcards saved successfully');

      // Navigate back to topic detail
      router.back();
      router.back(); // Go past the result screen too
    } catch (err) {
      console.error('[useFlashcardEditor] Failed to save flashcards:', err);
      setError('Failed to save flashcards');
    } finally {
      setIsSaving(false);
    }
  }, [cards, topicId, topicTitle, router]);

  return {
    cards,
    isGenerating,
    isSaving,
    error,
    topicTitle,
    updateCard,
    deleteCard,
    addCard,
    saveCards,
    handleClose,
  };
}
