import React, { useEffect, useState } from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import {
  type CountryCode,
  getPostalCodeFormat,
  lookupPostalCode,
} from '@/lib/services/postalCodeService';
import { createPostalCodeSchema } from '@/lib/validations/onboarding';

export interface AddressData {
  postalCode: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: CountryCode;
  number?: string;
  complement?: string;
  _apiFilled?: {
    postalCode?: boolean;
    street?: boolean;
    neighborhood?: boolean;
    city?: boolean;
    state?: boolean;
    country?: boolean;
  };
}

export interface PostalCodeInputProps {
  initialValue?: string;
  countryCode: CountryCode;
  onSubmit: (data: AddressData) => Promise<void>;
  onBack?: () => void;
  progressValue?: number;
  title?: string;
  showProgress?: boolean;
  showBackButton?: boolean;
  customHeader?: React.ReactNode; // Custom header to replace the default one
  onSubmitReady?: (
    submitHandler: () => void,
    isValid: boolean,
    isLoading: boolean
  ) => void;
}

interface PostalCodeFormData {
  postalCode: string;
}

/**
 * Reusable postal code input component
 */
export const PostalCodeInput: React.FC<PostalCodeInputProps> = ({
  initialValue = '',
  countryCode,
  onSubmit,
  onBack,
  progressValue = 0,
  title,
  showProgress = true,
  showBackButton = true,
  customHeader,
  onSubmitReady,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  const formatConfig = getPostalCodeFormat(countryCode);
  const schema = createPostalCodeSchema(countryCode);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PostalCodeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {postalCode: initialValue,},
    mode: 'onChange',
  });

  // Expose submit handler to parent if needed
  useEffect(() => {
    if (onSubmitReady) {
      onSubmitReady(() => handleSubmit(handleFormSubmit)(), isValid, loading);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, loading, onSubmitReady]);

  const handleFormSubmit = async (data: PostalCodeFormData) => {
    setLoading(true);
    try {
      // Try to lookup address from API
      const addressData = await lookupPostalCode(data.postalCode, countryCode);

      let addressUpdate: AddressData;
      if (addressData) {
        // Auto-fill address data and mark which fields came from API
        addressUpdate = {
          ...addressData,
          number: '',
          complement: '',
          countryCode: countryCode,
          _apiFilled: {
            postalCode: !!addressData.postalCode,
            street: !!addressData.street,
            neighborhood: !!addressData.neighborhood,
            city: !!addressData.city,
            state: !!addressData.state,
            country: !!addressData.country,
          },
        };
      } else {
        // If not found, just save postal code and let user fill manually
        addressUpdate = {
          postalCode: data.postalCode,
          countryCode: countryCode,
          _apiFilled: {},
        };
      }

      await onSubmit(addressUpdate);
    } catch (error: any) {
      console.error('Error looking up postal code:', error);
      // Try to save postal code anyway
      try {
        await onSubmit({
          postalCode: data.postalCode,
          countryCode: countryCode,
          _apiFilled: {},
        });
      } catch (saveError: any) {
        console.error('Failed to save postal code:', saveError);
        showError(
          t('common.error') || 'Error',
          saveError?.response?.data?.message ||
            saveError?.message ||
            t('onboarding.saveError') ||
            'Failed to save. Please try again.'
        );
      }
    } finally {
      setLoading(false);
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

      <Typography
        variant="h4"
        style={styles.title}
      >
        {title || t('onboarding.postalCode')}
      </Typography>

      <Input
        name="postalCode"
        control={control}
        error={errors.postalCode?.message}
        onFormat={formatConfig.format}
        className="border-0 rounded-none px-0 py-4 font-medium"
        style={[
          {
            fontSize: 24,
            borderBottomColor: errors.postalCode ? '#ef4444' : colors.icon,
          },
        ]}
        placeholder={formatConfig.placeholder}
        placeholderTextColor={colors.icon}
        keyboardType={countryCode === 'UK' ? 'default' : 'numeric'}
        autoCapitalize={countryCode === 'UK' ? 'characters' : 'none'}
        autoCorrect={false}
        maxLength={formatConfig.maxLength}
        autoFocus
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
          <Typography
            variant="body2"
            style={{
 color: colors.icon,
marginLeft: 8 
}}
          >
            {t('onboarding.loadingAddress')}
          </Typography>
        </View>
      )}
    </View>
  );
};

// Export submit handler for external use
export type PostalCodeSubmitHandler = (handler: () => void) => void;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: {marginBottom: 8,},
  title: {marginTop: 8,},
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
