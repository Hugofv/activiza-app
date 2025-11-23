import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { phoneSchema } from '@/lib/validations/onboarding';
import type { InferType } from 'yup';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
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

  const onSubmit = (data: ContactFormData) => {
    updateFormData({ phone: data.phone as any });
    router.push('/onboarding/codeContact');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={27} />
            </View>

            {/* Back Button */}
            <Button variant='secondary' size='iconSmall' onPress={handleBack}>
              <Icon name='chevron-back' size={32} color={colors.primary} />
            </Button>

            {/* Title */}
            <Typography variant='h4'>{t('onboarding.contact')}</Typography>

            {/* Input Field */}
            <PhoneInput
              name="phone"
              control={control}
              error={errors.phone?.message}
            />
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant='primary'
              size='iconLarge'
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
            >
              <Icon
                name='arrow-forward'
                size={32}
                color={colors.primaryForeground}
              />
            </Button>
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
