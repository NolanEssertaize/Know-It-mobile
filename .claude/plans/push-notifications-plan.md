# Push Notifications Implementation Plan

## Requirements Restatement

1. **Evening Practice Reminder** — When a user has learned something during the day, send a notification at night: *"Learned anything today? Time to practice!"*
2. **Flashcard Review Reminder** — Notify when flashcards are due for review: *"New flashcards for review"*
3. **Themed Notifications** — Notification appearance should match the user's theme (light/dark)
4. **Branding** — Notification icon is a translucent "K" logo

---

## Current State

- **Expo SDK 54** managed workflow — must use `expo-notifications`
- **No notification library installed** yet
- **No backend notification endpoints** exist
- **Theme system** already supports light/dark with `useTheme()` hook
- **Flashcard due dates** available via `FlashcardsService.getDue()`
- **Session tracking** exists — can detect if user learned today

---

## Risks & Considerations

| Risk | Level | Mitigation |
|------|-------|------------|
| iOS requires APNs certificate via EAS | MEDIUM | Configure once in EAS dashboard |
| Android FCM key needed | LOW | Auto-configured by Expo |
| Theme matching in OS notifications is limited (OS controls notification shade) | MEDIUM | Use notification categories with custom colors; use themed in-app notification handling |
| Backend scheduling for evening reminders | MEDIUM | Backend cron job or use `expo-notifications` local scheduling on-device |
| User must grant notification permission | LOW | Prompt at logical moment (after first session) |

**Important note on "themed notifications":** OS-level push notifications have limited theming — the OS controls the notification shade. We can:
- Set notification **icon color** (Android accent color) based on theme
- Use **local notifications** (scheduled on-device) which allows more control
- Handle **foreground notifications** with themed in-app banners

For the two requested notifications, **local scheduled notifications** are the best approach since they're time-based and don't require server push.

---

## Implementation Plan

### Phase 1: Install & Configure `expo-notifications`

**Files to modify:**
- `package.json` — add `expo-notifications`, `expo-device`
- `app.json` — add notification permissions and icon config

**Steps:**
1. Install `expo-notifications` and `expo-device`
2. Update `app.json`:
   - Add Android notification icon (translucent K)
   - Add Android notification color (theme-aware)
   - Add iOS notification permission usage description
   - Add `expo-notifications` plugin config
3. Create notification icon assets:
   - `assets/notification-icon.png` — 96x96 monochrome translucent K (Android)
   - iOS uses the app icon by default

---

### Phase 2: Create NotificationService

**Files to create:**
- `shared/services/NotificationService.ts`

**Service methods:**
```
NotificationService = {
  initialize()           — Request permissions, set up channels
  requestPermission()    — Ask user for notification permission
  scheduleEveningReminder(enabled: boolean) — Schedule/cancel nightly reminder
  scheduleFlashcardReview(enabled: boolean) — Schedule/cancel flashcard check
  cancelAll()            — Cancel all scheduled notifications
  getPermissionStatus()  — Check current permission state
} as const
```

**Implementation details:**
- Use `expo-notifications` **local scheduled notifications** (no backend needed for these two use cases)
- Create Android notification channel: `knowit-reminders` with user's theme color
- Evening reminder: Schedule daily trigger at 20:00 (8 PM) local time
  - Only send if user had a session today → use a **daily background check** or simpler: always schedule, let the notification text encourage practice regardless
  - Simpler approach: Schedule it always at 8 PM, the message works either way ("Time to practice!")
- Flashcard review: Schedule daily trigger at 10:00 (10 AM) local time
  - Message: "New flashcards for review"

---

### Phase 3: Create NotificationStore (Zustand)

**Files to create:**
- `store/useNotificationStore.ts`

**State:**
```typescript
{
  permissionGranted: boolean
  eveningReminderEnabled: boolean
  flashcardReminderEnabled: boolean
  eveningReminderTime: string  // "20:00" default
  flashcardReminderTime: string // "10:00" default

  // Actions
  initialize(): void
  toggleEveningReminder(enabled: boolean): void
  toggleFlashcardReminder(enabled: boolean): void
  setEveningReminderTime(time: string): void
  setFlashcardReminderTime(time: string): void
}
```

- Persist preferences with `AsyncStorage` (key: `@knowit_notification_prefs`)
- On toggle → call `NotificationService.scheduleEveningReminder()` / `scheduleFlashcardReview()`

---

### Phase 4: Theme-Aware Notification Configuration

**Files to modify:**
- `shared/services/NotificationService.ts`

**How theming works for notifications:**
1. **Android notification channel color** — Set accent color from theme (`colors.semantic.info` or primary color)
2. **Android notification icon** — Monochrome translucent K (system requirement: must be white/transparent)
3. **Foreground notification handling** — When app is open, show a themed in-app banner instead of OS notification
4. **Notification content** — Use i18n strings so both EN and FR are supported

**Android channel setup:**
```typescript
Notifications.setNotificationChannelAsync('reminders', {
  name: 'Learning Reminders',
  importance: Notifications.AndroidImportance.DEFAULT,
  lightColor: themeColor, // from user's theme
  vibrationPattern: [0, 250, 250, 250],
});
```

---

### Phase 5: Integrate into App Lifecycle

**Files to modify:**
- `app/_layout.tsx` — Initialize notifications after auth
- `features/profile/screens/ProfileScreen.tsx` — Add notification settings toggle

**App startup flow:**
1. After user authenticates → `NotificationStore.initialize()`
2. If first launch → prompt for notification permission (contextually, after first session)
3. Load saved preferences from AsyncStorage
4. Re-schedule notifications based on preferences

**Profile screen additions:**
- Toggle: "Evening practice reminder" (on/off)
- Toggle: "Flashcard review reminder" (on/off)
- Time pickers for each (optional, default 8 PM / 10 AM)

---

### Phase 6: i18n Strings

**Files to modify:**
- `i18n/locales/en.json`
- `i18n/locales/fr.json`

**New strings:**
```json
{
  "notifications": {
    "eveningReminder": {
      "title": "Time to practice!",
      "body": "Learned anything today? Review what you know."
    },
    "flashcardReview": {
      "title": "Flashcards ready",
      "body": "You have new flashcards waiting for review."
    },
    "settings": {
      "title": "Notifications",
      "eveningReminder": "Evening practice reminder",
      "flashcardReminder": "Flashcard review reminder",
      "reminderTime": "Reminder time"
    }
  }
}
```

---

## Phase Summary

| Phase | What | New Files | Modified Files |
|-------|------|-----------|----------------|
| 1 | Install & config | notification icon assets | `package.json`, `app.json` |
| 2 | NotificationService | `shared/services/NotificationService.ts` | — |
| 3 | NotificationStore | `store/useNotificationStore.ts` | — |
| 4 | Theme-aware config | — | `NotificationService.ts` |
| 5 | App integration | — | `app/_layout.tsx`, `ProfileScreen.tsx` |
| 6 | i18n | — | `en.json`, `fr.json` |

## Complexity: LOW-MEDIUM

This is a **local notifications** implementation (no backend push server needed). The two notification types are simple scheduled reminders, which `expo-notifications` handles well with on-device scheduling.

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes / no / modify)
