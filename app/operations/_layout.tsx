import { Stack } from 'expo-router';

import { OperationsProvider } from './_context';

export default function OperationsLayout() {
  return (
    <OperationsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 350,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="loan" />
        <Stack.Screen name="rentVehicle" />
      </Stack>
    </OperationsProvider>
  );
}
