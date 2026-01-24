import { Colors } from '@/constants/theme';
import { OnboardingFormProvider } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { Stack, usePathname, useSegments } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Layout for all onboarding screens
 * Handles navigation stack for the onboarding flow
 * Protects routes after email/password (requires authentication)
 */
export default function OnboardingLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isChecking, redirectToLogin } = useAuthGuard();
  const segments = useSegments();
  const pathname = usePathname();

  // Routes that don't require authentication (pre-auth creation + immediate email verification after register)
  const publicRoutes = useMemo(
    () => ['/onboarding/email', '/onboarding/password', '/onboarding/codeEmail', '/authPassword'],
    []
  );

  useEffect(() => {
    if (isChecking) return;

    // Get current route path
    const currentRoute = pathname || `/${segments.join('/')}`;

    // Check if current route is public (email or password)
    const isPublicRoute = publicRoutes.some((route: string) => currentRoute.includes(route));

    // If route is not public and user is not authenticated, redirect to email
    if (!isPublicRoute && !isAuthenticated) {
      console.log(
        '[OnboardingLayout] Protected onboarding route without auth, calling redirectToLogin("onboarding_layout")',
        { currentRoute }
      );
      redirectToLogin('onboarding_layout');
    }
  }, [isAuthenticated, isChecking, pathname, segments, redirectToLogin, publicRoutes]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Check if current route requires auth and user is not authenticated
  const currentRoute = pathname || `/${segments.join('/')}`;
  const isCurrentRoutePublic = publicRoutes.some((route: string) => currentRoute.includes(route));

  if (!isCurrentRoutePublic && !isAuthenticated) {
    // Don't render protected routes if not authenticated
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <OnboardingFormProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name='document'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='name'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='contact'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='codeContact'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='confirmContact'
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name='email'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='codeEmail'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='confirmEmail'
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name='password'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='activeCustomers'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='financialOperations'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='capital'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='businessDuration'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='options'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='country'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='postalCode'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='address'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='terms'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='customization'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='plans'
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name='registerFinished'
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
      </Stack>
    </OnboardingFormProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
