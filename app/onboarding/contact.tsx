import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { PhoneInput } from '@/components/ui/phone-input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { phoneSchema } from '@/lib/validations/onboarding';
import type { InferType } from 'yup';

import { Typography } from '@/components/ui/typography';
import { sendVerificationCode } from '@/lib/services/authService';
import { useTranslation } from 'react-i18next';

type ContactFormData = InferType<typeof phoneSchema>;

/**
 * Contact input screen for onboarding
 */
const ContactScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: yupResolver(phoneSchema) as any,
    defaultValues: {
      phone: (formData.phone as any) || null,
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: ContactFormData) => {
    // Update form data and save to API with step tracking (unified)
    try {
      await updateFormData({ phone: data.phone as any }, 'contact');
      
      // After saving phone, send verification code automatically
      if (data.phone?.phoneNumber) {
        const phoneNumber = data.phone.formattedPhoneNumber || data.phone.phoneNumber;
        try {
          await sendVerificationCode(phoneNumber, 'phone');
          console.log('✅ Verification code sent to phone');
        } catch (codeError: any) {
          console.error('Failed to send verification code:', codeError);
          // Don't block navigation if code sending fails, user can resend on next screen
          Alert.alert(
            t('common.warning') || 'Warning',
            t('onboarding.codeSendError') || 'Failed to send verification code. You can resend it on the next screen.'
          );
        }
      }
      
      router.push('/onboarding/codeContact');
    } catch (error: any) {
      console.error('Failed to save contact step:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error?.response?.data?.message || error?.message || t('onboarding.saveError') || 'Failed to save. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={55} />
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
            <Typography variant='h4'>{t('onboarding.contact')}</Typography>

            {/* Input Field */}
            <PhoneInput
              name='phone'
              control={control}
              error={errors.phone?.message}
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
              disabled={!isValid}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContactScreen;

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
  inputContainer: {
    width: '100%',
    marginTop: 8,
    borderBottomWidth: 1.5,
  },
  inputBorder: {
    borderBottomWidth: 0, // Remove any border from Input component
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
