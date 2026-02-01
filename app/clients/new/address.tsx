import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { AddressFlow } from '@/components/address';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CountryCode } from '@/lib/services/postalCodeService';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import { useNewClientForm } from './_context';
import { CancelButton } from './components/CancelButton';

export default function AddressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{
    clientId?: string;
    edit?: string;
  }>();
  const isEditMode = !!searchParams.clientId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditClientStore();
  const {
 formData, updateFormData, setCurrentStep 
} = useNewClientForm();
  const addressSource = isEditMode ? draft.address : formData.address;
  const countryCode = (addressSource?.countryCode as CountryCode) || null;

  const handleBack = () => {
    router.back();
  };

  // Handle country selection (stage 1)
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
    const next = {
      postalCode: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      number: '',
      complement: '',
      country: countryData?.name || country,
      countryCode: country,
    };
    if (isEditMode) updateDraft({
 address: {
 ...addressSource,
...next 
} 
});
    else updateFormData({
 address: {
 ...formData.address,
...next 
} 
});
  };

  // Handle postal code submission (stage 2)
  const handlePostalCodeSubmit = async (addressData: any) => {
    const next = {
      ...addressData,
      number: addressSource?.number || '',
      complement: addressSource?.complement || '',
    };
    if (isEditMode) updateDraft({
 address: {
 ...addressSource,
...next 
} 
});
    else updateFormData({
 address: {
 ...formData.address,
...next 
} 
});
  };

  // Handle address form submission (stage 3)
  const handleAddressSubmit = async (addressData: any) => {
    const next = {
      postalCode: addressData.postalCode,
      street: addressData.street,
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      country: addressData.country,
      number: addressData.number,
      complement: addressData.complement,
    };
    if (isEditMode) updateDraft({
 address: {
 ...addressSource,
...next 
} 
});
    else updateFormData({
 address: {
 ...formData.address,
...next 
} 
});
  };

  // Handle complete address (all stages done)
  const handleComplete = async (completeAddress: any) => {
    const full = {
      postalCode: completeAddress.postalCode,
      street: completeAddress.street,
      neighborhood: completeAddress.neighborhood,
      city: completeAddress.city,
      state: completeAddress.state,
      country: completeAddress.country,
      countryCode: completeAddress.countryCode,
      number: completeAddress.number,
      complement: completeAddress.complement,
    };
    if (isEditMode) {
      updateDraft({ address: full });
      router.back();
      return;
    }
    updateFormData({ address: full });
    setCurrentStep(7);
    router.push('/clients/new/observation');
  };

  const headerTitle = (
    <Typography
      variant="h4"
      style={{ color: colors.text }}
    >
      {t('clients.newClient')}
    </Typography>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
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
              initialPostalCode={addressSource?.postalCode || ''}
              initialAddress={{
                postalCode: addressSource?.postalCode || '',
                street: addressSource?.street || '',
                neighborhood: addressSource?.neighborhood || '',
                city: addressSource?.city || '',
                state: addressSource?.state || '',
                country: addressSource?.country || 'Brasil',
                number: addressSource?.number || '',
                complement: addressSource?.complement || '',
              }}
              initialApiFilled={{}}
              onCountrySelect={handleCountrySelect}
              onPostalCodeSubmit={handlePostalCodeSubmit}
              onAddressSubmit={handleAddressSubmit}
              onComplete={handleComplete}
              onBack={handleBack}
              showProgress={false}
              headerTitle={headerTitle}
              headerAction={<CancelButton />}
            />
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,},
  content: {flex: 1,},
});
