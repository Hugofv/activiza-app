import React, { useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import type { CountryCode } from '@/lib/services/postalCodeService';

import {
  type AddressData,
  AddressForm,
  type AddressFormData,
  CountrySelector,
  PostalCodeInput,
} from './index';

export type AddressStage = 'country' | 'postalCode' | 'address';

export interface AddressFlowProps {
  initialCountry?: CountryCode | null;
  initialPostalCode?: string;
  initialAddress?: Partial<AddressFormData>;
  initialApiFilled?: {
    postalCode?: boolean;
    street?: boolean;
    neighborhood?: boolean;
    city?: boolean;
    state?: boolean;
    country?: boolean;
  };
  onCountrySelect?: (country: CountryCode) => Promise<void>;
  onPostalCodeSubmit?: (addressData: AddressData) => Promise<void>;
  onAddressSubmit?: (addressData: AddressFormData) => Promise<void>;
  onComplete: (completeAddress: {
    countryCode: CountryCode;
    country: string;
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    number: string;
    complement?: string;
    _apiFilled?: {
      postalCode?: boolean;
      street?: boolean;
      neighborhood?: boolean;
      city?: boolean;
      state?: boolean;
      country?: boolean;
    };
  }) => Promise<void>;
  onBack?: () => void;
  progressValue?: number;
  showProgress?: boolean;
  showBackButton?: boolean;
  customHeader?: React.ReactNode; // Custom header to replace the default one
  /** Optional title element to render in the center of the header */
  headerTitle?: React.ReactNode;
  /** Optional action element to render on the right side of the header */
  headerAction?: React.ReactNode;
}

/**
 * Unified address flow component that handles all 3 stages:
 * 1. Country selection
 * 2. Postal code input
 * 3. Address form
 *
 * The parent component just needs to provide callbacks and receive the complete address.
 */
export const AddressFlow: React.FC<AddressFlowProps> = ({
  initialCountry = null,
  initialPostalCode = '',
  initialAddress = {},
  initialApiFilled = {},
  onCountrySelect,
  onPostalCodeSubmit,
  onAddressSubmit,
  onComplete,
  onBack,
  progressValue = 90,
  showProgress = true,
  showBackButton = true,
  customHeader,
  headerTitle,
  headerAction,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { showError } = useToast();

  // Determine initial stage based on what's already filled
  const getInitialStage = (): AddressStage => {
    if (!initialCountry) return 'country';
    if (!initialPostalCode) return 'postalCode';
    return 'address';
  };

  const [stage, setStage] = useState<AddressStage>(getInitialStage());
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(
    initialCountry
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countryCode = selectedCountry || 'BR';

  // Refs for submit handlers
  const postalCodeSubmitRef = useRef<(() => void) | null>(null);
  const addressSubmitRef = useRef<(() => void) | null>(null);
  const [postalCodeValid, setPostalCodeValid] = useState(false);
  const [postalCodeLoading, setPostalCodeLoading] = useState(false);

  const handleBack = () => {
    if (stage === 'postalCode') {
      setStage('country');
    } else if (stage === 'address') {
      setStage('postalCode');
    } else if (onBack) {
      onBack();
    }
  };

  // Stage 1: Country Selection
  const handleCountrySelect = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
  };

  const handleCountryContinue = async () => {
    if (!selectedCountry) return;

    setIsSubmitting(true);
    try {
      if (onCountrySelect) {
        await onCountrySelect(selectedCountry);
      }
      setStage('postalCode');
    } catch (error: any) {
      console.error('Failed to save country step:', error);
      showError(
        t('common.error') || 'Error',
        error?.response?.data?.message ||
          error?.message ||
          t('onboarding.saveError') ||
          'Failed to save. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stage 2: Postal Code
  const handlePostalCodeSubmit = async (addressData: AddressData) => {
    try {
      if (onPostalCodeSubmit) {
        await onPostalCodeSubmit(addressData);
      }
      setStage('address');
    } catch (saveError: any) {
      throw saveError;
    }
  };

  const handlePostalCodeSubmitReady = (
    submitFn: () => void,
    isValid: boolean,
    isLoading: boolean
  ) => {
    postalCodeSubmitRef.current = submitFn;
    setPostalCodeValid(isValid);
    setPostalCodeLoading(isLoading);
  };

  const handlePostalCodeContinue = () => {
    postalCodeSubmitRef.current?.();
  };

  // Stage 3: Address Form
  const handleAddressSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      if (onAddressSubmit) {
        await onAddressSubmit(data);
      }

      // Call onComplete with the full address
      await onComplete({
        countryCode: selectedCountry!,
        country: data.country,
        postalCode: data.postalCode,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        number: data.number,
        complement: data.complement,
        _apiFilled: initialApiFilled,
      });
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmitReady = (submitFn: () => void) => {
    addressSubmitRef.current = submitFn;
  };

  const handleAddressContinue = () => {
    addressSubmitRef.current?.();
  };

  // Calculate progress based on stage
  const getProgressValue = () => {
    switch (stage) {
      case 'country':
        return progressValue || 90;
      case 'postalCode':
        return (progressValue || 90) + 2;
      case 'address':
        return (progressValue || 90) + 5;
      default:
        return progressValue || 90;
    }
  };

  // Build a shared header when title/action are provided.
  // This header uses the internal handleBack logic so that the flow can
  // navigate between stages before leaving the address screen.
  const renderHeader = () => {
    if (!headerTitle && !headerAction) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showBackButton && <BackButton onPress={handleBack} />}
        </View>
        <View style={styles.headerCenter}>{headerTitle}</View>
        <View style={styles.headerRight}>{headerAction}</View>
      </View>
    );
  };

  // Decide which header to pass down to child steps.
  const effectiveCustomHeader = customHeader ?? renderHeader();
  const childShowBackButton = effectiveCustomHeader ? false : showBackButton;

  return (
    <View style={styles.container}>
      {/* Stage 1: Country Selection */}
      {stage === 'country' && (
        <CountrySelector
          initialValue={selectedCountry}
          onSelect={handleCountrySelect}
          onBack={childShowBackButton ? handleBack : undefined}
          progressValue={getProgressValue()}
          showProgress={showProgress}
          showBackButton={childShowBackButton}
          customHeader={effectiveCustomHeader}
        />
      )}

      {/* Stage 2: Postal Code */}
      {stage === 'postalCode' && (
        <PostalCodeInput
          initialValue={initialPostalCode}
          countryCode={countryCode}
          onSubmit={handlePostalCodeSubmit}
          onBack={childShowBackButton ? handleBack : undefined}
          progressValue={getProgressValue()}
          showProgress={showProgress}
          showBackButton={childShowBackButton}
          customHeader={effectiveCustomHeader}
          onSubmitReady={handlePostalCodeSubmitReady}
        />
      )}

      {/* Stage 3: Address Form */}
      {stage === 'address' && (
        <AddressForm
          initialValues={initialAddress}
          countryCode={countryCode}
          apiFilled={initialApiFilled}
          onSubmit={handleAddressSubmit}
          onBack={childShowBackButton ? handleBack : undefined}
          progressValue={getProgressValue()}
          showProgress={showProgress}
          showBackButton={childShowBackButton}
          customHeader={effectiveCustomHeader}
          onSubmitReady={handleAddressSubmitReady}
        />
      )}

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        {stage === 'country' && (
          <IconButton
            variant="primary"
            size="md"
            icon="arrow-forward"
            iconSize={32}
            iconColor={colors.primaryForeground}
            onPress={handleCountryContinue}
            disabled={!selectedCountry}
            loading={isSubmitting}
          />
        )}

        {stage === 'postalCode' && (
          <IconButton
            variant="primary"
            size="md"
            icon="arrow-forward"
            iconSize={32}
            iconColor={colors.primaryForeground}
            onPress={handlePostalCodeContinue}
            disabled={!postalCodeValid || postalCodeLoading}
            loading={postalCodeLoading}
          />
        )}

        {stage === 'address' && (
          <IconButton
            variant="primary"
            size="md"
            icon="arrow-forward"
            iconSize={32}
            iconColor={colors.primaryForeground}
            onPress={handleAddressContinue}
            loading={isSubmitting}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 26,
  },
  headerLeft: { width: 80 },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  buttonContainer: {
    paddingBottom: 76,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
