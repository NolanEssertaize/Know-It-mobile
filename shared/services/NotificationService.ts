/**
 * @file NotificationService.ts
 * @description Local push notification service using expo-notifications.
 *
 * Handles two notification types:
 * 1. Evening practice reminder — daily at user-chosen time (default 20:00)
 * 2. Flashcard review reminder — daily at user-chosen time (default 10:00)
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import i18n from '@/i18n';

// Notification identifiers (used for scheduling / cancellation)
const EVENING_REMINDER_ID = 'knowit-evening-reminder';
const FLASHCARD_REMINDER_ID = 'knowit-flashcard-reminder';

// Android channel
const CHANNEL_ID = 'knowit-reminders';

/**
 * Parse a "HH:MM" string into { hour, minute }.
 * Falls back to defaults on invalid input.
 */
function parseTime(time: string, defaultHour = 20): { hour: number; minute: number } {
    const parts = time.split(':');
    if (parts.length !== 2) return { hour: defaultHour, minute: 0 };

    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        return { hour: defaultHour, minute: 0 };
    }

    return { hour: h, minute: m };
}

export const NotificationService = {
    /**
     * One-time setup: configure notification handler + Android channel.
     */
    async initialize(): Promise<void> {
        // Configure foreground behaviour
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });

        // Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
                name: 'Learning Reminders',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4A90D9',
            });
        }
    },

    /**
     * Request notification permissions from the user.
     * Returns true if granted.
     */
    async requestPermission(): Promise<boolean> {
        if (!Device.isDevice) {
            console.warn('[NotificationService] Must use physical device for notifications');
            return false;
        }

        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;

        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    },

    /**
     * Check current permission status without prompting.
     */
    async getPermissionStatus(): Promise<boolean> {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    },

    /**
     * Schedule the evening practice reminder.
     * Fires daily at the given time (default "20:00").
     */
    async scheduleEveningReminder(time: string = '20:00'): Promise<void> {
        // Cancel any existing one first
        await this.cancelEveningReminder();

        const { hour, minute } = parseTime(time);

        await Notifications.scheduleNotificationAsync({
            identifier: EVENING_REMINDER_ID,
            content: {
                title: i18n.t('notifications.eveningReminder.title'),
                body: i18n.t('notifications.eveningReminder.body'),
                ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
    },

    /**
     * Cancel the evening practice reminder.
     */
    async cancelEveningReminder(): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(EVENING_REMINDER_ID);
    },

    /**
     * Schedule the flashcard review reminder.
     * Fires daily at the given time (default "10:00").
     */
    async scheduleFlashcardReminder(time: string = '10:00'): Promise<void> {
        await this.cancelFlashcardReminder();

        const { hour, minute } = parseTime(time, 10);

        await Notifications.scheduleNotificationAsync({
            identifier: FLASHCARD_REMINDER_ID,
            content: {
                title: i18n.t('notifications.flashcardReview.title'),
                body: i18n.t('notifications.flashcardReview.body'),
                ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
    },

    /**
     * Cancel the flashcard review reminder.
     */
    async cancelFlashcardReminder(): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(FLASHCARD_REMINDER_ID);
    },

    /**
     * Cancel all scheduled notifications.
     */
    async cancelAll(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
} as const;
