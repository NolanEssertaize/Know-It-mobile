# Implementation Plan: Main Page Cleanup & Quota Guard Modal

## Requirements Restatement

1. **Fix KPI cards sizing** — The 3 stat cards (Topics, Sessions, Streak) are not the same size. Make them uniform.
2. **Remove UsageIndicator from main page** — The subscription sessions/generations bars look "gross" and are redundant (already in Profile > Subscription section).
3. **Add a proactive "Quota Exhausted" modal** — When the user tries to start a session or generate flashcards but has 0 remaining:
   - Show a modal with: "Wait until {time remaining} to do another session/generation" OR "Change Plan"
   - The "Change Plan" button opens the existing PaywallModal
   - This replaces the current behavior where the API returns 429 reactively

## Risks & Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Backend doesn't return `reset_time` in usage API | MEDIUM | Compute client-side: usage resets at midnight UTC, calculate `usage_date + 1 day - now` |
| Stale quota data (user used quota on another device) | LOW | Already auto-refreshes on focus via `useFocusEffect`; worst case the API 429 still catches it |
| KPI card sizing on small screens | LOW | Use `flex: 1` uniformly and test min content |

---

## Implementation Phases

### Phase 1: Fix KPI Card Sizing
**File:** `features/topics/components/StatsRow/StatsRow.tsx`

The issue: the Streak card is wrapped in a `Pressable` with `style={styles.statCardPressable}` (`flex: 1`), but the inner `GlassView` with `styles.statCard` also has `flex: 1`. The Topics and Sessions cards are bare `GlassView`s without a wrapping Pressable. This nesting difference causes inconsistent sizing.

**Fix:** Wrap all 3 cards in the same structure. Give each `GlassView` explicit equal `flex: 1` and ensure consistent padding/gaps. Alternatively, make Topics and Sessions also wrapped in a `View style={{ flex: 1 }}` to match Streak's Pressable wrapper, ensuring the flex distribution is identical across all 3.

### Phase 2: Remove UsageIndicator from Main Page
**Files to modify:**
- `features/topics/screens/TopicsListScreen.tsx` — Remove `<UsageIndicator />` and its import

That's it. The component stays in the codebase (still used in Profile > Subscription tab), we just remove it from the topics screen.

### Phase 3: Add "Quota Exhausted" Modal Component
**New file:** `features/subscription/components/QuotaExhaustedModal.tsx`

A reusable modal that shows when the user has no remaining quota:

```
┌─────────────────────────────────┐
│                                 │
│        (clock/timer icon)       │
│                                 │
│   No more sessions today        │  ← or "No more generations today"
│                                 │
│   Wait 4h 23m or upgrade your   │
│   plan for more.                │
│                                 │
│   ┌───────────────────────┐     │
│   │     Change Plan       │     │  ← opens PaywallModal
│   └───────────────────────────┘ │
│                                 │
│          Not now                │  ← dismiss
│                                 │
└─────────────────────────────────┘
```

**Props:**
```typescript
interface QuotaExhaustedModalProps {
  visible: boolean;
  type: 'session' | 'generation';
  onDismiss: () => void;
  onChangePlan: () => void;
}
```

**Time calculation:** Compute remaining time from `usage_date` in the store:
- Parse `usage_date` (ISO date string like "2026-02-12")
- Next reset = `usage_date + 1 day` at midnight UTC
- Remaining = `next_reset - Date.now()`
- Format as "Xh Ym"

### Phase 4: Add Quota Guard Hook
**New file:** `features/subscription/hooks/useQuotaGuard.ts`

A hook that wraps quota checking + modal state:

