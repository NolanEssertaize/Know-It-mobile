# Implementation Plan: Forgot Password Flow

## Requirements Restatement

Build a 3-screen "Forgot Password" wizard (Email → OTP Code → New Password) with smooth horizontal slide transitions, spring-based animations, and a step progress indicator. The backend API is already built with 3 endpoints under `/api/v1/auth/`. The flow must carry email and reset_token through all screens, handle rate limits, token expiry, and match the existing design system.

## Risks & Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| OTP paste handling differs iOS vs Android | MEDIUM | Use `onChangeText` with string splitting, not `onKeyPress` |
| Animated API spring config on Android | LOW | Test with `useNativeDriver: true` where possible |
| Token expiry (10 min) mid-flow | MEDIUM | Show clear "expired" state with restart CTA |
| No `react-native-reanimated` in project | LOW | Use RN `Animated` API (already used in ProfileScreen) |
| Rate limit (429) not explicitly typed in API client | LOW | Check response status in catch block |

## Architecture Decision: Navigation Approach

**Two options:**
1. **3 Expo Router screens** (`forgot-password.tsx`, `verify-reset-code.tsx`, `reset-password.tsx`) — uses file-based routing with slide transitions already configured in `(auth)/_layout.tsx`
2. **1 screen with internal step state** — manages its own horizontal slide animation between 3 internal "views", with a shared `Animated.Value` for transitions

**Chosen: Option 2 — Single screen with internal wizard steps.** Rationale:
- Gives full control over shared slide animation and step indicator
- Email and reset_token stay in local state (no route params/serialization)
- Cohesive "wizard" feel vs. 3 separate pages
- Still uses a single route file: `app/(auth)/forgot-password.tsx`

---

## Implementation Phases

### Phase 1: API & Service Layer
**Files to modify:**

1. **`shared/api/config.ts`** — Add 3 new endpoints:
   ```
   FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password`
   VERIFY_RESET_CODE: `${API_VERSION}/auth/verify-reset-code`
   RESET_PASSWORD: `${API_VERSION}/auth/reset-password`
   ```

2. **`shared/services/AuthService.ts`** — Add 3 methods:
   - `forgotPassword(email: string)` → POST, no auth
   - `verifyResetCode(email: string, code: string)` → POST, no auth → returns `{ reset_token, expires_in }`
   - `resetPassword(resetToken: string, newPassword: string)` → POST, no auth

### Phase 2: i18n Keys
**Files to modify:** `i18n/locales/en.json`, `i18n/locales/fr.json`

Add under `auth.forgotPassword`:
- `title`, `subtitle`, `emailLabel`, `emailPlaceholder`, `sendCode`, `codeSent`, `rateLimited`
- `verifyTitle`, `verifySubtitle`, `codeSentTo`, `resendCode`, `resendIn`, `verifyCode`
- `invalidCode`, `attemptsRemaining`
- `resetTitle`, `resetSubtitle`, `newPassword`, `confirmPassword`, `resetButton`
- `requirements.minLength`, `requirements.uppercase`, `requirements.lowercase`, `requirements.digit`
- `passwordsMustMatch`, `resetSuccess`, `tokenExpired`, `restartFlow`
- `networkError`, `backToLogin`
- Step labels: `stepEmail`, `stepCode`, `stepPassword`

### Phase 3: Custom Hook — `useForgotPassword`
**New file:** `features/auth/hooks/useForgotPassword.ts`

Manages all 3 steps' state and API calls:

```typescript
interface UseForgotPasswordReturn {
  // Step management
  step: 0 | 1 | 2;
  goToStep: (step: number) => void;

  // Step 1: Email
  email: string;
  setEmail: (email: string) => void;
  sendCode: () => Promise<void>;

  // Step 2: OTP
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  resendCooldown: number; // seconds remaining
  attemptsRemaining: number | null;

  // Step 3: Reset
  resetPassword: (password: string) => Promise<void>;

