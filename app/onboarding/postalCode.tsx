import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getPostalCodeFormat, lookupPostalCode, type CountryCode } from '@/lib/services/postalCodeService';
import { createPostalCodeSchema } from '@/lib/validations/onboarding';

import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface PostalCodeFormData {
  postalCode: string;
}

/**
 * Postal code (CEP) input screen for onboarding
 */
const PostalCodeScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [loading, setLoading] = useState(false);

  const countryCode = (formData.address as any)?.countryCode as CountryCode || 'BR';
  const formatConfig = getPostalCodeFormat(countryCode);
  const schema = createPostalCodeSchema(countryCode);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PostalCodeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      postalCode: formData.address?.postalCode || '',
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    reset({
      postalCode: '',
    });
    router.back();
  };

  const onSubmit = async (data: PostalCodeFormData) => {
    setLoading(true);
    try {
      // Try to lookup address from API
      const addressData = await lookupPostalCode(data.postalCode, countryCode);

      let addressUpdate: any;
      if (addressData) {
        // Auto-fill address data and mark which fields came from API
        addressUpdate = {
          address: {
            ...addressData,
            number: formData.address?.number || '',
            complement: formData.address?.complement || '',
            countryCode: countryCode,
            _apiFilled: {
              postalCode: !!addressData.postalCode,
              street: !!addressData.street,
              neighborhood: !!addressData.neighborhood,
              city: !!addressData.city,
              state: !!addressData.state,
              country: !!addressData.country,
            },
          },
        };
      } else {
        // If not found, just save postal code and let user fill manually
        addressUpdate = {
          address: {
            ...formData.address,
            postalCode: data.postalCode,
            countryCode: countryCode,
            _apiFilled: {
              // No fields filled by API
            },
          } as any,
        };
      }

      // Update form data and save to API with step tracking (unified)
      try {
        await updateFormData(addressUpdate, 'postal_code');
        router.push('/onboarding/address');
      } catch (saveError: any) {
        console.error('Failed to save postalCode step:', saveError);
        Alert.alert(
          t('common.error') || 'Error',
          saveError?.response?.data?.message || saveError?.message || t('onboarding.saveError') || 'Failed to save. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('Error looking up postal code:', error);
      // Try to save postal code anyway
      try {
        await updateFormData({
          address: {
            ...formData.address,
            postalCode: data.postalCode,
            countryCode: countryCode,
          } as any,
        }, 'postal_code');
        router.push('/onboarding/address');
      } catch (saveError: any) {
        console.error('Failed to save postalCode step:', saveError);
        Alert.alert(
          t('common.error') || 'Error',
          saveError?.response?.data?.message || saveError?.message || t('onboarding.saveError') || 'Failed to save. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={92} />
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
              {t('onboarding.postalCode')}
            </Typography>

            {/* Input Field */}
            <Input
              name="postalCode"
              control={control}
              error={errors.postalCode?.message}
              onFormat={formatConfig.format}
              className='border-0 rounded-none px-0 py-4 font-medium'
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
                <ActivityIndicator size="small" color={colors.primary} />
                <Typography variant='body2' style={{ color: colors.icon, marginLeft: 8 }}>
                  {t('onboarding.loadingAddress')}
                </Typography>
              </View>
            )}
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='lg'
              icon={loading ? 'hourglass-outline' : 'arrow-forward'}
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || loading}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostalCodeScreen;

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
  progressContainer: {
    marginBottom: 8,
  },
  title: {
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});

