/**
 * @file useNotificationStore.ts
 * @description Zustand store for notification preferences.
 *
 * Persists user choices in AsyncStorage and (re-)schedules
 * local notifications via NotificationService.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '@/shared/services/NotificationService';

const STORAGE_KEY = '@knowit_notification_prefs';

interface NotificationPrefs {
    eveningReminderEnabled: boolean;
    flashcardReminderEnabled: boolean;
    eveningReminderTime: string; // "HH:MM"
    flashcardReminderTime: string; // "HH:MM"
}

interface NotificationState extends NotificationPrefs {
    permissionGranted: boolean;
    isInitialized: boolean;

    /** Load saved prefs + re-schedule active notifications. */
    initialize: () => Promise<void>;

    /** Toggle evening reminder on/off. Requests permission if needed. */
    toggleEveningReminder: (enabled: boolean) => Promise<void>;

    /** Toggle flashcard reminder on/off. Requests permission if needed. */
    toggleFlashcardReminder: (enabled: boolean) => Promise<void>;

    /** Update evening reminder time ("HH:MM") and re-schedule. */
    setEveningReminderTime: (time: string) => Promise<void>;

    /** Update flashcard reminder time ("HH:MM") and re-schedule. */
    setFlashcardReminderTime: (time: string) => Promise<void>;

    /** Cancel all notifications and reset state (e.g. on logout). */
    reset: () => Promise<void>;
}

const DEFAULTS: NotificationPrefs = {
    eveningReminderEnabled: false,
    flashcardReminderEnabled: false,
    eveningReminderTime: '20:00',
    flashcardReminderTime: '10:00',
};

/** Extract persistable preferences from state. */
function getPrefs(state: NotificationState): NotificationPrefs {
    return {
        eveningReminderEnabled: state.eveningReminderEnabled,
        flashcardReminderEnabled: state.flashcardReminderEnabled,
        eveningReminderTime: state.eveningReminderTime,
        flashcardReminderTime: state.flashcardReminderTime,
    };
}

/** Persist preferences to AsyncStorage. */
async function persist(prefs: NotificationPrefs): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/**
 * Ensure notification permission is granted.
 * Returns true if permission was already/just granted.
 */
async function ensurePermission(
    set: (partial: Partial<NotificationState>) => void,
    get: () => NotificationState,
): Promise<boolean> {
    if (get().permissionGranted) return true;

    const granted = await NotificationService.requestPermission();
    set({ permissionGranted: granted });
    return granted;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    ...DEFAULTS,
    permissionGranted: false,
    isInitialized: false,

    async initialize() {
        try {
            // Initialize the notification handler / channel
            await NotificationService.initialize();

            // Check current permission
            const permissionGranted = await NotificationService.getPermissionStatus();

            // Load saved prefs
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const saved: NotificationPrefs = raw ? JSON.parse(raw) : DEFAULTS;

            set({ ...saved, permissionGranted, isInitialized: true });

            // Re-schedule if enabled and permission granted
            if (permissionGranted) {
                if (saved.eveningReminderEnabled) {
                    await NotificationService.scheduleEveningReminder(saved.eveningReminderTime);
                }
                if (saved.flashcardReminderEnabled) {
                    await NotificationService.scheduleFlashcardReminder(saved.flashcardReminderTime);
                }
            }
        } catch (err) {
            console.warn('[NotificationStore] initialize error:', err);
            set({ isInitialized: true });
        }
    },

    async toggleEveningReminder(enabled: boolean) {
        if (enabled) {
            const granted = await ensurePermission(set, get);
            if (!granted) return; // Switch won't flip — UI stays off
            await NotificationService.scheduleEveningReminder(get().eveningReminderTime);
        } else {
            await NotificationService.cancelEveningReminder();
        }

        set({ eveningReminderEnabled: enabled });
        await persist(getPrefs(get()));
    },

    async toggleFlashcardReminder(enabled: boolean) {
        if (enabled) {
            const granted = await ensurePermission(set, get);
            if (!granted) return;
            await NotificationService.scheduleFlashcardReminder(get().flashcardReminderTime);
        } else {
            await NotificationService.cancelFlashcardReminder();
        }

        set({ flashcardReminderEnabled: enabled });
        await persist(getPrefs(get()));
    },

    async setEveningReminderTime(time: string) {
        set({ eveningReminderTime: time });
        const s = get();
        if (s.eveningReminderEnabled && s.permissionGranted) {
            await NotificationService.scheduleEveningReminder(time);
        }
        await persist(getPrefs(get()));
    },

    async setFlashcardReminderTime(time: string) {
        set({ flashcardReminderTime: time });
        const s = get();
        if (s.flashcardReminderEnabled && s.permissionGranted) {
            await NotificationService.scheduleFlashcardReminder(time);
        }
        await persist(getPrefs(get()));
    },

    async reset() {
        await NotificationService.cancelAll();
        await AsyncStorage.removeItem(STORAGE_KEY);
        set({ ...DEFAULTS, permissionGranted: false });
    },
}));

// Selectors
export const selectEveningEnabled = (s: NotificationState) => s.eveningReminderEnabled;
export const selectFlashcardEnabled = (s: NotificationState) => s.flashcardReminderEnabled;
export const selectEveningTime = (s: NotificationState) => s.eveningReminderTime;
export const selectFlashcardTime = (s: NotificationState) => s.flashcardReminderTime;
