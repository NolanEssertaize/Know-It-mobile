# Implementation Plan: Google Authentication (Expo Go Frontend)

## Requirements Restatement

Add Google Sign-In to the KnowIt Expo app. The backend already exposes `POST /api/v1/auth/google/token` which accepts a Google `id_token` and returns a `{ user, tokens }` response (same `AuthResponse` type as login/register). The UI already has a Google button on the LoginScreen (line 160-165) — it just needs to be wired up.

## Current State Analysis

**What already exists:**
- `AuthService` (`shared/services/AuthService.ts`) — handles login, register, refresh, logout via `api.*` methods
- `useAuthStore` (`store/useAuthStore.ts`) — Zustand store with `login`, `register`, `logout`, `initialize` actions
- `useAuth` hook (`features/auth/hooks/useAuth.ts`) — MVVM ViewModel for auth screens
- `SecureTokenManager` (`shared/api/SecureStorage.ts`) — token storage with SecureStore/AsyncStorage fallback
- `API_ENDPOINTS.AUTH` in `config.ts` — already has REGISTER, LOGIN, REFRESH, ME, etc.
- `AuthResponse` type in `types.ts` — `{ user: UserRead, tokens: Token }` (matches the Google endpoint response)
- `AuthProvider` type already includes `'google'`
- Google button already rendered in `LoginScreen.tsx` (lines 159-166) — currently non-functional
- i18n key `auth.login.signInWithGoogle` already exists ("Continue with Google")

**What's missing:**
- `expo-auth-session`, `expo-crypto`, `expo-web-browser` packages
- Google OAuth endpoint in `API_ENDPOINTS`
- `googleLogin` method in `AuthService`
- `googleLogin` action in `useAuthStore`
- `useGoogleAuth` hook or integration in `useAuth`
- Wiring the Google button's `onPress` in LoginScreen

## Implementation Phases

### Phase 1: Install Dependencies
- Run `npx expo install expo-auth-session expo-crypto expo-web-browser`

**Complexity:** Low

### Phase 2: Add API Endpoint
**File:** `shared/api/config.ts`

- Add `GOOGLE_TOKEN: \`${API_VERSION}/auth/google/token\`` to `API_ENDPOINTS.AUTH`

**Complexity:** Low

### Phase 3: Add `googleLogin` to AuthService
**File:** `shared/services/AuthService.ts`

- Add a `googleLogin(idToken: string): Promise<AuthResponse>` method
- It calls `api.post<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE_TOKEN, { id_token: idToken }, false)` (unauthenticated)
- Stores tokens and user via `SecureTokenManager` (same pattern as `login`/`register`)

**Complexity:** Low

### Phase 4: Add `googleLogin` Action to Auth Store
**File:** `store/useAuthStore.ts`

- Add `googleLogin: (idToken: string) => Promise<void>` to `AuthActions` interface
- Implementation follows the same pattern as `login`/`register`: set loading, call `AuthService.googleLogin`, set user + isAuthenticated, handle errors

**Complexity:** Low

### Phase 5: Create `useGoogleAuth` Hook
**File:** `features/auth/hooks/useGoogleAuth.ts` (new file)

- Uses `expo-auth-session/providers/google` with `Google.useIdTokenAuthRequest`
- Takes a `GOOGLE_WEB_CLIENT_ID` (from env variable `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`)
- Calls `WebBrowser.maybeCompleteAuthSession()` at module level
- Returns `{ request, response, promptAsync, handleGoogleSignIn }` where `handleGoogleSignIn` extracts the `id_token` from the response and calls `useAuthStore.googleLogin(idToken)`
- Returns `AuthResult` (`{ success, error? }`) matching existing pattern

**Complexity:** Medium

### Phase 6: Wire Up LoginScreen
**File:** `features/auth/screens/LoginScreen.tsx`

- Import and use `useGoogleAuth` hook
- Set the Google button's `onPress` to call `promptAsync()`
- Add a `useEffect` watching `response` to trigger `handleGoogleSignIn` → on success, `router.replace('/')`
- Disable the button when `!request` (not ready) or `isLoading`

**Complexity:** Low

### Phase 7: Add i18n Keys for Error States
**Files:** `i18n/locales/en.json`, `i18n/locales/fr.json`

- Add `auth.login.googleSignInFailed`: "Google sign-in failed. Please try again." / "La connexion Google a echoue. Veuillez reessayer."
- Add `auth.login.googleSignInCancelled`: "Google sign-in was cancelled." / "La connexion Google a ete annulee."

**Complexity:** Low

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `shared/api/config.ts` | Edit | Add `GOOGLE_TOKEN` endpoint |
| `shared/services/AuthService.ts` | Edit | Add `googleLogin` method |
| `store/useAuthStore.ts` | Edit | Add `googleLogin` action |
| `features/auth/hooks/useGoogleAuth.ts` | **New** | Google auth hook with `expo-auth-session` |
| `features/auth/screens/LoginScreen.tsx` | Edit | Wire Google button to `useGoogleAuth` |
| `i18n/locales/en.json` | Edit | Add Google-specific error strings |
| `i18n/locales/fr.json` | Edit | Add Google-specific error strings |

## Risks

- **MEDIUM: Expo Go compatibility** — `expo-auth-session` works in Expo Go but requires the correct redirect URI (`https://auth.expo.io/@username/KnowIt`). The user needs a valid Google Cloud OAuth Web Client ID configured.
- **LOW: Environment variable** — The `GOOGLE_WEB_CLIENT_ID` needs to be set via `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`. If missing, the Google button should be hidden or disabled gracefully.
- **LOW: app.json plugins** — `expo-auth-session` may need to be added to the plugins array. Will verify during install.

## Estimated Complexity: LOW-MEDIUM
7 files touched (1 new), straightforward integration following existing patterns.
