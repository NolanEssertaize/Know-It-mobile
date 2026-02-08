/**
 * @file types/index.ts
 * @description Flashcards feature types
 */

export interface EditableFlashcard {
  id: string;  // local temp ID
  front: string;
  back: string;
  isNew?: boolean;
}

export interface ReviewCard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  isNew: boolean;
}

export type SwipeDirection = 'left' | 'right' | 'up' | null;
