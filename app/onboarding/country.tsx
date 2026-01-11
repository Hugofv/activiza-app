import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CountryCode } from '@/lib/services/postalCodeService';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

const COUNTRIES: {
  code: CountryCode;
  name: string;
  nameEn: string;
  flag: string;
}[] = [
  { code: 'BR', name: 'Brasil', nameEn: 'Brazil', flag: '🇧🇷' },
  { code: 'UK', name: 'Reino Unido', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'Estados Unidos', nameEn: 'United States', flag: '🇺🇸' },
];

/**
 * Country selection screen for onboarding
 */
const CountryScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, i18n } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(
    (formData.address?.country as CountryCode) || null
  );

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (!selectedCountry) return;

    const country = COUNTRIES.find((c) => c.code === selectedCountry);
    
    // Update form data and save to API with step tracking (unified)
    try {
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
          country: country?.name || selectedCountry,
          countryCode: selectedCountry,
          _apiFilled: {
            postalCode: false,
            street: false,
            neighborhood: false,
            city: false,
            state: false,
            country: false,
          },
        } as any,
      }, 'country');
      router.push('/onboarding/postalCode');
    } catch (error: any) {
      console.error('Failed to save country step:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error?.response?.data?.message || error?.message || t('onboarding.saveError') || 'Failed to save. Please try again.'
      );
    }
  };

  const getCountryName = (country: (typeof COUNTRIES)[0]) => {
    return i18n.language.startsWith('pt') ? country.name : country.nameEn;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
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
                <Progress value={90} />
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

              {/* Title */}
              <Typography variant='h4' style={styles.title}>
                {t('onboarding.selectCountry')}
              </Typography>

              {/* Country List */}
              <View style={styles.countryList}>
                {COUNTRIES.map((country) => {
                  const isSelected = selectedCountry === country.code;
                  return (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryItem,
                        {
                          backgroundColor: isSelected
                            ? colorScheme === 'dark'
                              ? '#1a2a24'
                              : '#effad1'
                            : 'transparent',
                          borderColor: isSelected
                            ? colors.primary
                            : colors.icon,
                        },
                      ]}
                      onPress={() => setSelectedCountry(country.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.countryContent}>
                        <Typography style={styles.flag}>
                          {country.flag}
                        </Typography>
                        <Typography
                          variant='body1'
                          style={[
                            styles.countryName,
                            {
                              color: isSelected ? colors.primary : colors.text,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {getCountryName(country)}
                        </Typography>
                      </View>
                      {isSelected && (
                        <Icon
                          name='checkmark'
                          size={24}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ThemedView>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='lg'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleContinue}
              disabled={!selectedCountry}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CountryScreen;

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
  title: {
    marginTop: 8,
  },
  countryList: {
    marginTop: 8,
    gap: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  countryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  flag: {
    fontSize: 28,
    lineHeight: 0,
  },
  countryName: {
    fontSize: 18,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
