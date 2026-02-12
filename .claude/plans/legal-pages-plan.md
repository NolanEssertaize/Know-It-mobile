# Implementation Plan: Legal Pages (Mentions Légales, CGU, Politique de Confidentialité)

## Requirements Restatement

Based on French LCEN, GDPR/RGPD, and CNIL 2025 guidelines, the app needs:

1. **Three legal documents** as separate in-app pages (in French):
   - **Mentions Légales** — Publisher identity, host info, IP rights (LCEN)
   - **CGU (Conditions Générales d'Utilisation)** — Contractual terms, UGC license, liability limits
   - **Politique de Confidentialité** — GDPR data processing, retention, user rights

2. **Registration consent flow** — Two unticked checkboxes on signup (CGU + Privacy), with tappable links to full texts. "Create Account" button disabled until both are checked. No dark patterns.

3. **Persistent access** — Legal pages accessible anytime from Profile > About > Legal section (placeholder links already exist but have no `onPress` handlers).

4. **Content** — The user provided complete French legal text templates ready for adaptation. Placeholders like `[Prénom Nom]`, `[Nom de l'application]` need to be filled in.

---

## Current State

- **No legal screens exist** — no route files for legal pages
- **Registration screen** — Step-by-step form (4 steps), **no consent checkboxes**
- **Profile > About > Legal** — Three `TouchableOpacity` placeholders with no `onPress` handlers for Terms, Privacy, Contact
- **i18n keys** already exist for `profile.actions.termsOfService`, `profile.actions.privacyPolicy`, `profile.sections.legal`
- App uses Expo Router (file-based routing in `app/` directory)

---

## Risks & Considerations

| Risk | Level | Mitigation |
|------|-------|------------|
| Legal texts are very long for a mobile ScrollView | LOW | Use collapsible sections with article headers |
| Registration UX disrupted by adding checkboxes | LOW | Add as a final step (Step 5) or below the "Create Account" button |
| Legal text must be in French only (app supports EN+FR) | MEDIUM | Display legal texts in French regardless of language (they are legal documents under French law); UI labels translated |
| Backend doesn't track consent version | MEDIUM | Frontend-only for now; backend consent tracking is a follow-up |

---

## Implementation Plan

### Phase 1: Create Legal Content Component

**New file:** `shared/components/LegalContent/LegalContent.tsx`

A reusable component that renders structured legal text with:
- Theme-aware styling (light/dark)
- Collapsible article sections
- ScrollView with proper accessibility (`accessibilityRole="header"` on section titles)
- Takes a `document` prop: `'mentions' | 'cgu' | 'privacy'`

The actual legal text content will live in dedicated data files:
- `shared/legal/mentions-legales.ts` — exports the Mentions Légales content
- `shared/legal/cgu.ts` — exports the CGU content
- `shared/legal/politique-confidentialite.ts` — exports the Privacy Policy content

Each file exports a structured array of sections `{ title, content }[]` that the component renders. This keeps the legal text out of the UI code and makes it easy to update.

---

### Phase 2: Create Legal Route Screens

**New files:**
- `app/legal-mentions.tsx`
- `app/terms-of-service.tsx`
- `app/privacy-policy.tsx`

Each screen is a simple modal route that wraps the `LegalContent` component:
- Header with title + close button
- Theme-aware background
- Presented as modal (slide from bottom) — add to `_layout.tsx` Stack

**Modify:** `app/_layout.tsx`
- Add 3 new `Stack.Screen` entries with `presentation: 'modal'`

---

### Phase 3: Wire Profile Legal Links

**Modify:** `features/profile/screens/ProfileScreen.tsx`

In the About tab's Legal section, add `onPress` handlers to the existing placeholder `TouchableOpacity` components:
- "Terms of Service" → `router.push('/terms-of-service')`
- "Privacy Policy" → `router.push('/privacy-policy')`
- Add a new "Mentions Légales" link → `router.push('/legal-mentions')`
- "Contact Us" → `Linking.openURL('mailto:knowit-support@essertaize.com')`

---

### Phase 4: Registration Consent Checkboxes

**Modify:** `features/auth/screens/RegisterScreen.tsx`

After Step 4 (confirm password), before the "Create Account" button:
- Add two custom checkboxes with tappable labels:
  - `[ ] J'accepte les Conditions Générales d'Utilisation` (link opens CGU modal)
  - `[ ] J'accepte la Politique de Confidentialité` (link opens Privacy modal)
- Both checkboxes must be checked to enable the "Create Account" button
- Accessibility: `accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`
- No pre-ticked boxes (CNIL compliance)

**State management:** Add two `useState` booleans (`cguAccepted`, `privacyAccepted`) in the registration hook or screen. Disable submit via `disabled={!cguAccepted || !privacyAccepted}`.

---

### Phase 5: i18n Strings

**Modify:** `i18n/locales/en.json` and `fr.json`

Add keys:
```
legal.mentionsLegales: "Legal Mentions" / "Mentions Légales"
legal.cgu: "Terms of Service" / "Conditions Générales d'Utilisation"
legal.privacy: "Privacy Policy" / "Politique de Confidentialité"
legal.consent.cgu: "I accept the Terms of Service" / "J'accepte les Conditions Générales d'Utilisation"
legal.consent.privacy: "I accept the Privacy Policy" / "J'accepte la Politique de Confidentialité"
legal.consent.required: "You must accept the terms to continue" / "Vous devez accepter les conditions pour continuer"
```

---

## Phase Summary

| Phase | What | New Files | Modified Files |
|-------|------|-----------|----------------|
| 1 | Legal content component + data | `shared/components/LegalContent/`, `shared/legal/*.ts` (3 files) | — |
| 2 | Route screens (modals) | `app/legal-mentions.tsx`, `app/terms-of-service.tsx`, `app/privacy-policy.tsx` | `app/_layout.tsx` |
| 3 | Profile legal links | — | `ProfileScreen.tsx` |
| 4 | Registration consent | — | `RegisterScreen.tsx` |
| 5 | i18n strings | — | `en.json`, `fr.json` |

## Complexity: MEDIUM

- ~4 new files (content data + component)
- ~3 new route screens
- ~3 modified files
- Legal text is provided — just needs structuring

---

## Out of Scope (Follow-ups)

- **Backend consent tracking** (storing CGU version + timestamp in DB) — recommended but not blocking for launch
- **Consent re-acceptance** when legal texts are updated (version bump mechanism)
- **Backend CRON jobs** for data retention enforcement (2-year inactivity deletion)

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes / no / modify)
