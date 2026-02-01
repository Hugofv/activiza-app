import { useEffect, useState } from 'react';

import { useColorScheme as useRNColorScheme } from 'react-native';

import { useTheme } from '@/contexts/themeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * Uses theme context when available (user preference), otherwise system scheme.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const theme = useTheme();
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return 'light';
  if (theme) return theme.colorScheme;
  return systemScheme ?? 'light';
}
