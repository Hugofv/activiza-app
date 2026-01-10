import { Stack } from 'expo-router';
import React from 'react';


export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name='index' />
    </Stack>
  );
}
