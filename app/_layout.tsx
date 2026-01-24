import '@/translation';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { Toast } from '@/components/ui/toast';
import { ToastProvider } from '@/contexts/toastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { persistOptions, queryClient } from '@/lib/api/queryClient';
import { initializeBackgroundSync } from '@/lib/sync/backgroundSync';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index', // Home screen is now the initial route
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isSplashHidden, setIsSplashHidden] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isSplashHidden) {
      // Hide splash screen after fonts are loaded
      // Only hide once to prevent multiple calls
      setIsSplashHidden(true);
      SplashScreen.hideAsync().catch((error) => {
        // Ignore errors if splash screen is not available
        // This can happen in development or if splash screen was already hidden
        if (__DEV__) {
          console.warn('SplashScreen.hideAsync error (can be ignored in dev):', error.message);
        }
      });
    }
  }, [fontsLoaded, fontError, isSplashHidden]);

  // Initialize background sync on app start
  useEffect(() => {
    initializeBackgroundSync();

    // Cleanup on unmount
    return () => {
      // cleanupBackgroundSync will be called automatically
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <ToastProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              >
              <Stack.Screen
                name='index'
                options={{
                  headerShown: false,
                  animation: 'default',
                }}
              />
              <Stack.Screen
                name='onboarding'
                options={{
                  headerShown: false,
                  animation: 'default',
                }}
              />
              <Stack.Screen
                name='auth'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='(tabs)'
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 300,
                }}
              />
            </Stack>
            <StatusBar style='auto' />
            <Toast />
          </ToastProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
