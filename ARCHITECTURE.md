# KnowIt Architecture Documentation

This document provides a comprehensive overview of the KnowIt mobile application architecture, design patterns, and implementation details.

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Navigation](#navigation)
4. [State Management](#state-management)
5. [Internationalization](#internationalization)
6. [Theme System](#theme-system)
7. [Critical Patterns](#critical-patterns)
8. [Feature Modules](#feature-modules)
9. [API Integration](#api-integration)

---

## Overview

KnowIt is built using a feature-based architecture with clear separation of concerns:

- **Expo Router** for file-based navigation
- **Zustand** for global state management
- **i18next** for internationalization
- **Custom Theme Provider** for theming

---

## Folder Structure

```
knowit/
├── app/                    # Navigation routes (Expo Router)
├── features/               # Feature modules
│   ├── auth/
│   ├── topics/
│   ├── topic-detail/
│   ├── session/
│   ├── result/
│   └── profile/
├── shared/                 # Shared code
│   ├── api/               # API client and types
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared hooks
│   └── utils/             # Utility functions
├── store/                  # Zustand stores
├── theme/                  # Theme configuration
├── i18n/                   # Internationalization
└── types/                  # Global TypeScript types
```

### Feature Module Structure

Each feature follows a consistent structure:

```
features/[feature-name]/
├── components/            # Feature-specific components
│   └── ComponentName/
│       └── index.tsx
├── hooks/                 # Feature-specific hooks
│   └── useFeature.ts
├── screens/               # Screen components
│   └── FeatureScreen.tsx
└── index.ts               # Public exports
```

---

## Navigation

### Expo Router Configuration

The app uses Expo Router v6 with file-based routing:

```
app/
├── _layout.tsx            # Root layout (providers)
├── index.tsx              # Home route (/)
├── profile.tsx            # Profile route (/profile)
├── (auth)/               # Auth group
│   ├── _layout.tsx       # Auth layout
│   ├── login.tsx         # /auth/login
│   └── register.tsx      # /auth/register
└── [topicId]/            # Dynamic routes
    ├── index.tsx         # /[topicId]
    ├── session.tsx       # /[topicId]/session
    └── result.tsx        # /[topicId]/result
```

### Navigation Patterns

```typescript
// Navigate to topic detail
router.push(`/${topicId}`);

// Navigate to session (push)
router.push(`/${topicId}/session`);

// Navigate to result (replace to prevent back to session)
router.replace({
  pathname: `/${topicId}/result`,
  params: { sessionId }
});

// Go back
router.back();

// Replace current route
router.replace('/');
```

### Root Layout Setup

The root `_layout.tsx` must:
1. Import i18n configuration FIRST
2. Wrap with necessary providers

```typescript
// CRITICAL: Import i18n FIRST
import '@/i18n';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="[topicId]" />
            <Stack.Screen name="profile" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## State Management

### Zustand Store Architecture

The app uses two main stores:

1. **useStore** - Main app state (topics, sessions)
2. **useAuthStore** - Authentication state

### Main Store (useStore)

```typescript
interface StoreState {
  // Data
  topics: Topic[];
  currentTopic: Topic | null;
  isLoading: LoadingState;
  error: string | null;

  // Actions
  loadTopics: () => Promise<void>;
  addTopic: (title: string) => Promise<void>;
  updateTopicTitle: (id: string, title: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  loadTopicDetail: (id: string) => Promise<void>;
  addSession: (topicId: string, session: Session) => Promise<void>;
  deleteSession: (topicId: string, sessionId: string) => Promise<void>;
}
```

### Selectors

Use selectors to optimize re-renders:

```typescript
// Define selectors
export const selectTopics = (state: StoreState) => state.topics;
export const selectCurrentTopic = (state: StoreState) => state.currentTopic;
export const selectIsLoading = (state: StoreState) => state.isLoading;

// Use in components
const topics = useStore(selectTopics);
const currentTopic = useStore(selectCurrentTopic);
```

### Persistence

Data is persisted to AsyncStorage:

```typescript
const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: '@knowit/topics',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        topics: state.topics,
      }),
    }
  )
);
```

---

## Internationalization

### Configuration

i18n is configured in `i18n/i18n.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // CRITICAL for React Native
  },
});
```

### Language Detection Plugin

Custom plugin persists language choice:

```typescript
const languageDetectorPlugin = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async (callback: (lng: string) => void) => {
    const storedLang = await AsyncStorage.getItem('@knowit/language');
    callback(storedLang || 'en');
  },
  cacheUserLanguage: async (lng: string) => {
    await AsyncStorage.setItem('@knowit/language', lng);
  },
};
```

### useLanguage Hook

```typescript
export function useLanguage() {
  const { i18n } = useTranslation();
  
  const changeLanguage = useCallback(async (code: string) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('@knowit/language', code);
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    availableLanguages: LANGUAGES,
  };
}
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  
  return (
    <>
      <Text>{t('common.loading')}</Text>
      {/* Pluralization */}
      <Text>{t('dates.daysAgo', { count: days })}</Text>
      {/* Interpolation */}
      <Text>{t('topics.sessionsCount', { count: 5 })}</Text>
    </>
  );
}
```

---

## Theme System

### Theme Provider

```typescript
interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  
  const isDark = mode === 'system' 
    ? systemColorScheme === 'dark' 
    : mode === 'dark';
    
  const colors = isDark ? darkColors : lightColors;
  
  // ...persistence logic
  
  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Theme Colors Structure

