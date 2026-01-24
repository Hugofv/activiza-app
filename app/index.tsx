import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  createStepToRouteMap,
  getNextStep,
  getStepByApiName,
  isOnboardingCompleted,
} from '@/lib/config/onboardingSteps';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { getOnboardingData } from '@/lib/services/onboardingService';

import Illustration from '@/assets/images/illustration.svg';
import Logo from '@/assets/images/logo.svg';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

export default function LandingScreen() {
   const { t } = useTranslation();
   const colorScheme = useColorScheme();
   const colors = Colors[colorScheme ?? 'light'];
   const { isAuthenticated, isChecking } = useAuthGuard();
   const pathname = usePathname();

   // If authenticated and we are on the root route, decide between onboarding and home
   useEffect(() => {
      const checkAndRedirect = async () => {
        if (isChecking || !isAuthenticated) return;
        if (pathname !== '/' && pathname !== '/index') return;

        try {
          console.log('[Landing] Authenticated user on root, checking onboarding status...');
          const data = await getOnboardingData();
          const { clientStatus, onboardingStep } = data ?? {};

          // Normalize status for completion helper (PENDING treated as not completed)
          const normalizedStatus =
            clientStatus === 'PENDING' ? undefined : (clientStatus as 'IN_PROGRESS' | 'COMPLETED' | undefined);

          const completed = isOnboardingCompleted(normalizedStatus);

          console.log('[Landing] Onboarding status:', {
            clientStatus,
            onboardingStep,
            completed,
          });

          if (!completed) {
            // User must finish onboarding instead of going to home
            const stepToRouteMap = createStepToRouteMap();
            const apiStepName = onboardingStep || 'document'; // fallback to first protected step

            // If API points to a verification step (e.g. email_verification), skip to the next real step
            const stepInfo = getStepByApiName(apiStepName);
            let targetStep = apiStepName;

            if (stepInfo?.isVerificationStep) {
              const nextStep = getNextStep(stepInfo.key);
              if (nextStep) {
                targetStep = nextStep.apiStepName;
                console.log(
                  `[Landing] Skipping verification step ${apiStepName}, redirecting to next step: ${targetStep}`
                );
              }
            }

            const route = stepToRouteMap[targetStep] || '/onboarding/document';

            console.log('[Landing] Redirecting authenticated user to onboarding route:', {
              route,
              targetStep,
            });

            router.replace(route as any);
          } else {
            // Onboarding fully completed, go to home tabs
            console.log('[Landing] Onboarding completed, redirecting to home tabs');
            router.replace('/(tabs)/home');
          }
        } catch (error) {
          console.error('[Landing] Error checking onboarding status; redirecting to home as fallback', error);
          router.replace('/(tabs)/home');
        }
      };

      checkAndRedirect();
   }, [isAuthenticated, isChecking, pathname]);

   const handleStart = async () => {
      // Navigate to auth email screen (first step of onboarding)
      router.push('/auth/email');
   };

   // Show loading while checking authentication
   if (isChecking) {
      return (
         <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top', 'bottom']}
         >
            <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={colors.primary} />
            </View>
         </SafeAreaView>
      );
   }

   // Don't render landing screen if authenticated (will redirect)
   if (isAuthenticated) {
      return null;
   }

   return (
      <SafeAreaView
         style={[styles.container, { backgroundColor: colors.background }]}
         edges={['top', 'bottom']}
      >
         <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
               <Logo width={197.889} height={44} style={styles.logo} />
            </View>

            {/* Title Text */}
            <Typography variant='h2' style={styles.title}>
               {t('onboarding.title')}
            </Typography>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
               <Illustration
                  width={300 * 1}
                  height={316}
                  style={styles.illustration}
               />
            </View>

            {/* Start Button */}
            <Button variant='primary' size='full' onPress={handleStart}>
               {t('onboarding.start')}
            </Button>
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   content: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 18,
      paddingBottom: 0,
      paddingHorizontal: 24,
   },
   logoContainer: {
      width: 197.889,
      height: 44,
      alignSelf: 'flex-start',
   },
   logo: {
      width: '100%',
      height: '100%',
   },
   title: {
      fontSize: 36,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 36,
      alignSelf: 'flex-start',
      marginTop: 20,
   },
   illustrationContainer: {
      width: 311.688,
      height: 316,
      alignItems: 'center',
      justifyContent: 'center',
   },
   illustration: {
      width: '100%',
      height: '100%',
   },
   button: {
      height: 56,
      borderRadius: 99,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      width: '100%',
   },
   buttonText: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 18,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
});
