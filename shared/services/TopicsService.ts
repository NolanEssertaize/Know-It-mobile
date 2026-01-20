/**
 * @file TopicsService.ts
 * @description Topics Service - CRUD operations for learning topics
 *
 * Responsibilities:
 * - Create, read, update, delete topics
 * - Fetch topics list with pagination
 * - Fetch topic details with sessions
 */

import { api, API_ENDPOINTS } from '@/shared/api';
import type {
    TopicCreate,
    TopicRead,
    TopicDetail,
    TopicUpdate,
    TopicList,
    PaginationParams,
} from '@/shared/api';

export const TopicsService = {
    /**
     * Get paginated list of user's topics
     * @param params - Pagination parameters
     * @returns List of topics with total count
     */
    async getTopics(params?: PaginationParams): Promise<TopicList> {
        const { skip = 0, limit = 100 } = params || {};

        console.log(`[TopicsService] Fetching topics (skip: ${skip}, limit: ${limit})`);

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });

        const response = await api.get<TopicList>(
            `${API_ENDPOINTS.TOPICS.LIST}?${queryParams.toString()}`,
        );

        console.log(`[TopicsService] Fetched ${response.topics.length} topics (total: ${response.total})`);
        return response;
    },

    /**
     * Get all topics (handles pagination internally)
     * @returns All user's topics
     */
    async getAllTopics(): Promise<TopicRead[]> {
        console.log('[TopicsService] Fetching all topics');

        const allTopics: TopicRead[] = [];
        let skip = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
            const response = await this.getTopics({ skip, limit });
            allTopics.push(...response.topics);

            if (allTopics.length >= response.total || response.topics.length < limit) {
                hasMore = false;
            } else {
                skip += limit;
            }
        }

        console.log(`[TopicsService] Fetched all ${allTopics.length} topics`);
        return allTopics;
    },

    /**
     * Get a single topic with all sessions
     * @param topicId - Topic ID
     * @returns Topic details with sessions
     */
    async getTopic(topicId: string): Promise<TopicDetail> {
        console.log(`[TopicsService] Fetching topic: ${topicId}`);

        const response = await api.get<TopicDetail>(
            API_ENDPOINTS.TOPICS.GET(topicId),
        );

        console.log(`[TopicsService] Fetched topic "${response.title}" with ${response.sessions?.length || 0} sessions`);
        return response;
    },

    /**
     * Create a new topic
     * @param data - Topic creation data
     * @returns Created topic
     */
    async createTopic(data: TopicCreate): Promise<TopicRead> {
        console.log(`[TopicsService] Creating topic: "${data.title}"`);

        const response = await api.post<TopicRead>(
            API_ENDPOINTS.TOPICS.CREATE,
            data,
        );

        console.log(`[TopicsService] Topic created with ID: ${response.id}`);
        return response;
    },

    /**
     * Update a topic
     * @param topicId - Topic ID
     * @param data - Update data
     * @returns Updated topic
     */
    async updateTopic(topicId: string, data: TopicUpdate): Promise<TopicRead> {
        console.log(`[TopicsService] Updating topic: ${topicId}`);

        const response = await api.patch<TopicRead>(
            API_ENDPOINTS.TOPICS.UPDATE(topicId),
            data,
        );

        console.log(`[TopicsService] Topic updated: "${response.title}"`);
        return response;
    },

    /**
     * Delete a topic
     * @param topicId - Topic ID
     */
    async deleteTopic(topicId: string): Promise<void> {
        console.log(`[TopicsService] Deleting topic: ${topicId}`);

        await api.delete(API_ENDPOINTS.TOPICS.DELETE(topicId));

        console.log(`[TopicsService] Topic deleted`);
    },
} as const;