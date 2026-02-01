import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { AddressFlow } from '@/components/address';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CountryCode } from '@/lib/services/postalCodeService';

/**
 * Address input screen for onboarding
 * Uses the unified AddressFlow component that handles all 3 stages internally
 */
const AddressScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formData, updateFormData } = useOnboardingForm();
  const countryCode =
    ((formData.address as any)?.countryCode as CountryCode) || null;

  const handleBack = () => {
    router.back();
  };

  // Handle country selection (stage 1)
  // Save locally only, no API call until complete
  const handleCountrySelect = async (country: CountryCode) => {
    const COUNTRIES = [
      {
 code: 'BR' as CountryCode,
name: 'Brasil' 
},
      {
 code: 'UK' as CountryCode,
name: 'Reino Unido' 
},
      {
 code: 'US' as CountryCode,
name: 'Estados Unidos' 
},
    ];
    const countryData = COUNTRIES.find((c) => c.code === country);

    // Update local state only, no API call
    await updateFormData({
      address: {
        ...formData.address,
        postalCode: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        number: '',
        complement: '',
        country: countryData?.name || country,
        countryCode: country,
        _apiFilled: {
          postalCode: false,
          street: false,
          neighborhood: false,
          city: false,
          state: false,
          country: false,
        },
      } as any,
    });
  };

  // Handle postal code submission (stage 2)
  // Save locally only, no API call until complete
  const handlePostalCodeSubmit = async (addressData: any) => {
    // Update local state only, no API call
    await updateFormData({
      address: {
        ...formData.address,
        ...addressData,
        number: formData.address?.number || '',
        complement: formData.address?.complement || '',
      },
    });
  };

  // Handle address form submission (stage 3)
  // Save locally only, no API call until complete
  const handleAddressSubmit = async (addressData: any) => {
    // Update local state only, no API call
    await updateFormData({
      address: {
        ...formData.address,
        postalCode: addressData.postalCode,
        street: addressData.street,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        number: addressData.number,
        complement: addressData.complement,
      },
    });
  };

  // Handle complete address (all stages done)
  const handleComplete = async (completeAddress: any) => {
    // Final save with complete address
    await updateFormData(
      {address: completeAddress,},
      'address'
    );
    // Navigate to next screen
    router.push('/onboarding/terms');
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
            <AddressFlow
              initialCountry={countryCode}
              initialPostalCode={formData.address?.postalCode || ''}
              initialAddress={{
                postalCode: formData.address?.postalCode || '',
                street: formData.address?.street || '',
                neighborhood: formData.address?.neighborhood || '',
                city: formData.address?.city || '',
                state: formData.address?.state || '',
                country: formData.address?.country || 'Brasil',
                number: formData.address?.number || '',
                complement: formData.address?.complement || '',
              }}
              initialApiFilled={formData.address?._apiFilled || {}}
              onCountrySelect={handleCountrySelect}
              onPostalCodeSubmit={handlePostalCodeSubmit}
              onAddressSubmit={handleAddressSubmit}
              onComplete={handleComplete}
              onBack={handleBack}
              progressValue={90}
            />
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: {flex: 1,},
  content: {flex: 1,},
});
