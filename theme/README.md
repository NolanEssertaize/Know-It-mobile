# 🎨 Theme System - Light/Dark/System

Un système de thème complet pour KnowIt avec support des modes clair, sombre et préférences système (comme ChatGPT).

## 📦 Fichiers créés

```
theme/
├── colors.ts              # Palette de couleurs Light/Dark
├── theme.ts               # Design tokens (spacing, typography, etc.)
├── ThemeContext.tsx       # Context Provider & useTheme hook
├── ThemeSelector.tsx      # Composants UI de sélection
├── index.ts               # Exports propres
├── ProfileScreen.preferences.example.tsx  # Exemple d'intégration settings
└── _layout.example.tsx    # Exemple d'intégration root layout
```

## 🚀 Installation

### Étape 1: Copier les fichiers

Copiez tous les fichiers du dossier `theme/` dans votre projet :

```bash
# Depuis votre projet
cp -r /path/to/generated/theme/* ./theme/
```

### Étape 2: Installer les dépendances (si pas déjà fait)

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install expo-haptics
npx expo install react-native-reanimated
```

### Étape 3: Wrapper l'app avec ThemeProvider

Dans `app/_layout.tsx` :

```tsx
import { ThemeProvider, useTheme } from '@/theme';

// Créer un composant enfant pour accéder au theme
function ThemedApp() {
  const { colors } = useTheme();
  
  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
      style={{ flex: 1 }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </LinearGradient>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
```

### Étape 4: Ajouter le sélecteur dans les settings

Dans `ProfileScreen.tsx`, section préférences :

```tsx
import { ThemeSelector, useTheme } from '@/theme';

// Dans renderPreferencesTab()
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Apparence</Text>
  <GlassView variant="default" style={styles.sectionCard}>
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>Thème</Text>
      <ThemeSelector language="fr" />
    </View>
  </GlassView>
</View>
```

## 🎯 Utilisation

### Hook `useTheme()`

```tsx
import { useTheme } from '@/theme';

function MyComponent() {
  const { 
    colors,         // Couleurs actuelles
    isDark,         // boolean - thème sombre actif?
    themeMode,      // 'light' | 'dark' | 'system'
    setThemeMode,   // Changer le mode
    toggleTheme,    // Basculer light/dark
  } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>
        Mode: {isDark ? 'Sombre' : 'Clair'}
      </Text>
    </View>
  );
}
```

### Hook `useThemeColors()` (simplifié)

```tsx
import { useThemeColors } from '@/theme';

function SimpleComponent() {
  const { colors, isDark } = useThemeColors();
  // Juste les couleurs, pas les contrôles
}
```

### Composants de sélection

```tsx
import { 
  ThemeSelector,          // Liste complète avec icônes
  ThemeSegmentedControl,  // Contrôle segmenté compact
  ThemeSelectorInline,    // Version minimaliste
} from '@/theme';

// Liste complète
<ThemeSelector 
  language="fr"           // 'fr' | 'en'
  showDescriptions={true} // Afficher les descriptions
/>

// Contrôle compact
<ThemeSegmentedControl language="fr" />

// Inline (icônes seulement)
<ThemeSelectorInline />
```

## 🎨 Palette de couleurs

### Mode Clair (White Theme)

| Token | Valeur | Usage |
|-------|--------|-------|
| `background.primary` | `#FFFFFF` | Fond principal |
| `background.secondary` | `#FAFAFA` | Fond secondaire |
| `foreground.primary` | `#000000` | Texte principal |
| `surface.glass` | `rgba(255,255,255,0.85)` | Surfaces glass |

### Mode Sombre (Black Theme)

| Token | Valeur | Usage |
|-------|--------|-------|
| `background.primary` | `#000000` | Fond principal (OLED) |
| `background.secondary` | `#0A0A0A` | Fond secondaire |
| `foreground.primary` | `#FFFFFF` | Texte principal |
| `surface.glass` | `rgba(255,255,255,0.06)` | Surfaces glass |

## 🔄 Migration depuis l'ancien système

### Avant (static)

```tsx
import { GlassColors } from '@/theme';

// Couleurs statiques (toujours dark)
<View style={{ backgroundColor: GlassColors.background.primary }} />
```

### Après (dynamic)

```tsx
import { useTheme } from '@/theme';

function MyComponent() {
  const { colors } = useTheme();
  
  // Couleurs dynamiques selon le thème
  return (
    <View style={{ backgroundColor: colors.background.primary }} />
  );
}
```

### Compatibilité ascendante

L'export `GlassColors` existe toujours pour la compatibilité :

```tsx
// Fonctionne encore (mais toujours dark mode)
import { GlassColors } from '@/theme';
```

## 📱 Comportement Système

Quand l'utilisateur choisit "Système" :

1. L'app suit `useColorScheme()` de React Native
2. Change automatiquement avec les settings iOS/Android
3. Réagit au Dark Mode de l'appareil

## 💾 Persistance

Le choix du thème est sauvegardé automatiquement :

- Clé: `@knowit_theme_mode`
- Stockage: AsyncStorage
- Valeurs: `'light'` | `'dark'` | `'system'`

## 🧪 Testing

```tsx
// Forcer un thème en développement
<ThemeProvider initialTheme="light">
  <App />
</ThemeProvider>
```

## 📋 Checklist d'intégration

- [ ] Copier les fichiers dans `theme/`
- [ ] Vérifier les dépendances npm
- [ ] Wrapper l'app avec `<ThemeProvider>`
- [ ] Remplacer `GlassColors` par `useTheme().colors` dans les composants
- [ ] Ajouter `ThemeSelector` dans les settings
- [ ] Tester les 3 modes (light/dark/system)
- [ ] Vérifier le StatusBar (clair/sombre)
- [ ] Tester la persistance (fermer/rouvrir l'app)

## ⚡ Performance

- Le contexte est mémoïzé avec `useMemo`
- Les couleurs ne sont recalculées que si `isDark` change
- Aucun re-render inutile des enfants

---

**Astuce** : Pour une transition fluide, vous pouvez ajouter des animations avec `react-native-reanimated` sur les changements de couleur !
