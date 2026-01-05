import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

export default function TopicsList() {
    const [text, setText] = useState('');
    const { topics, addTopic } = useStore();
    const router = useRouter();

    const handleAdd = () => {
        if (!text.trim()) return;
        addTopic(text);
        setText('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nouveau sujet (ex: React Native)"
                    value={text}
                    onChangeText={setText}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addText}>+</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={topics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => router.push(`/${item.id}`)}
                    >
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemCount}>{item.sessions.length} sessions</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 8, marginRight: 10 },
    addButton: { backgroundColor: '#007AFF', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8 },
    addText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    item: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginBottom: 10 },
    itemTitle: { fontSize: 18, fontWeight: '600' },
    itemCount: { fontSize: 12, color: '#666', marginTop: 5 }
});