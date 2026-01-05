import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AudioService } from '../../services/AudioService';
import { LLMService } from '../../services/LLMService';
import { useStore } from '../../store/useStore';
import { v4 as uuidv4 } from 'uuid';

export default function ActiveSession() {
    const { topicId } = useLocalSearchParams();
    const router = useRouter();
    const addSessionToTopic = useStore((state) => state.addSessionToTopic);
    const topic = useStore((state) => state.topics.find((t) => t.id === topicId));

    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const audioService = useRef(new AudioService());

    const toggleRecording = async () => {
        if (isRecording) {
            // STOP
            const uri = await audioService.current.stopRecording();
            setIsRecording(false);
            if (uri) processAudio(uri);
        } else {
            // START
            const hasPerm = await audioService.current.requestPermissions();
            if (!hasPerm) return alert('Permission micro requise');
            await audioService.current.startRecording();
            setIsRecording(true);
        }
    };

    const processAudio = async (uri: string) => {
        setIsProcessing(true);
        try {
            // 1. STT
            const text = await LLMService.transcribeAudio(uri);

            // 2. LLM Analysis
            const analysis = await LLMService.analyzeText(text, topic?.title || 'Unknown');

            // 3. Save
            const session = {
                id: uuidv4(),
                date: new Date().toISOString(),
                audioUri: uri,
                transcription: text,
                analysis
            };

            addSessionToTopic(topicId as string, session);

            // 4. Navigate to Result (pass ID to retrieve from store, or pass params)
            // Ici on passe les données via params pour simplifier l'exemple,
            // mais idéalement on relit le store dans la vue Result via l'ID de session.
            router.replace({
                pathname: `/${topicId}/result`,
                params: {
                    valid: JSON.stringify(analysis.valid),
                    corrections: JSON.stringify(analysis.corrections),
                    missing: JSON.stringify(analysis.missing)
                }
            });

        } catch (e) {
            console.error(e);
            alert('Erreur lors du traitement');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.topic}>{topic?.title}</Text>

            {isProcessing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{marginTop: 20}}>Analyse IA en cours...</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.recordBtn, isRecording ? styles.recording : null]}
                    onPress={toggleRecording}
                >
                    <Text style={styles.btnText}>{isRecording ? 'STOP' : 'PARLER'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topic: { fontSize: 24, fontWeight: 'bold', marginBottom: 50 },
    center: { alignItems: 'center' },
    recordBtn: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
    recording: { backgroundColor: '#FF3B30' },
    btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});