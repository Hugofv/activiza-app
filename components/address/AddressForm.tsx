import React, { useEffect, useRef } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/lib/hooks/useToast';
import {
  type CountryCode,
  getPostalCodeFormat,
} from '@/lib/services/postalCodeService';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import { addressSchema } from '@/lib/validations/onboarding';

export interface AddressFormData {
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  number: string;
  complement?: string;
}

export interface AddressFormProps {
  initialValues?: Partial<AddressFormData>;
  countryCode: CountryCode;
  apiFilled?: {
    postalCode?: boolean;
    street?: boolean;
    neighborhood?: boolean;
    city?: boolean;
    state?: boolean;
    country?: boolean;
  };
  onSubmit: (data: AddressFormData) => Promise<void>;
  onBack?: () => void;
  progressValue?: number;
  title?: string;
  showProgress?: boolean;
  showBackButton?: boolean;
  customHeader?: React.ReactNode; // Custom header to replace the default one
  onSubmitReady?: (submitHandler: () => void) => void;
}

/**
 * Reusable address form component
 */
export const AddressForm: React.FC<AddressFormProps> = ({
  initialValues = {},
  countryCode,
  apiFilled = {},
  onSubmit,
  onBack,
  progressValue = 0,
  title,
  showProgress = true,
  showBackButton = true,
  customHeader,
  onSubmitReady,
}) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  const postalCodeFormat = getPostalCodeFormat(countryCode);

  const defaultValues: AddressFormData = {
    postalCode: initialValues.postalCode || '',
    street: initialValues.street || '',
    neighborhood: initialValues.neighborhood || '',
    city: initialValues.city || '',
    state: initialValues.state || '',
    country: initialValues.country || 'Brasil',
    number: initialValues.number || '',
    complement: initialValues.complement || '',
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const fieldPositions = useRef<Record<string, number>>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  // Expose submit handler to parent if needed
  useEffect(() => {
    if (onSubmitReady) {
      onSubmitReady(() => handleSubmit(handleFormSubmit)());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSubmitReady]);

  // Scroll to first error field when errors occur
  useEffect(() => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
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
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, fieldPositions.current[firstErrorField] - 50),
          animated: true,
        });
      }
    }
  }, [errors]);

  // Fields that come from API lookup should be disabled
  // Number and complement should always be editable
  const isFieldDisabled = (fieldName: keyof AddressFormData) => {
    if (fieldName === 'number' || fieldName === 'complement') {
      return false;
    }
    return !!apiFilled[fieldName as keyof typeof apiFilled];
  };

  const handleFormSubmit = async (data: AddressFormData) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      console.error('Failed to save address:', error);
      const apiMessage = getTranslatedError(
        (error?.response?.data as any) || error,
        t('onboarding.saveError') || 'Failed to save. Please try again.'
      );
      showError(t('common.error') || 'Error', apiMessage);
    }
  };

  return (
    <View style={styles.container}>
      {showProgress && (
        <View style={styles.progressContainer}>
          <Progress value={progressValue} />
        </View>
      )}

      {customHeader
        ? customHeader
        : showBackButton && <BackButton onPress={onBack} />}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldsContainer}>
          {/* Postal Code */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['postalCode'] = y;
            }}
          >
            <Input
              name="postalCode"
              control={control}
              error={errors.postalCode?.message}
              label={t('onboarding.postalCode')}
              disabled={isFieldDisabled('postalCode')}
              onFormat={postalCodeFormat.format}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={postalCodeFormat.placeholder}
              keyboardType={countryCode === 'UK' ? 'default' : 'numeric'}
              maxLength={postalCodeFormat.maxLength}
            />
          </View>

          {/* Street */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['street'] = y;
            }}
          >
            <Input
              name="street"
              control={control}
              error={errors.street?.message}
              label={t('onboarding.street')}
              disabled={isFieldDisabled('street')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.streetPlaceholder')}
              autoCapitalize="words"
            />
          </View>

          {/* Neighborhood */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['neighborhood'] = y;
            }}
          >
            <Input
              name="neighborhood"
              control={control}
              error={errors.neighborhood?.message}
              label={t('onboarding.neighborhood')}
              disabled={isFieldDisabled('neighborhood')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.neighborhoodPlaceholder')}
              autoCapitalize="words"
            />
          </View>

          {/* City */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['city'] = y;
            }}
          >
            <Input
              name="city"
              control={control}
              error={errors.city?.message}
              label={t('onboarding.city')}
              disabled={isFieldDisabled('city')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.cityPlaceholder')}
              autoCapitalize="words"
            />
          </View>

          {/* State */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['state'] = y;
            }}
          >
            <Input
              name="state"
              control={control}
              error={errors.state?.message}
              label={t('onboarding.state')}
              disabled={isFieldDisabled('state')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.statePlaceholder')}
              autoCapitalize="words"
            />
          </View>

          {/* Country */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['country'] = y;
            }}
          >
            <Input
              name="country"
              control={control}
              error={errors.country?.message}
              label={t('onboarding.country')}
              disabled={isFieldDisabled('country')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.countryPlaceholder')}
              autoCapitalize="words"
            />
          </View>

          {/* Number */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['number'] = y;
            }}
          >
            <Input
              name="number"
              control={control}
              error={errors.number?.message}
              label={t('onboarding.number')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.numberPlaceholder')}
              keyboardType="numeric"
            />
          </View>

          {/* Complement */}
          <View
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              fieldPositions.current['complement'] = y;
            }}
          >
            <Input
              name="complement"
              control={control}
              error={errors.complement?.message}
              label={t('onboarding.complement')}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={{ fontSize: 20 }}
              placeholder={t('onboarding.complementPlaceholder')}
              autoCapitalize="words"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Export submit handler type for external use
export type AddressFormSubmitHandler = (data: AddressFormData) => Promise<void>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: {marginBottom: 8,},
  scrollView: {flex: 1,},
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  fieldsContainer: {
    gap: 36,
    marginTop: 8,
  },
});
