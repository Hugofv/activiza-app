import { Stack } from 'expo-router';
import React from 'react';

import { NewClientFormProvider } from './_context';

export default function NewClientLayout() {
  return (
    <NewClientFormProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="name" />
        <Stack.Screen name="whatsapp" />
        <Stack.Screen name="email" />
        <Stack.Screen name="address" />
        <Stack.Screen name="observation" />
        <Stack.Screen name="guarantor" />
        <Stack.Screen name="reliability" />
        <Stack.Screen name="summary" />
      </Stack>
    </NewClientFormProvider>
  );
}
