import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { documentSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface DocumentFormData {
  document: string;
}

/**
 * Document input screen for onboarding
 */
const DocumentScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DocumentFormData>({
    resolver: yupResolver(documentSchema),
    defaultValues: {
      document: formData.document || '',
    },
    mode: 'onChange',
  });

  // Format CPF: 000.000.000-00 or CNPJ: 00.000.000/0000-00
  const formatDocument = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // If 11 digits or less, format as CPF
    if (numbers.length <= 11) {
      const limited = numbers.slice(0, 11);
      if (limited.length <= 3) {
        return limited;
      } else if (limited.length <= 6) {
        return `${limited.slice(0, 3)}.${limited.slice(3)}`;
      } else if (limited.length <= 9) {
        return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
      } else {
        return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`;
      }
    }
    // If 12-14 digits, format as CNPJ
    else {
      const limited = numbers.slice(0, 14);
      if (limited.length <= 2) {
        return limited;
      } else if (limited.length <= 5) {
        return `${limited.slice(0, 2)}.${limited.slice(2)}`;
      } else if (limited.length <= 8) {
        return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
      } else if (limited.length <= 12) {
        return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
      } else {
        return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12, 14)}`;
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const onSubmit = (data: DocumentFormData) => {
    updateFormData({ document: data.document });
    router.push('/onboarding/name');
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
            <Button variant='secondary' size='iconSmall' onPress={handleBack}>
              <Icon name='chevron-back' size={32} color={colors.primary} />
            </Button>

            <Typography variant='h4'>{t('onboarding.document')}</Typography>

            <Typography variant='body1'>
              {t('onboarding.documentDescription')}
            </Typography>

            {/* Input Field */}
              <Input
                name='document'
                control={control}
                error={errors.document?.message}
                onFormat={formatDocument}
                className='border-0 rounded-none px-0 py-4 font-medium'
                style={[
                  {
                    fontSize: 28,
                    borderBottomColor: errors.document ? '#ef4444' : colors.icon,
                  },
                ]}
                placeholder={t('common.cpfMask')} // Shows CPF mask, but accepts both
                placeholderTextColor={colors.icon}
                keyboardType='numeric'
                maxLength={18} // 14 digits (CNPJ) + 4 formatting chars
                autoFocus
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

export default DocumentScreen;

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
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
