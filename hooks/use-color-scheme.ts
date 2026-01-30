import { useColorScheme as useRNColorScheme } from 'react-native';

import { useTheme } from '@/contexts/themeContext';

/**
 * Returns the effective color scheme (light/dark).
 * When inside ThemeProvider, uses the user's preference (light / dark / system).
 * Otherwise falls back to the system color scheme.
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const theme = useTheme();
  const systemScheme = useRNColorScheme();
  if (theme) return theme.colorScheme;
  return systemScheme ?? 'light';
}
