import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/IconButton';
import { PhoneInput, type PhoneInputValue } from '@/components/ui/PhoneInput';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewClientForm } from './_context';

interface WhatsAppFormData {
  whatsapp: PhoneInputValue | null;
}

export default function WhatsAppScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappSchema = yup.object().shape({
    whatsapp: yup
      .object()
      .shape({
        phoneNumber: yup.string().required(t('clients.whatsappRequired')),
      })
      .required(t('clients.whatsappRequired')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<WhatsAppFormData>({
    resolver: yupResolver(whatsappSchema) as any,
    defaultValues: {
      whatsapp: formData.whatsapp ? {
        countryCode: formData.whatsapp.countryCode,
        phoneNumber: formData.whatsapp.phoneNumber,
        formattedPhoneNumber: formData.whatsapp.formattedPhoneNumber,
      } : null,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: WhatsAppFormData) => {
    setIsSubmitting(true);
    try {
      if (data.whatsapp) {
        updateFormData({
          whatsapp: {
            countryCode: data.whatsapp.countryCode,
            phoneNumber: data.whatsapp.phoneNumber,
            formattedPhoneNumber: data.whatsapp.formattedPhoneNumber,
          },
        });
      }
      setCurrentStep(2);
      router.push('/clients/new/email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientName = formData.name || t('clients.yourClient');

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
            {/* Title */}
            <Typography variant="h3" style={[styles.title, { color: colors.text }]}>
              {t('clients.whatsapp')}
            </Typography>

            {/* Question */}
            <Typography variant="body1" style={[styles.question, { color: colors.text }]}>
              {t('clients.whatsappQuestion', { name: clientName })}
            </Typography>

            {/* Input Field */}
            <PhoneInput
              name="whatsapp"
              control={control}
              error={errors.whatsapp?.message}
            />
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant="primary"
              size="md"
              icon="arrow-forward"
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            />
          </View>
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
    paddingTop: 0,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    marginBottom: 24,
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
});
