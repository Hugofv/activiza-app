import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getPostalCodeFormat,
  type CountryCode,
} from '@/lib/services/postalCode';
import { addressSchema } from '@/lib/validations/onboarding';

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
  const countryCode =
    ((formData.address as any)?.countryCode as CountryCode) || 'BR';
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
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const fieldPositions = useRef<Record<string, number>>({});
  const fieldsContainerYOffset = useRef<number>(0);

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

  // Scroll to first error field when errors occur
  useEffect(() => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      // Find the first error field based on form order
      const fieldOrder: (keyof AddressFormData)[] = [
        'postalCode',
        'street',
        'neighborhood',
        'city',
        'state',
        'country',
        'number',
        'complement',
      ];

      const firstErrorField = fieldOrder.find((field) => errors[field]);

      if (
        firstErrorField &&
        fieldPositions.current[firstErrorField] !== undefined
      ) {
        // Since ScrollView now wraps only the fields container, we can scroll directly to the field position
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, fieldPositions.current[firstErrorField] - 50),
          animated: true,
        });
      }
    }
  }, [errors]);

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
    reset({
      postalCode: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      country: '',
      number: '',
      complement: '',
    });
    router.back();
  };

  const onSubmit = (data: AddressFormData) => {
    updateFormData({
      address: {
        ...formData.address, // Preserve existing address data including _apiFilled and countryCode
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
    router.push('/onboarding/terms');
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
              <Progress value={80} />
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

            {/* Address Fields - Scrollable */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={styles.fieldsContainer}
                onLayout={(event) => {
                  const { y } = event.nativeEvent.layout;
                  fieldsContainerYOffset.current = y;
                }}
              >
                {/* CEP */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    // Accumulate Y positions relative to the fields container
                    fieldPositions.current['postalCode'] = y;
                  }}
                >
                  <Input
                    name='postalCode'
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
                </View>

                {/* Rua */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['street'] = y;
                  }}
                >
                  <Input
                    name='street'
                    control={control}
                    error={errors.street?.message}
                    label={t('onboarding.street')}
                    disabled={isFieldDisabled('street')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.streetPlaceholder')}
                    autoCapitalize='words'
                  />
                </View>

                {/* Bairro */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['neighborhood'] = y;
                  }}
                >
                  <Input
                    name='neighborhood'
                    control={control}
                    error={errors.neighborhood?.message}
                    label={t('onboarding.neighborhood')}
                    disabled={isFieldDisabled('neighborhood')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.neighborhoodPlaceholder')}
                    autoCapitalize='words'
                  />
                </View>

                {/* Cidade */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['city'] = y;
                  }}
                >
                  <Input
                    name='city'
                    control={control}
                    error={errors.city?.message}
                    label={t('onboarding.city')}
                    disabled={isFieldDisabled('city')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.cityPlaceholder')}
                    autoCapitalize='words'
                  />
                </View>

                {/* Estado */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['state'] = y;
                  }}
                >
                  <Input
                    name='state'
                    control={control}
                    error={errors.state?.message}
                    label={t('onboarding.state')}
                    disabled={isFieldDisabled('state')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.statePlaceholder')}
                    autoCapitalize='words'
                  />
                </View>

                {/* País */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['country'] = y;
                  }}
                >
                  <Input
                    name='country'
                    control={control}
                    error={errors.country?.message}
                    label={t('onboarding.country')}
                    disabled={isFieldDisabled('country')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.countryPlaceholder')}
                    autoCapitalize='words'
                  />
                </View>

                {/* Número */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['number'] = y;
                  }}
                >
                  <Input
                    name='number'
                    control={control}
                    error={errors.number?.message}
                    label={t('onboarding.number')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.numberPlaceholder')}
                    keyboardType='numeric'
                  />
                </View>

                {/* Complemento */}
                <View
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    fieldPositions.current['complement'] = y;
                  }}
                >
                  <Input
                    name='complement'
                    control={control}
                    error={errors.complement?.message}
                    label={t('onboarding.complement')}
                    className='border-0 rounded-none px-0 py-4 font-medium'
                    style={{ fontSize: 20 }}
                    placeholder={t('onboarding.complementPlaceholder')}
                    autoCapitalize='words'
                  />
                </View>
              </View>
            </ScrollView>
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
            />
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
    paddingBottom: 80,
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
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
