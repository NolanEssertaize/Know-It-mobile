/**
 * @file ThemeContext.tsx
 * @description Theme Context Provider - Manages light/dark/system theme preferences
 *
 * Features:
 * - Light mode (white theme)
 * - Dark mode (black theme)
 * - System preference (follows device settings)
 * - Persistent storage with AsyncStorage
 * - Smooth transitions
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { useColorScheme, Appearance, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createGlassColors, MonochromeColors } from './colors';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  /** Current theme mode setting ('light' | 'dark' | 'system') */
  themeMode: ThemeMode;
  
  /** Actual resolved theme (always 'light' or 'dark') */
  resolvedTheme: 'light' | 'dark';
  
  /** Whether the resolved theme is dark */
  isDark: boolean;
  
  /** Theme colors based on resolved theme */
  colors: ReturnType<typeof createGlassColors>;
  
  /** Raw monochrome colors for the resolved theme */
  rawColors: typeof MonochromeColors.light | typeof MonochromeColors.dark;
  
  /** Set theme mode */
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => Promise<void>;
  
  /** Check if currently using system preference */
  isSystemPreference: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const THEME_STORAGE_KEY = '@knowit_theme_mode';
const DEFAULT_THEME_MODE: ThemeMode = 'system';

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeProviderProps {
  children: ReactNode;
  /** Override initial theme (useful for testing) */
  initialTheme?: ThemeMode;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  // System color scheme from device
  const systemColorScheme = useColorScheme();
  
  // Theme mode state
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    initialTheme ?? DEFAULT_THEME_MODE
  );
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD SAVED THEME ON MOUNT
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('[ThemeProvider] Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialTheme) {
      loadTheme();
    } else {
      setIsLoading(false);
    }
  }, [initialTheme]);

  // ─────────────────────────────────────────────────────────────────────────
  // RESOLVE ACTUAL THEME
  // ─────────────────────────────────────────────────────────────────────────

  const resolvedTheme = useMemo((): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = resolvedTheme === 'dark';

  // ─────────────────────────────────────────────────────────────────────────
  // GENERATE COLORS
  // ─────────────────────────────────────────────────────────────────────────

  const colors = useMemo(() => createGlassColors(isDark), [isDark]);
  
  const rawColors = useMemo(
    () => (isDark ? MonochromeColors.dark : MonochromeColors.light),
    [isDark]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE STATUS BAR
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(
        isDark ? MonochromeColors.dark.background.primary : MonochromeColors.light.background.primary
      );
    }
  }, [isDark]);

  // ─────────────────────────────────────────────────────────────────────────
  // SET THEME MODE
  // ─────────────────────────────────────────────────────────────────────────

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('[ThemeProvider] Failed to save theme:', error);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TOGGLE THEME
  // ─────────────────────────────────────────────────────────────────────────

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [resolvedTheme, setThemeMode]);

  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────────────────

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      isDark,
      colors,
      rawColors,
      setThemeMode,
      toggleTheme,
      isSystemPreference: themeMode === 'system',
    }),
    [themeMode, resolvedTheme, isDark, colors, rawColors, setThemeMode, toggleTheme]
  );

  // Don't render until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY HOOK - Get Colors Only
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simplified hook to get just the colors
 * Useful for components that only need colors, not theme control
 */
export function useThemeColors() {
  const { colors, isDark } = useTheme();
  return { colors, isDark };
}

export default ThemeContext;
