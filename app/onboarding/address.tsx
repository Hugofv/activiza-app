import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getPostalCodeFormat, type CountryCode } from '@/lib/services/postalCode';
import { addressSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { useTranslation } from 'react-i18next';

interface AddressFormData {
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  number: string;
  complement?: string;
}

/**
 * Address input screen for onboarding
 */
const AddressScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const countryCode = (formData.address as any)?.countryCode as CountryCode || 'BR';
  const postalCodeFormat = getPostalCodeFormat(countryCode);

  const defaultValues = {
    postalCode: formData.address?.postalCode || '',
    street: formData.address?.street || '',
    neighborhood: formData.address?.neighborhood || '',
    city: formData.address?.city || '',
    state: formData.address?.state || '',
    country: formData.address?.country || 'Brasil',
    number: formData.address?.number || '',
    complement: formData.address?.complement || '',
  }

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  // Get which fields were filled by API
  const apiFilled = formData.address?._apiFilled || {};
  
  // Fields that come from API lookup should be disabled
  // Number and complement should always be editable
  const isFieldDisabled = (fieldName: keyof AddressFormData) => {
    // Always allow editing number and complement
    if (fieldName === 'number' || fieldName === 'complement') {
      return false;
    }
    // Disable only if field was filled by API (not if it has a manual value)
    return !!apiFilled[fieldName as keyof typeof apiFilled];
  };

  const handleBack = () => {
    reset(defaultValues)
    router.back();
  };

  const onSubmit = (data: AddressFormData) => {
    updateFormData({
      address: {
        postalCode: data.postalCode,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        country: data.country,
        number: data.number,
        complement: data.complement,
      },
    });
    // TODO: Navigate to next step or complete onboarding
    // router.push('/onboarding/next');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.content}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Progress value={81} />
              </View>

              {/* Back Button */}
              <Button variant='secondary' size='iconSmall' onPress={handleBack}>
                <Icon name='chevron-back' size={32} color={colors.primary} />
              </Button>

              {/* Address Fields */}
              <View style={styles.fieldsContainer}>
                {/* CEP */}
                <Input
                  name="postalCode"
                  control={control}
                  error={errors.postalCode?.message}
                  label={t('onboarding.postalCode')}
                  disabled={isFieldDisabled('postalCode')}
                  onFormat={postalCodeFormat.format}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={postalCodeFormat.placeholder}
                  keyboardType={countryCode === 'UK' ? 'default' : 'numeric'}
                  maxLength={postalCodeFormat.maxLength}
                />

                {/* Rua */}
                <Input
                  name="street"
                  control={control}
                  error={errors.street?.message}
                  label={t('onboarding.street')}
                  disabled={isFieldDisabled('street')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.streetPlaceholder')}
                  autoCapitalize='words'
                />

                {/* Bairro */}
                <Input
                  name="neighborhood"
                  control={control}
                  error={errors.neighborhood?.message}
                  label={t('onboarding.neighborhood')}
                  disabled={isFieldDisabled('neighborhood')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.neighborhoodPlaceholder')}
                  autoCapitalize='words'
                />

                {/* Cidade */}
                <Input
                  name="city"
                  control={control}
                  error={errors.city?.message}
                  label={t('onboarding.city')}
                  disabled={isFieldDisabled('city')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.cityPlaceholder')}
                  autoCapitalize='words'
                />

                {/* Estado */}
                <Input
                  name="state"
                  control={control}
                  error={errors.state?.message}
                  label={t('onboarding.state')}
                  disabled={isFieldDisabled('state')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.statePlaceholder')}
                  autoCapitalize='words'
                />

                {/* País */}
                <Input
                  name="country"
                  control={control}
                  error={errors.country?.message}
                  label={t('onboarding.country')}
                  disabled={isFieldDisabled('country')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.countryPlaceholder')}
                  autoCapitalize='words'
                />

                {/* Número */}
                <Input
                  name="number"
                  control={control}
                  error={errors.number?.message}
                  label={t('onboarding.number')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.numberPlaceholder')}
                  keyboardType='numeric'
                />

                {/* Complemento */}
                <Input
                  name="complement"
                  control={control}
                  error={errors.complement?.message}
                  label={t('onboarding.complement')}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={{ fontSize: 20 }}
                  placeholder={t('onboarding.complementPlaceholder')}
                  autoCapitalize='words'
                />
              </View>
            </ThemedView>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant='primary'
              size='iconLarge'
              onPress={handleSubmit(onSubmit)}
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

export default AddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  fieldsContainer: {
    gap: 36,
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});