```typescript
function useQuotaGuard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [quotaType, setQuotaType] = useState<'session' | 'generation'>('session');

  // Check quota, show modal if exhausted, return true if allowed
  const checkAndProceed = (type: 'session' | 'generation'): boolean => {
    const hasQuota = useSubscriptionStore.getState().checkQuota(type);
    if (!hasQuota) {
      setQuotaType(type);
      setModalVisible(true);
      return false;
    }
    return true;
  };

  const dismiss = () => setModalVisible(false);
  const openPaywall = () => {
    setModalVisible(false);
    useSubscriptionStore.getState().showPaywall();
  };

  return { modalVisible, quotaType, checkAndProceed, dismiss, openPaywall };
}
```

### Phase 5: Wire Quota Guards into Session & Flashcard Flows
**Files to modify:**

1. **`features/topic-detail/hooks/useTopicDetail.ts`** — In `handleStartSession`:
   ```typescript
   const handleStartSession = useCallback(() => {
     if (!checkAndProceed('session')) return;  // ← guard
     if (topicId) router.push(`/${topicId}/session`);
   }, [topicId, router, checkAndProceed]);
   ```

2. **`features/result/hooks/useResult.ts`** — In `handleGenerateFlashcards`:
   ```typescript
   const handleGenerateFlashcards = useCallback(() => {
     if (!checkAndProceed('generation')) return;  // ← guard
     // ... existing flashcard generation logic
   }, [...deps, checkAndProceed]);
   ```

3. **`features/topic-detail/screens/TopicDetailScreen.tsx`** — Render `<QuotaExhaustedModal>` from the hook
4. **`features/result/screens/ResultScreen.tsx`** — Render `<QuotaExhaustedModal>` from the hook

### Phase 6: i18n Keys
**Files:** `i18n/locales/en.json`, `i18n/locales/fr.json`

Add under `subscription.quota`:
```json
"quota": {
  "noMoreSessions": "No more sessions today",
  "noMoreGenerations": "No more generations today",
  "waitMessage": "Wait {{time}} or upgrade your plan for more.",
  "changePlan": "Change Plan",
  "notNow": "Not now"
}
```

French:
```json
"quota": {
  "noMoreSessions": "Plus de sessions aujourd'hui",
  "noMoreGenerations": "Plus de générations aujourd'hui",
  "waitMessage": "Patiente {{time}} ou change de plan pour continuer.",
  "changePlan": "Changer de plan",
  "notNow": "Pas maintenant"
}
```

### Phase 7: Store Enhancement — Add `usageDate` to Store
**File:** `store/useSubscriptionStore.ts`

Store `usage_date` from the API so the modal can compute time remaining:
- Add `usageDate: string | null` to state
- Set it in `fetchUsage()` and `refreshAll()`

---

## File Summary

| Action | File |
|--------|------|
| MODIFY | `features/topics/components/StatsRow/StatsRow.tsx` — Fix equal sizing |
| MODIFY | `features/topics/screens/TopicsListScreen.tsx` — Remove UsageIndicator |
| CREATE | `features/subscription/components/QuotaExhaustedModal.tsx` |
| CREATE | `features/subscription/hooks/useQuotaGuard.ts` |
| MODIFY | `features/topic-detail/hooks/useTopicDetail.ts` — Add session quota guard |
| MODIFY | `features/topic-detail/screens/TopicDetailScreen.tsx` — Render modal |
| MODIFY | `features/result/hooks/useResult.ts` — Add generation quota guard |
| MODIFY | `features/result/screens/ResultScreen.tsx` — Render modal |
| MODIFY | `store/useSubscriptionStore.ts` — Store `usageDate` |
| MODIFY | `i18n/locales/en.json` — Add quota keys |
| MODIFY | `i18n/locales/fr.json` — Add quota keys |

**Total: 9 files modified, 2 files created**

## Estimated Complexity: MEDIUM

- KPI fix: trivial (CSS change)
- Remove UsageIndicator: trivial (delete 2 lines)
- QuotaExhaustedModal: medium (modal UI + time computation)
- Quota guard hook: simple
- Wiring into flows: simple (2 lines per hook)
- i18n: trivial

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes / no / modify)
