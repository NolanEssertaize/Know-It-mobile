import AsyncStorage from '@react-native-async-storage/async-storage';
import { Topic } from '../types';

const STORAGE_KEY = '@knowit_topics';

export const StorageService = {
    async getTopics(): Promise<Topic[]> {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Storage Read Error', e);
            return [];
        }
    },

    async saveTopics(topics: Topic[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
        } catch (e) {
            console.error('Storage Write Error', e);
        }
    },

    async clear(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
};