  // Shared
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isSuccess: boolean; // final success state
}
```

Key logic:
- `sendCode()` calls `AuthService.forgotPassword`, on success sets `step = 1`
- `verifyCode(code)` calls `AuthService.verifyResetCode`, stores `resetToken` internally, sets `step = 2`
- `resetPassword(password)` calls `AuthService.resetPassword` with stored token, sets `isSuccess = true`
- Resend cooldown uses `useEffect` + `setInterval` countdown from 60
- Error handling maps API error codes: `INVALID_RESET_CODE` (show attempts), `INVALID_RESET_TOKEN` (show restart)
- Catches 429 status for rate limit messaging

### Phase 4: UI Components (within the screen file)
**New file:** `features/auth/screens/ForgotPasswordScreen.tsx`

Subcomponents (defined in same file or nearby):

1. **StepIndicator** — 3 dots/pills with animated active state
   - Uses `Animated.Value` for width/opacity transitions
   - Labels: Email → Code → Password

2. **Step1Email** — Email input + "Send Reset Code" button
   - Reuses `GlassInput` with `Mail` icon
   - Button matches LoginScreen style (56px, `colors.text.primary` bg)
   - Inline spinner on loading

3. **Step2OTP** — 6 OTP digit boxes
   - 6 `TextInput` refs in array, `maxLength={1}`, `keyboardType="number-pad"`
   - Auto-advance: `onChangeText` focuses next ref
   - Paste: detect string length > 1, distribute across boxes
   - Auto-submit: when all 6 filled, call `verifyCode`
   - Masked email display: `maskEmail(email)` → `n***@example.com`
   - "Resend" with countdown timer
   - Shake animation on error (using `Animated.sequence` of `Animated.timing` translations)
   - Scale-up animation on focus for each box

4. **Step3Reset** — New password + confirm + requirements
   - Two `GlassInput isPassword` fields
   - 4-line requirements checklist with animated checkmarks (green when met)
   - "Reset Password" button disabled until all requirements + match
   - Success overlay: animated checkmark (scale + opacity spring), auto-navigate to login after 2s

### Phase 5: Animations
All using React Native `Animated` API (no reanimated dependency needed):

1. **Horizontal slide transition** between steps:
   - `Animated.Value` for translateX
   - Forward: current view slides left, new view slides in from right
   - Back: current view slides right, new view slides in from left
   - Spring config: `useNativeDriver: true, tension: 50, friction: 8`

2. **Step indicator**: animated dot width (active dot wider) + opacity

3. **OTP box focus**: `Animated.spring` scale 1.0 → 1.05 on focus

4. **Shake animation**: `Animated.sequence([timing(-10), timing(10), timing(-6), timing(6), timing(0)])`

5. **Success checkmark**: `Animated.spring` scale 0 → 1 + opacity 0 → 1

6. **Toast/banner**: slide down from top with spring

### Phase 6: Route & Navigation Integration
**Files to modify:**

1. **`app/(auth)/_layout.tsx`** — Add `Stack.Screen` for `forgot-password`
2. **`app/(auth)/forgot-password.tsx`** — Thin route file importing `ForgotPasswordScreen`
3. **`features/auth/screens/LoginScreen.tsx`** — Wire the "Forgot password?" `TouchableOpacity` to navigate to `/(auth)/forgot-password`, passing `email` as a route param if user already typed it

### Phase 7: Password Validation Utility
**New file:** `features/auth/utils/passwordValidation.ts`

```typescript
interface PasswordRequirements {
  minLength: boolean;    // >= 8 chars
  hasUppercase: boolean; // /[A-Z]/
  hasLowercase: boolean; // /[a-z]/
  hasDigit: boolean;     // /\d/
}

function validatePassword(password: string): PasswordRequirements;
function isPasswordValid(requirements: PasswordRequirements): boolean;
```

---

## File Summary

| Action | File |
|--------|------|
| MODIFY | `shared/api/config.ts` |
| MODIFY | `shared/services/AuthService.ts` |
| MODIFY | `i18n/locales/en.json` |
| MODIFY | `i18n/locales/fr.json` |
| CREATE | `features/auth/hooks/useForgotPassword.ts` |
| CREATE | `features/auth/screens/ForgotPasswordScreen.tsx` |
| CREATE | `features/auth/utils/passwordValidation.ts` |
| MODIFY | `app/(auth)/_layout.tsx` |
| CREATE | `app/(auth)/forgot-password.tsx` |
| MODIFY | `features/auth/screens/LoginScreen.tsx` |

**Total: 7 files modified, 3 files created**

## Estimated Complexity: MEDIUM-HIGH

- Service/API layer: straightforward
- Hook logic: medium (3-step state machine, cooldown timer, error mapping)
- OTP input: medium-high (focus management, paste, auto-submit, shake animation)
- Animations: medium (slide transitions, springs, step indicator)
- Password screen: medium (requirements checklist, success animation)

## Implementation Order

1. API endpoints + AuthService methods (foundation)
2. i18n keys (needed by all screens)
3. Password validation utility (small, standalone)
4. `useForgotPassword` hook (core logic)
5. `ForgotPasswordScreen` with all 3 steps + animations
6. Route file + layout registration
7. Wire LoginScreen "Forgot password?" link

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes / no / modify)
