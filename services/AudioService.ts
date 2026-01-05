import { Audio } from 'expo-av';

export class AudioService {
    private recording: Audio.Recording | null = null;

    async requestPermissions(): Promise<boolean> {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
    }

    async startRecording(): Promise<void> {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            this.recording = recording;
        } catch (err) {
            console.error('Failed to start recording', err);
            throw err;
        }
    }

    async stopRecording(): Promise<string | null> {
        if (!this.recording) return null;

        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.recording = null;
        return uri; // Retourne le chemin du fichier local
    }
}