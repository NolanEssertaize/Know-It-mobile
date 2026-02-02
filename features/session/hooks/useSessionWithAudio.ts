/**
 * @file useSessionWithAudio.ts
 * @description Hook for audio recording session with expo-av
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

import { useStore, selectCurrentTopic } from '@/store';

export type SessionStatus = 'idle' | 'recording' | 'paused' | 'analyzing' | 'completed' | 'error';

interface UseSessionWithAudioReturn {
  // State
  status: SessionStatus;
  recordingDuration: number;
  formattedDuration: string;
  error: string | null;
  topic: ReturnType<typeof selectCurrentTopic>;

  // Actions
  handleStart: () => Promise<void>;
  handlePause: () => Promise<void>;
  handleResume: () => Promise<void>;
  handleStop: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  handleGoBack: () => void;
}

export function useSessionWithAudio(): UseSessionWithAudioReturn {
  const { t } = useTranslation();
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();

  // Store
  const currentTopic = useStore(selectCurrentTopic);
  const addSession = useStore((state) => state.addSession);

  // State
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(recordingDuration / 60)
    .toString()
    .padStart(2, '0')}:${(recordingDuration % 60).toString().padStart(2, '0')}`;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  // Request permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Audio.getPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status: newStatus } = await Audio.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            t('session.permissions.title'),
            t('session.permissions.message'),
            [{ text: t('common.ok') }]
          );
          return false;
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError(t('session.errors.permissions'));
      return false;
    }
  };

  // Start recording
  const handleStart = useCallback(async () => {
    try {
      setError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Create new recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setStatus('recording');
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(t('session.errors.startFailed'));
      setStatus('error');
    }
  }, [t]);

  // Pause recording
  const handlePause = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.pauseAsync();
        setStatus('paused');
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error pausing recording:', err);
      setError(t('session.errors.pauseFailed'));
    }
  }, [t]);

  // Resume recording
  const handleResume = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.startAsync();
        setStatus('recording');
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error('Error resuming recording:', err);
      setError(t('session.errors.resumeFailed'));
    }
  }, [t]);

  // Stop recording
  const handleStop = useCallback(async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setAudioUri(uri);
        recordingRef.current = null;
        setStatus('idle'); // Ready to submit
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError(t('session.errors.stopFailed'));
      setStatus('error');
    }
  }, [t]);

  // Submit recording for analysis
  const handleSubmit = useCallback(async () => {
    if (!topicId || !audioUri) return;

    setStatus('analyzing');
    setError(null);

    try {
      // In a real app, this would upload audio to API for transcription and analysis
      // For now, we'll create a mock session

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock analysis result
      const mockSession = {
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        audioUri,
        transcription: 'This is a mock transcription of the audio recording.',
        analysis: {
          valid: [
            'Correctly explained the main concept',
            'Good use of terminology',
            'Clear structure in explanation',
          ],
          corrections: [
            'Minor terminology error in second point',
          ],
          missing: [
            'Did not mention the practical applications',
          ],
        },
      };

      // Add session to store
      await addSession(topicId, mockSession);

      setStatus('completed');

      // Navigate to result
      router.replace({
        pathname: `/${topicId}/result`,
        params: { sessionId: mockSession.id },
      });
    } catch (err) {
      console.error('Error submitting recording:', err);
      setError(t('session.errors.submitFailed'));
      setStatus('error');
    }
  }, [topicId, audioUri, addSession, router, t]);

  // Cancel session
  const handleCancel = useCallback(() => {
    Alert.alert(
      t('session.cancel.title'),
      t('session.cancel.message'),
      [
        {
          text: t('common.no'),
          style: 'cancel',
        },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            if (recordingRef.current) {
              recordingRef.current.stopAndUnloadAsync().catch(console.error);
            }
            router.back();
          },
        },
      ]
    );
  }, [router, t]);

  // Go back
  const handleGoBack = useCallback(() => {
    if (status === 'recording' || status === 'paused') {
      handleCancel();
    } else {
      router.back();
    }
  }, [status, handleCancel, router]);

  return {
    // State
    status,
    recordingDuration,
    formattedDuration,
    error,
    topic: currentTopic,

    // Actions
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleSubmit,
    handleCancel,
    handleGoBack,
  };
}
