import { Stack } from 'expo-router';

export default function LoanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 350,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="form" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