```typescript
interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  
  background: {
    primary: string;
    secondary: string;
    gradient: string[];
  };
  
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  
  glass: {
    background: string;
    border: string;
    elevated: string;
    subtle: string;
  };
  
  // ...more colors
}
```

---

## Critical Patterns

### No Auto-Refresh Pattern

**Problem**: React effects run on every render, causing data to reload unnecessarily.

**Solution**: Use refs to track load state:

```typescript
function useTopicsList() {
  const hasLoadedRef = useRef(false);
  const loadTopics = useStore((state) => state.loadTopics);
  
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - load ONCE
}
```

### Topic Detail Load Pattern

**Problem**: Topic detail should reload when navigating to a different topic.

**Solution**: Track the loaded topic ID:

```typescript
function useTopicDetail() {
  const loadedTopicIdRef = useRef<string | null>(null);
  const { topicId } = useLocalSearchParams();
  const loadTopicDetail = useStore((state) => state.loadTopicDetail);
  
  useEffect(() => {
    if (topicId && topicId !== loadedTopicIdRef.current) {
      loadedTopicIdRef.current = topicId;
      loadTopicDetail(topicId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]); // Only topicId in deps
}
```

### Swipeable Refs Management

For managing swipeable row refs (close other rows when one opens):

```typescript
const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

const registerSwipeableRef = useCallback((id: string, ref: SwipeableMethods | null) => {
  if (ref) {
    swipeableRefs.current.set(id, ref);
  } else {
    swipeableRefs.current.delete(id);
  }
}, []);

const closeOtherSwipeables = useCallback((exceptId: string) => {
  swipeableRefs.current.forEach((ref, id) => {
    if (id !== exceptId) {
      ref.close();
    }
  });
}, []);
```

---

## Feature Modules

### Topics Feature

- **useTopicsList**: Main hook with search, filtering, stats
- **TopicCard**: Swipeable card with actions
- **CategoryFilter**: Filter chips
- **AddTopicModal**: Create new topic modal
- **TopicsListScreen**: Main screen

### Topic Detail Feature

- **useTopicDetail**: Load and manage single topic
- **SessionHistoryCard**: Session history item
- **TopicDetailScreen**: Topic view with sessions

### Session Feature

- **useSessionWithAudio**: Audio recording logic
- **SessionScreen**: Recording UI with timer

### Result Feature

- **useResult**: Load session result
- **ScoreGauge**: Animated circular score
- **AnalysisCard**: Collapsible analysis section
- **ResultScreen**: Full result display

### Profile Feature

- **useProfile**: User stats and preferences
- **LanguageSwitcher**: Language selection UI
- **ProfileScreen**: User profile and settings

---

## API Integration

### API Client

```typescript
// shared/api/client.ts
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, data?: unknown) => apiRequest<T>(endpoint, 'POST', data),
  put: <T>(endpoint: string, data?: unknown) => apiRequest<T>(endpoint, 'PUT', data),
  patch: <T>(endpoint: string, data?: unknown) => apiRequest<T>(endpoint, 'PATCH', data),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, 'DELETE'),
};
```

### Secure Storage

For sensitive data (auth tokens):

```typescript
import * as SecureStore from 'expo-secure-store';

export const SecureStorage = {
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  get: (key: string) => SecureStore.getItemAsync(key),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
  setObject: <T>(key: string, value: T) => 
    SecureStore.setItemAsync(key, JSON.stringify(value)),
  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  },
};
```

---

## Best Practices

1. **Always import i18n in root layout first**
2. **Use refs to prevent unnecessary data reloads**
3. **Use selectors for Zustand to prevent re-renders**
4. **Keep feature modules self-contained**
5. **Use TypeScript strictly**
6. **Persist user preferences (theme, language)**
7. **Use SecureStore for sensitive data**
8. **Follow the glassmorphism design system**

---

## Performance Considerations

1. **Memoize expensive calculations** with `useMemo`
2. **Memoize callbacks** with `useCallback`
3. **Use `memo()` for pure components**
4. **Lazy load features** when possible
5. **Debounce search input** (300ms recommended)
6. **Use FlatList** for long lists with `keyExtractor`
