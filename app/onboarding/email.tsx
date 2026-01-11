import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createStepToRouteMap } from '@/lib/config/onboardingSteps';
import { checkEmailStatus } from '@/lib/services/authService';
import { emailSchema } from '@/lib/validations/onboarding';

import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface EmailFormData {
  email: string;
}

/**
 * Email input screen for onboarding
 */
const EmailScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [isChecking, setIsChecking] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      email: formData.email || '',
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: EmailFormData) => {
    setIsChecking(true);
    try {
      // Check if email exists and registration status
      const emailStatus = await checkEmailStatus(data.email);
      
      // Just update form data (don't save to API yet - user doesn't have account)
    updateFormData({ email: data.email });

      // Check if user is fully registered (completed) vs in-progress onboarding
      const isFullyRegistered = emailStatus.exists && 
                                emailStatus.isRegistered && 
                                emailStatus.clientStatus === 'COMPLETED';
      
      const isInProgressOnboarding = emailStatus.exists && 
                                      emailStatus.isRegistered && 
                                      emailStatus.clientStatus === 'IN_PROGRESS';

      if (isFullyRegistered) {
        // User is fully registered, redirect to password authentication
        // Pass onboardingStep to redirect user after login
        router.push({
          pathname: '/authPassword',
          params: { 
            email: data.email,
            onboardingStep: emailStatus.onboardingStep || '',
          },
        });
      } else if (isInProgressOnboarding) {
        // User exists but registration is incomplete, continue onboarding from last step
        // Use centralized step to route mapping
        const onboardingStep = emailStatus.onboardingStep || 'password';
        const stepToRouteMap = createStepToRouteMap();
        const route = stepToRouteMap[onboardingStep] || '/onboarding/password';
        router.push(route as any);
      } else {
        // New user, continue normal onboarding flow
    // New flow: Email -> Password -> Email Verification -> Document
    router.push('/onboarding/password');
      }
    } catch (error: any) {
      console.error('Check email status error:', error);
      // On error, assume new user and continue with onboarding
      updateFormData({ email: data.email });
      router.push('/onboarding/password');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={10} />
            </View>

            {/* Back Button */}
            <IconButton
              variant='secondary'
              size='sm'
              icon='chevron-back'
              iconSize={32}
              iconColor={colors.primary}
              onPress={handleBack}
            />

            {/* Title */}
            <Typography variant='h4'>{t('onboarding.email')}</Typography>

            {/* Input Field */}
            <Input
              name="email"
              control={control}
              error={errors.email?.message}
              className='border-0 rounded-none px-0 py-4 font-medium'
              style={[
                { 
                  fontSize: 24,
                  borderBottomColor: errors.email ? '#ef4444' : colors.icon,
                },
              ]}
              placeholder={t('common.email')}
              placeholderTextColor={colors.icon}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect={false}
              maxLength={100}
              autoFocus
            />
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='lg'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isChecking}
              />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
