/**
 * @file FlashcardsService.ts
 * @description Flashcards Service - Generate flashcards, create decks, bulk create cards
 */

import { api, API_ENDPOINTS } from '@/shared/api';
import type {
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  DeckCreate,
  DeckRead,
  BulkCreateResponse,
  DeckWithStats,
  AllDueCardsResponse,
  FlashcardTimelineResponse,
  FlashcardRead,
  FlashcardCreate,
  FlashcardUpdate,
  ReviewDifficulty,
  ReviewResult,
  DelayLabel,
} from '@/shared/api';

export const FlashcardsService = {
  /**
   * Generate flashcards from content using AI
   * @param topic - Topic title
   * @param content - Content to generate flashcards from
   * @returns Generated flashcards
   */
  async generateFromContent(topic: string, content: string): Promise<GenerateFlashcardsResponse> {
    console.log(`[FlashcardsService] Generating flashcards for topic: "${topic}"`);

    const request: GenerateFlashcardsRequest = { topic, content };

    const response = await api.post<GenerateFlashcardsResponse>(
      API_ENDPOINTS.FLASHCARDS.GENERATE,
      request,
    );

    console.log(`[FlashcardsService] Generated ${response.cards.length} flashcards`);
    return response;
  },

  /**
   * Create a new deck
   * @param data - Deck creation data
   * @returns Created deck
   */
  async createDeck(data: DeckCreate): Promise<DeckRead> {
    console.log(`[FlashcardsService] Creating deck: "${data.name}"`);

    const response = await api.post<DeckRead>(
      API_ENDPOINTS.DECKS.CREATE,
      data,
    );

    console.log(`[FlashcardsService] Deck created with ID: ${response.id}`);
    return response;
  },

  /**
   * Bulk create flashcards in a deck
   * @param deckId - Deck ID
   * @param cards - Array of cards with front/back content
   * @returns Bulk create response with created count
   */
  async bulkCreateFlashcards(
    deckId: string,
    cards: { front: string; back: string; delay?: DelayLabel }[],
  ): Promise<BulkCreateResponse> {
    console.log(`[FlashcardsService] Bulk creating ${cards.length} flashcards in deck: ${deckId}`);

    const response = await api.post<BulkCreateResponse>(
      API_ENDPOINTS.FLASHCARDS.BULK_CREATE,
      { deck_id: deckId, cards },
    );

    console.log(`[FlashcardsService] Created ${response.created} flashcards`);
    return response;
  },

  /**
   * Get all decks with stats
   * @returns List of decks with due/new/review counts
   */
  async getDecks(): Promise<DeckWithStats[]> {
    console.log('[FlashcardsService] Fetching decks');

    const response = await api.get<{ decks: DeckWithStats[] }>(
      API_ENDPOINTS.DECKS.LIST,
    );

    console.log(`[FlashcardsService] Fetched ${response.decks.length} decks`);
    return response.decks;
  },

  /**
   * Get all due flashcards (optionally filtered by deck)
   * @param deckId - Optional deck ID to filter by
   * @returns Due flashcards ready for review
   */
  async getAllDueCards(deckId?: string): Promise<AllDueCardsResponse> {
    console.log('[FlashcardsService] Fetching due flashcards', deckId ? `for deck: ${deckId}` : '(all)');

    const response = await api.get<AllDueCardsResponse>(
      API_ENDPOINTS.FLASHCARDS.DUE,
    );

    // Filter by deck if specified
    if (deckId) {
      const filteredCards = response.cards.filter(card => card.deck_id === deckId);
      console.log(`[FlashcardsService] Filtered to ${filteredCards.length} cards for deck ${deckId}`);
      return {
        cards: filteredCards,
        total_due: filteredCards.length,
      };
    }

    console.log(`[FlashcardsService] Fetched ${response.cards.length} total due cards`);
    return response;
  },

  /**
   * Submit a review for a flashcard
   * @param flashcardId - Flashcard ID
   * @param difficulty - Review difficulty (forgot/hard/good)
   *   - forgot: wrong, reset to step 0 (1 day)
   *   - hard: difficult, stay at current step (same interval)
   *   - good: correct, advance to next step
   * @returns Updated review info
   */
  async submitReview(flashcardId: string, difficulty: ReviewDifficulty): Promise<ReviewResult> {
    console.log(`[FlashcardsService] Submitting review: ${flashcardId} - ${difficulty}`);

    const response = await api.post<ReviewResult>(
      API_ENDPOINTS.FLASHCARDS.REVIEW(flashcardId),
      { rating: difficulty },
    );

    console.log(`[FlashcardsService] Review submitted, next review: ${response.next_review}`);
    return response;
  },

  /**
   * Get timeline of upcoming flashcard reviews
   * @returns Timeline periods showing when cards are due
   */
  async getTimeline(): Promise<FlashcardTimelineResponse> {
    console.log('[FlashcardsService] Fetching flashcard timeline');

    const response = await api.get<FlashcardTimelineResponse>(
      API_ENDPOINTS.FLASHCARDS.TIMELINE,
    );

    console.log(`[FlashcardsService] Fetched timeline with ${response.total_upcoming} upcoming cards`);
    return response;
  },

  /**
   * Get deck-specific timeline
   * @param deckId - Deck ID
   * @returns Timeline periods for this deck
   */
  async getDeckTimeline(deckId: string): Promise<FlashcardTimelineResponse> {
    console.log(`[FlashcardsService] Fetching timeline for deck: ${deckId}`);

    const response = await api.get<FlashcardTimelineResponse>(
      API_ENDPOINTS.DECKS.TIMELINE(deckId),
    );

    console.log(`[FlashcardsService] Fetched deck timeline with ${response.total_upcoming} upcoming cards`);
    return response;
  },

  /**
   * Create a single flashcard
   * @param data - Flashcard creation data
   * @returns Created flashcard
   */
  async createFlashcard(data: FlashcardCreate): Promise<FlashcardRead> {
    console.log(`[FlashcardsService] Creating flashcard in deck: ${data.deck_id}`);

    const response = await api.post<FlashcardRead>(
      API_ENDPOINTS.FLASHCARDS.CREATE,
      data,
    );

    console.log(`[FlashcardsService] Flashcard created with ID: ${response.id}`);
    return response;
  },

  /**
   * Update a flashcard
   * @param id - Flashcard ID
   * @param data - Fields to update
   * @returns Updated flashcard
   */
  async updateFlashcard(id: string, data: FlashcardUpdate): Promise<FlashcardRead> {
    console.log(`[FlashcardsService] Updating flashcard: ${id}`);

    const response = await api.patch<FlashcardRead>(
      API_ENDPOINTS.FLASHCARDS.UPDATE(id),
      data,
    );

    console.log(`[FlashcardsService] Flashcard updated: ${id}`);
    return response;
  },

  /**
   * Delete a flashcard
   * @param id - Flashcard ID
   */
  async deleteFlashcard(id: string): Promise<void> {
    console.log(`[FlashcardsService] Deleting flashcard: ${id}`);

    await api.delete(
      API_ENDPOINTS.FLASHCARDS.DELETE(id),
    );

    console.log(`[FlashcardsService] Flashcard deleted: ${id}`);
  },
} as const;
