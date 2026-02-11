---
name: knowit-patterns
description: Coding patterns extracted from KnowIt React Native repository
version: 1.0.0
source: local-git-analysis
analyzed_commits: 50
---

# KnowIt Project Patterns

## Commit Conventions

This project uses **informal, descriptive commit messages** — no strict conventional commit format.
Common patterns observed:
- `Fix <component/feature>` — Bug fixes (most frequent)
- `Add <feature>` — New features
- `Implement <feature>` — Larger feature additions
- `Fixed <issue>` — Past tense also used
- Merge commits via PRs from feature branches (e.g., `feature/i18n-integration`, `feature/deck-management`)

## Code Architecture

```
app/                          # Expo Router file-based routing
├── (auth)/                   # Auth group (login, register)
├── (tabs)/                   # Tab navigation (index, flashcards)
├── [topicId]/                # Dynamic routes
├── _layout.tsx               # Root layout
└── *.tsx                     # Standalone screens

features/                     # Feature modules (MVVM pattern)
├── <feature>/
│   ├── components/           # Feature-specific components
│   │   └── ComponentName/    # Folder-per-component with index.ts barrel
│   ├── hooks/                # Custom hooks (use*.ts)
│   ├── screens/              # Screen components (*Screen.tsx)
│   ├── types/                # Feature-specific types
│   └── index.ts              # Feature barrel export

shared/                       # Shared code
├── api/                      # API client, config, types
│   ├── client.ts             # HTTP client with auth & retry
│   ├── config.ts             # Base URL, endpoints, timeouts
│   ├── types.ts              # Shared API types
│   └── types/                # Domain-specific type files
├── components/               # Shared UI components (GlassView, ScreenWrapper)
├── hooks/                    # Shared hooks
├── services/                 # Business logic services
└── utils/                    # Utility functions

store/                        # Zustand global state stores
├── useAuthStore.ts
├── useStore.ts
└── useSubscriptionStore.ts

i18n/                         # Internationalization
├── locales/en.json
├── locales/fr.json
└── i18n.ts

theme/                        # Theme system (dark/light)
├── colors.ts
└── theme.ts
```

## Key Patterns

### Services Pattern
Services are plain objects with `as const`, not classes. They import from `@/shared/api` and return typed responses.

```typescript
// shared/services/ExampleService.ts
import { api, API_ENDPOINTS } from '@/shared/api';
import type { RequestType, ResponseType } from '@/shared/api';

export const ExampleService = {
  async methodName(param: string): Promise<ResponseType> {
    return api.post<ResponseType>(API_ENDPOINTS.RESOURCE.ACTION, { param });
  },
} as const;
```

### API Client Pattern
The API client (`shared/api/client.ts`) provides convenience methods: `api.get`, `api.post`, `api.patch`, `api.put`, `api.delete`. Features automatic token refresh, retry with exponential backoff, and secure token storage via `expo-secure-store`.

### Hooks Pattern (MVVM ViewModel)
Custom hooks act as ViewModels. They call services, manage local state, and return data + actions for screens.

```typescript
// features/<feature>/hooks/use<Feature>.ts
export function useFeature() {
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => { /* ... */ }, []);

  return { data, loading, fetchData };
}
```

### Component Folder Pattern
Components use folder-per-component with an `index.ts` barrel file:
```
ComponentName/
├── ComponentName.tsx
└── index.ts          # export { default } from './ComponentName'
```

### Screen Pattern
Screens are in `features/<feature>/screens/<Name>Screen.tsx`. They consume hooks and render UI. Styling is typically inline with `StyleSheet.create` at the bottom, or occasionally in separate `.styles.ts` files.

### Store Pattern (Zustand)
Global state uses Zustand stores in `store/` directory:
```typescript
export const useExampleStore = create<ExampleState>((set) => ({
  value: initialValue,
  setValue: (v) => set({ value: v }),
}));
```

### Theme Pattern
`useTheme()` hook returns `{ colors, isDark }`. The `colors` object provides themed color values. `colors.surface.glass` is widely used for glassmorphism effects.

### i18n Pattern
`react-i18next` with `useTranslation()` hook. Translation keys are organized by feature in `en.json` and `fr.json`.

## File Co-change Patterns

Files that frequently change together:
- `i18n/locales/en.json` + `i18n/locales/fr.json` — always updated in pairs
- `shared/api/config.ts` + `shared/api/index.ts` + `shared/api/types.ts` — API layer changes
- `features/*/hooks/*.ts` + `features/*/screens/*Screen.tsx` — hook changes trigger screen updates
- `package.json` + `package-lock.json` — dependency changes
- `store/useStore.ts` + feature screens — state shape changes propagate

## Workflows

### Adding a New Feature Module
1. Create `features/<feature>/` directory
2. Add `screens/<Name>Screen.tsx`
3. Add `hooks/use<Feature>.ts`
4. Add `components/` as needed (folder-per-component)
5. Create `index.ts` barrel export
6. Add route in `app/` (Expo Router)
7. Add translations to `en.json` and `fr.json`

### Adding a New Service
1. Create `shared/services/<Name>Service.ts`
2. Add API types to `shared/api/types.ts` or `shared/api/types/<domain>.ts`
3. Add endpoints to `shared/api/config.ts`
4. Export from `shared/services/index.ts`

### Adding a New Screen
1. Create screen component in `features/<feature>/screens/`
2. Create or update hook in `features/<feature>/hooks/`
3. Add Expo Router route in `app/`
4. Add i18n translations

## Technology Stack

- **Framework**: React Native with Expo (Expo Router for navigation)
- **State**: Zustand (global), React hooks (local)
- **Styling**: React Native StyleSheet, expo-blur, expo-linear-gradient
- **Auth**: Custom API with secure token storage (expo-secure-store)
- **i18n**: react-i18next (English + French)
- **IAP**: react-native-iap v14 (Nitro Modules)
- **Graphics**: @shopify/react-native-skia
- **Icons**: lucide-react-native
- **IDs**: uuid
- **TypeScript**: Strict typing with path aliases (@/)

## Branch Strategy

- `main` — stable branch, PRs merged into it
- `feature/<name>` — feature branches (e.g., `feature/i18n-integration`, `feature/deck-management`)
