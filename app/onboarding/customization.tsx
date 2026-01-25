import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Progress } from '@/components/ui/Progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getDocumentFormat,
  type DocumentType
} from '@/lib/services/documentService';
import type { CountryCode } from '@/lib/services/postalCodeService';
import { createDocumentSchema, emailSchema, nameSchema, phoneSchema } from '@/lib/validations/onboarding';
import type { InferType } from 'yup';
import * as yup from 'yup';

import { Typography } from '@/components/ui/Typography';
import { useToast } from '@/lib/hooks/useToast';
import { getCurrentUser } from '@/lib/services/authService';
import { useTranslation } from 'react-i18next';

interface CustomizationFormData {
  businessName: string;
  businessEmail: string;
  businessPhone: InferType<typeof phoneSchema>['phone'];
  businessDocument?: string;
  businessDocumentType?: DocumentType;
}

/**
 * Business customization screen for onboarding
 * Allows user to review and edit main business information before finalizing
 */
const CustomizationScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const { showError } = useToast();

  // Get User data from React Query cache (from login/register)
  // Use User data as fallback when formData doesn't have these values
  const currentUser = getCurrentUser();

  // Get country code from address or default to BR
  const countryCode: CountryCode = (formData.address?.countryCode as CountryCode) || 'BR';
  const documentType = (formData.documentType as DocumentType) || undefined;
  const formatConfig = getDocumentFormat(countryCode, documentType);
  const documentSchema = createDocumentSchema(countryCode, documentType);

  // Combine all schemas for validation with API field names
  const combinedSchema = yup.object().shape({
    businessName: nameSchema.fields.name,
    businessEmail: emailSchema.fields.email,
    businessPhone: phoneSchema.fields.phone,
    businessDocument: documentSchema.fields.document,
  });

  const userName = formData.name || currentUser?.name || '';
  const userEmail = formData.email || currentUser?.email || '';
  const userPhone = useMemo(() => {
    if (formData.phone) return formData.phone;
    // User.phone might be a string or object, convert to phone format if needed
    if (currentUser?.phone) {
      if (typeof currentUser.phone === 'string') {
        return {
          country: null,
          countryCode: '+55', // Default to BR
          phoneNumber: currentUser.phone,
          formattedPhoneNumber: currentUser.phone,
        };
      }
      // If it's already in the correct format, return it
      return currentUser.phone as any;
    }
    return null;
  }, [formData.phone, currentUser?.phone]);
  const userDocument = formData.document || currentUser?.document || '';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CustomizationFormData>({
    resolver: yupResolver(combinedSchema) as any,
    defaultValues: {
      businessName: userName,
      businessEmail: userEmail,
      businessPhone: (userPhone as any) || null,
      businessDocument: userDocument,
      businessDocumentType: documentType,
    },
    mode: 'onChange',
  });

  // Reset form values when User data becomes available (from formData or currentUser)
  useEffect(() => {
    const hasUserData = userName || userEmail || userPhone || userDocument;
    if (hasUserData) {
      reset({
        businessName: userName,
        businessEmail: userEmail,
        businessPhone: (userPhone as any) || null,
        businessDocument: userDocument,
        businessDocumentType: documentType,
      });
    }
  }, [userName, userEmail, userPhone, userDocument, documentType, reset]);

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: CustomizationFormData) => {
    // Update form data and save to API with step tracking (unified)
    // Send Account (business*) fields directly to API
    setIsSubmitting(true);
    try {
      await updateFormData(
        {
          businessName: data.businessName,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone as any,
          businessDocument: data.businessDocument || undefined,
        } as any, // Cast to any to allow business* fields for API (Account table)
        'customization'
      );
      router.push('/onboarding/options');
    } catch (error: any) {
      console.error('Failed to save customization step:', error);
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
                <Progress value={98} />
              </View>

              {/* Back Button */}
              <BackButton />

              {/* Title */}
              <Typography variant='h4' style={styles.title}>
                {t('onboarding.customizationTitle') || 'Customize seu negócio'}
              </Typography>

              {/* Description */}
              <Typography variant='body2' style={[styles.description, { color: colors.icon }]}>
                {t('onboarding.customizationDescription') || 'Revise e atualize as informações principais do seu negócio'}
              </Typography>

              {/* Business Name Field (pre-filled from User.name) */}
              <View style={styles.fieldContainer}>
                <Input
                  name='businessName'
                  control={control}
                  error={errors.businessName?.message}
                  label={t('common.name') || 'Nome'}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={[
                    {
                      fontSize: 20,
                      borderBottomColor: errors.businessName ? '#ef4444' : colors.icon,
                    },
                  ]}
                  placeholder={t('onboarding.namePlaceholder') || 'Nome completo'}
                  placeholderTextColor={colors.icon}
                  keyboardType='default'
                  maxLength={100}
                />
              </View>

              {/* Business Email Field (pre-filled from User.email) */}
              <View style={styles.fieldContainer}>
                <Input
                  name='businessEmail'
                  control={control}
                  error={errors.businessEmail?.message}
                  label={t('common.email') || 'Email'}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={[
                    {
                      fontSize: 20,
                      borderBottomColor: errors.businessEmail ? '#ef4444' : colors.icon,
                    },
                  ]}
                  placeholder={t('common.email') || 'Email'}
                  placeholderTextColor={colors.icon}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                  autoCorrect={false}
                  maxLength={100}
                />
              </View>

              {/* Business Phone Field (pre-filled from User.phone) */}
              <View style={styles.fieldContainer}>
                <Typography variant='body2' style={[styles.fieldLabel, { color: colors.text }]}>
                  {t('common.phone') || 'Telefone'}
                </Typography>
                <PhoneInput name='businessPhone' control={control} error={errors.businessPhone?.message} />
              </View>

              {/* Business Document Field (pre-filled from User.document) */}
              <View style={styles.fieldContainer}>
                <Input
                  name='businessDocument'
                  control={control}
                  error={errors.businessDocument?.message}
                  label={t('common.document') || 'Documento'}
                  onFormat={formatConfig.format}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={[
                    {
                      fontSize: 20,
                      borderBottomColor: errors.businessDocument ? '#ef4444' : colors.icon,
                    },
                  ]}
                  placeholder={formatConfig.placeholder}
                  placeholderTextColor={colors.icon}
                  keyboardType={countryCode === 'UK' && documentType === 'ni' ? 'default' : 'numeric'}
                  autoCapitalize={countryCode === 'UK' ? 'characters' : 'none'}
                  maxLength={formatConfig.maxLength}
                />
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
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              loading={isSubmitting}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomizationScreen;

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
    gap: 24,
  },
  progressContainer: {
    marginBottom: 8,
  },
  title: {
    marginTop: 8,
  },
  description: {
    marginTop: -8,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldContainer: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
