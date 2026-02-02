/**
 * @file useTheme.ts
 * @description Hook to access theme context
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

/**
 * Hook to access theme colors and mode
 * 
 * @example
 * ```tsx
 * const { colors, isDark, setMode } = useTheme();
 * 
 * <View style={{ backgroundColor: colors.background.primary }}>
 *   <Text style={{ color: colors.text.primary }}>Hello</Text>
 * </View>
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
