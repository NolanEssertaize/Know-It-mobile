import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Layout() {
    const loadTopics = useStore((state) => state.loadTopics);

    useEffect(() => {
        loadTopics();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'KnowIt - Topics' }} />
            <Stack.Screen name="[topicId]/index" options={{ title: 'Historique' }} />
            <Stack.Screen name="[topicId]/session" options={{ title: 'Session en cours', presentation: 'modal' }} />
            <Stack.Screen name="[topicId]/result" options={{ title: 'Analyse', presentation: 'modal' }} />
        </Stack>
    );
}