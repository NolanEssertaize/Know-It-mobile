/**
 * @file useSession.ts
 * @description Logic Controller pour l'écran d'enregistrement
 */

import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectTopicById } from '@/store/useStore';
import type { Topic, RecordingState } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseSessionReturn {
  // Data
  topic: Topic | undefined;
  recordingState: RecordingState;
  isRecording: boolean;
  isAnalyzing: boolean;

  // Methods
  toggleRecording: () => Promise<void>;
  handleClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSession(): UseSessionReturn {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();

  const topic = useStore(selectTopicById(topicId ?? ''));

  // États
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');

  // Derived states
  const isRecording = recordingState === 'recording';
  const isAnalyzing = recordingState === 'analyzing';

  // Handlers
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording → Analyze
      setRecordingState('analyzing');

      // TODO: Implémenter l'appel réel au service d'enregistrement
      // const audioUri = await RecordingService.stopRecording();
      // const transcription = await LLMService.transcribeAudio(audioUri);
      // const analysis = await LLMService.analyzeText(transcription, topic.title);

      // Simulation d'analyse
      setTimeout(() => {
        router.replace({
          pathname: `/${topicId}/result`,
          params: {
            valid: JSON.stringify([
              'Point clé 1 correctement énoncé',
              'Bonne compréhension du concept',
            ]),
            corrections: JSON.stringify(['Préciser davantage ce point']),
            missing: JSON.stringify(['Concept important non mentionné']),
          },
        });
      }, 2000);
    } else {
      // Start recording
      setRecordingState('recording');
      // TODO: await RecordingService.startRecording();
    }
  }, [isRecording, topicId, router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return {
    // Data
    topic,
    recordingState,
    isRecording,
    isAnalyzing,

    // Methods
    toggleRecording,
    handleClose,
  };
}
