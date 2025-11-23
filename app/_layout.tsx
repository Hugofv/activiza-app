import '@/translation';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { OnboardingFormProvider } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'onboarding/index',
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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OnboardingFormProvider>
        <Stack>
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/document" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/name" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/contact" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/codeContact" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/confirmContact" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/email" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/codeEmail" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/confirmEmail" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/country" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/postalCode" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/address" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </OnboardingFormProvider>
    </ThemeProvider>
  );
}
