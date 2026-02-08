/**
 * Theme context: user preference (light / dark / system) persisted in AsyncStorage.
 * useColorScheme() resolves to the effective scheme when inside this provider.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useColorScheme as useSystemColorScheme } from 'react-native';

import { getStorageItem, setStorageItem } from '@/lib/storage/asyncStorage';

const THEME_STORAGE_KEY = 'colorSchemePreference';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  /** User preference (light / dark / system) */
  preference: ThemePreference;
  /** Effective scheme used by the app (resolved from preference + system) */
  colorScheme: ColorScheme;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStorageItem<ThemePreference>(THEME_STORAGE_KEY).then((stored) => {
      if (
        stored &&
        (stored === 'light' || stored === 'dark' || stored === 'system')
      ) {
        setPreferenceState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setPreference = useCallback(async (value: ThemePreference) => {
    setPreferenceState(value);
    await setStorageItem(THEME_STORAGE_KEY, value);
  }, []);

  const colorScheme: ColorScheme = useMemo(() => {
    if (!loaded) return systemScheme === 'dark' ? 'dark' : 'light';
    if (preference === 'system')
      return systemScheme === 'dark' ? 'dark' : 'light';
    return preference;
  }, [loaded, preference, systemScheme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      preference,
      colorScheme,
      setPreference,
    }),
    [preference, colorScheme, setPreference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx;
}
