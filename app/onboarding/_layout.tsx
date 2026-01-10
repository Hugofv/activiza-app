import { OnboardingFormProvider } from '@/contexts/onboardingFormContext';
import { Stack } from 'expo-router';
import React from 'react';

/**
 * Layout for all onboarding screens
 * Handles navigation stack for the onboarding flow
 */
export default function OnboardingLayout() {
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
