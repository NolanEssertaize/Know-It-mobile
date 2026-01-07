/**
 * @file RecordingService.ts
 * @description Service d'enregistrement audio
 */

// import { Audio } from 'expo-av';

/**
 * État interne du service
 */
let recording: unknown = null;

export const RecordingService = {
  /**
   * Démarre un enregistrement audio
   */
  async startRecording(): Promise<void> {
    try {
      console.log('[RecordingService] Starting recording...');
      // TODO: Implémenter avec expo-av
      // const { status } = await Audio.requestPermissionsAsync();
      // if (status !== 'granted') throw new Error('Permission denied');
      // await Audio.setAudioModeAsync({
      //   allowsRecordingIOS: true,
      //   playsInSilentModeIOS: true,
      // });
      // const { recording: newRecording } = await Audio.Recording.createAsync(
      //   Audio.RecordingOptionsPresets.HIGH_QUALITY
      // );
      // recording = newRecording;
    } catch (error) {
      console.error('[RecordingService] Start Error:', error);
      throw error;
    }
  },

  /**
   * Arrête l'enregistrement et retourne l'URI du fichier
   */
  async stopRecording(): Promise<string> {
    try {
      console.log('[RecordingService] Stopping recording...');
      // TODO: Implémenter avec expo-av
      // if (!recording) throw new Error('No recording in progress');
      // await recording.stopAndUnloadAsync();
      // const uri = recording.getURI();
      // recording = null;
      // return uri ?? '';
      return 'mock://recording.m4a';
    } catch (error) {
      console.error('[RecordingService] Stop Error:', error);
      throw error;
    }
  },

  /**
   * Annule l'enregistrement en cours
   */
  async cancelRecording(): Promise<void> {
    try {
      console.log('[RecordingService] Cancelling recording...');
      // TODO: Implémenter avec expo-av
      // if (recording) {
      //   await recording.stopAndUnloadAsync();
      //   recording = null;
      // }
      recording = null;
    } catch (error) {
      console.error('[RecordingService] Cancel Error:', error);
    }
  },

  /**
   * Vérifie si un enregistrement est en cours
   */
  isRecording(): boolean {
    return recording !== null;
  },
} as const;
