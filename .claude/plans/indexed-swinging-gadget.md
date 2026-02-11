# Fix: `platform` mismatch causing 500 on `/subscriptions/verify`

## Context
The backend expects `platform` values `"apple" | "google"`, but the frontend sends `"ios" | "android"` (from `Platform.OS`). This likely causes backend validation to fail with a 500 error.

## Mismatch summary

All 3 call sites cast `Platform.OS as 'ios' | 'android'` and pass it directly. The backend rejects these values.

| Call site | What it sends |
|---|---|
| `usePaywall.ts:47` | `Platform.OS as 'ios' \| 'android'` |
| `usePaywall.ts:106` | `Platform.OS as 'ios' \| 'android'` |
| `ProfileScreen.tsx:524` | `Platform.OS as 'ios' \| 'android'` |

## Plan — 3 files to fix

### 1. `shared/api/types/subscription.ts` — Fix the type
- Line 28: `platform: 'ios' | 'android'` → `platform: 'apple' | 'google'`

### 2. `store/useSubscriptionStore.ts` — Fix the store action signature + add mapping
- Line 46: Change type `'ios' | 'android'` → `'apple' | 'google'`

### 3. `features/subscription/hooks/usePaywall.ts` — Map `Platform.OS` to backend values
- Add a helper: `const storePlatform = Platform.OS === 'ios' ? 'apple' : 'google'`
- Line 47: Replace `Platform.OS as 'ios' | 'android'` → `storePlatform`
- Line 106: Same replacement

### 4. `features/profile/screens/ProfileScreen.tsx` — Same mapping
- Line 524: Replace `Platform.OS as 'ios' | 'android'` → `Platform.OS === 'ios' ? 'apple' : 'google'`

## Verification
- Grep for any remaining `'ios' | 'android'` in subscription-related code
- The `/verify` endpoint should no longer return 500
