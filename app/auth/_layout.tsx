import { OnboardingFormProvider } from "@/contexts/onboardingFormContext";
import { Stack } from "expo-router";

export default function AuthLayout() {
   return (
      <OnboardingFormProvider>
         <Stack
            screenOptions={{
               headerShown: false,
               animation: 'slide_from_right',
               animationDuration: 300,
            }}
         >
            {/* Names here are relative to /auth, so just 'email' and 'password' */}
            <Stack.Screen
               name="email"
               options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
               }}
            />
            <Stack.Screen
               name="password"
               options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
               }}
            />
         </Stack>
      </OnboardingFormProvider>
   );
}
