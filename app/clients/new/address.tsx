import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressFlow } from '@/components/address';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CountryCode } from '@/lib/services/postalCodeService';

import { useNewClientForm } from './_context';

export default function AddressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formData, updateFormData, setCurrentStep, totalSteps } = useNewClientForm();
  const countryCode = (formData.address?.countryCode as CountryCode) || null;

  const handleBack = () => {
    router.back();
  };

  // Handle country selection (stage 1)
  const handleCountrySelect = async (country: CountryCode) => {
    const COUNTRIES = [
      { code: 'BR' as CountryCode, name: 'Brasil' },
      { code: 'UK' as CountryCode, name: 'Reino Unido' },
      { code: 'US' as CountryCode, name: 'Estados Unidos' },
    ];
    const countryData = COUNTRIES.find((c) => c.code === country);

    updateFormData({
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
      },
    });
  };

  // Handle postal code submission (stage 2)
  const handlePostalCodeSubmit = async (addressData: any) => {
    updateFormData({
      address: {
        ...formData.address,
        ...addressData,
        number: formData.address?.number || '',
        complement: formData.address?.complement || '',
      },
    });
  };

  // Handle address form submission (stage 3)
  const handleAddressSubmit = async (addressData: any) => {
    updateFormData({
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
    updateFormData({
      address: {
        postalCode: completeAddress.postalCode,
        street: completeAddress.street,
        neighborhood: completeAddress.neighborhood,
        city: completeAddress.city,
        state: completeAddress.state,
        country: completeAddress.country,
        countryCode: completeAddress.countryCode,
        number: completeAddress.number,
        complement: completeAddress.complement,
      },
    });
    setCurrentStep(4);
    router.push('/clients/new/observation');
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
              initialApiFilled={{}}
              onCountrySelect={handleCountrySelect}
              onPostalCodeSubmit={handlePostalCodeSubmit}
              onAddressSubmit={handleAddressSubmit}
              onComplete={handleComplete}
              onBack={handleBack}
              progressValue={(4 / totalSteps) * 100}
              showBackButton={true}
            />
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
