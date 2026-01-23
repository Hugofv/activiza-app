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

            <Stack.Screen
               name="auth/email"
               options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
               }}
            />
            <Stack.Screen
               name="auth/password"
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