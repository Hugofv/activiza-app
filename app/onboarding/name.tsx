import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboarding-form-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { nameSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';

interface NameFormData {
  name: string;
}

/**
 * Name input screen for onboarding
 */
const NameScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formData, updateFormData } = useOnboardingForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: yupResolver(nameSchema),
    defaultValues: {
      name: formData.name || '',
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    router.back();
  };

  const onSubmit = (data: NameFormData) => {
    updateFormData({ name: data.name });
    router.push('/onboarding/contact');
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
            {/* Back Button */}
            <Button variant='secondary' size='icon' onPress={handleBack}>
              <Icon name='chevron-back' size={32} color={colors.primary} />
            </Button>

            {/* Title */}
            <Typography variant='h4'>Qual seu nome completo?</Typography>

            {/* Input Field */}
            <Input
              name='name'
              control={control}
              error={errors.name?.message}
              className='border-0 rounded-none px-0 py-4 font-medium'
              style={[
                {
                  fontSize: 24,
                  borderBottomColor: errors.name ? '#ef4444' : colors.icon,
                },
              ]}
              placeholder='Nome completo'
              placeholderTextColor={colors.icon}
              keyboardType='default'
              maxLength={100}
              autoFocus
            />
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant='primary'
              size='icon'
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

export default NameScreen;

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
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
