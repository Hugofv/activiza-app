import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { CodeInput } from '@/components/ui/CodeInput';
import { IconButton } from '@/components/ui/IconButton';
import { Progress } from '@/components/ui/Progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resendVerificationCode, verifyPhone } from '@/lib/services/authService';
import { codeSchema } from '@/lib/validations/onboarding';

import { Typography } from '@/components/ui/Typography';
import { useToast } from '@/lib/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface CodeFormData {
  code: string;
}

/**
 * Code verification screen for contact onboarding
 */
const CodeContactScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData, updateStep } = useOnboardingForm();
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { showError, showSuccess } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CodeFormData>({
    resolver: yupResolver(codeSchema),
    defaultValues: {
      code: '',
    },
    mode: 'onChange',
  });

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: CodeFormData) => {
    if (!formData.phone?.phoneNumber) {
      showError(
        t('common.errors.MISSING_REQUIRED_FIELDS') || 'Phone number is required.',
        t('onboarding.contact') || 'Contact'
      );
      return;
    }

    setIsVerifying(true);
    try {
      // Verify phone code with API
      const phoneNumber = formData.phone.formattedPhoneNumber || formData.phone.phoneNumber;
      await verifyPhone(phoneNumber, data.code);

      // Code verified successfully
      updateFormData({ code: data.code });

      // Update onboarding step (verification step uses different endpoint)
      // API marks phone_verification as completed and returns the next step
      // After success, currentStep will be updated to the next step (not phone_verification anymore)
      try {
        console.log('📱 Calling updateStep for phone_verification...');
        const response = await updateStep('phone_verification');
        console.log('✅ Phone verification step marked as completed');
        console.log('📊 Response from updateStep:', response);
      } catch (stepError: any) {
        console.error('❌ Failed to update phone verification step:', stepError);
        showError(
          t('common.error') || 'Error',
          stepError?.response?.data?.message ||
            stepError?.message ||
            t('onboarding.stepUpdateError') ||
            'Failed to update step. Please try again.'
        );
        return; // Don't navigate if step update fails
      }

      // Continue to confirmation screen
      router.push('/onboarding/confirmContact');
    } catch (error: any) {
      console.error('Phone verification error:', error);
      showError(
        t('common.error') || 'Verification Failed',
        error?.response?.data?.message ||
          error?.message ||
          t('onboarding.stepUpdateError') ||
          'Invalid verification code. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.phone?.phoneNumber) {
      showError(
        t('common.errors.MISSING_REQUIRED_FIELDS') || 'Phone number is required.',
        t('onboarding.contact') || 'Contact'
      );
      return;
    }

    setIsResending(true);
    try {
      // Resend verification code via phone (WhatsApp/SMS)
      await resendVerificationCode('phone');

      // Reset timer
      setResendTimer(60);

      showSuccess(
        t('common.toast.success') || 'Success',
        t('onboarding.codeDescription') || 'Verification code sent to your phone.'
      );
    } catch (error: any) {
      console.error('Resend code error:', error);
      showError(
        t('common.error') || 'Failed to Resend',
        error?.response?.data?.message ||
          error?.message ||
          t('onboarding.stepUpdateError') ||
          'Failed to resend verification code. Please try again.'
      );
    } finally {
      setIsResending(false);
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
              <Progress value={60} />
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
            <Typography variant='h4' style={styles.title}>
              {t('onboarding.codeTitle')}
            </Typography>

            {/* Description */}
            <Typography variant='body1' style={[styles.description, { color: colors.icon }]}>
              {t('onboarding.codeDescription')}
            </Typography>

            {/* Code Input */}
            <View style={styles.codeContainer}>
              <CodeInput
                name="code"
                control={control}
                error={errors.code?.message}
                length={6}
                autoFocus
              />
            </View>

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Typography variant='body2' style={{ color: colors.icon }}>
                  {t('onboarding.codeResendTimer', { seconds: resendTimer })}
                </Typography>
              ) : (
                <TouchableOpacity
                  onPress={handleResendCode}
                  activeOpacity={0.7}
                  disabled={isResending}
                >
                  <Typography variant='body2' style={{ color: colors.primary }}>
                    {t('onboarding.codeResend')}
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
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
              disabled={!isValid || isVerifying}
              loading={isVerifying}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CodeContactScreen;

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
  title: {
    marginTop: 8,
  },
  description: {
    marginTop: -8,
    marginBottom: 8,
  },
  codeContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});

