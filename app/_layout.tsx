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
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { OnboardingFormProvider } from '@/contexts/onboardingFormContext';
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
  initialRouteName: 'onboarding/email', // Email é agora a primeira tela (identificador primário)
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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
    <QueryClientProvider client={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <OnboardingFormProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 300,
              }}
            >
              <Stack.Screen
                name='onboarding/document'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/name'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/contact'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/codeContact'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/confirmContact'
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 400,
                }}
              />
              <Stack.Screen
                name='onboarding/email'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/codeEmail'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/confirmEmail'
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 400,
                }}
              />
              <Stack.Screen
                name='onboarding/password'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/activeCustomers'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/financialOperations'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/capital'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/businessDuration'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/options'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/country'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/postalCode'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/address'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/terms'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              />
              <Stack.Screen
                name='onboarding/registerFinished'
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 500,
                }}
              />
              <Stack.Screen
                name='login'
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 400,
                }}
              />
              <Stack.Screen
                name='(tabs)'
                options={{
                  headerShown: false,
                  animation: 'default',
                }}
              />
            </Stack>
            <StatusBar style='auto' />
          </OnboardingFormProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </QueryClientProvider>
  );
}
