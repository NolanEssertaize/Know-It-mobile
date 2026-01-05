import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function TopicDetail() {
    const { topicId } = useLocalSearchParams();
    const router = useRouter();
    const topic = useStore((state) => state.topics.find((t) => t.id === topicId));

    if (!topic) return <Text>Topic introuvable</Text>;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push(`/${topicId}/session`)}
            >
                <Text style={styles.startText}>Démarrer une session</Text>
            </TouchableOpacity>

            <Text style={styles.header}>Historique</Text>

            <FlatList
                data={topic.sessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                        <Text numberOfLines={2} style={styles.preview}>{item.transcription}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    startButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
    startText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10 },
    date: { fontSize: 12, color: '#999', marginBottom: 5 },
    preview: { fontSize: 14, color: '#333' }
});