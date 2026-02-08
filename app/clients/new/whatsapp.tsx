import { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/IconButton';
import { PhoneInput, type PhoneInputValue } from '@/components/ui/PhoneInput';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import { useNewClientForm } from './_context';

function parsePhoneForEdit(phone: string | undefined): PhoneInputValue | null {
  if (!phone?.trim()) return null;
  const m = phone.trim().match(/^\+?(\d{1,3})(.*)$/);
  const digits = (m?.[2] ?? phone).replace(/\D/g, '');
  return {
    country: null,
    countryCode: m?.[1] ?? '55',
    phoneNumber: digits,
    formattedPhoneNumber: phone.trim(),
  };
}

interface WhatsAppFormData {
  whatsapp: PhoneInputValue | null;
}

export default function WhatsAppScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ clientId?: string; edit?: string }>();
  const isEditMode = !!params.clientId && params.edit === '1';
  const { draft, updateDraft } = useEditClientStore();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  const initialWhatsapp = isEditMode
    ? parsePhoneForEdit(draft.phone)
    : formData.whatsapp
      ? {
          countryCode: formData.whatsapp.countryCode,
          phoneNumber: formData.whatsapp.phoneNumber,
          formattedPhoneNumber: formData.whatsapp.formattedPhoneNumber,
        }
      : null;

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
    defaultValues: { whatsapp: initialWhatsapp ?? undefined },
    mode: 'onChange',
  });

  const onSubmit = async (data: WhatsAppFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        if (data.whatsapp) {
          updateDraft({
            phone:
              data.whatsapp.formattedPhoneNumber || data.whatsapp.phoneNumber,
          });
        }
        router.back();
        return;
      }
      if (data.whatsapp) {
        updateFormData({
          whatsapp: {
            countryCode: data.whatsapp.countryCode,
            phoneNumber: data.whatsapp.phoneNumber,
            formattedPhoneNumber: data.whatsapp.formattedPhoneNumber,
          },
        });
      }
      setCurrentStep(3);
      router.push('/clients/new/email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientName = isEditMode
    ? draft.name || t('clients.yourClient')
    : formData.name || t('clients.yourClient');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Title */}
          <Typography
            variant="h3"
            color="text"
          >
            {t('clients.whatsapp')}
          </Typography>

          {/* Question */}
          <Typography
            variant="body1"
            color="text"
          >
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
        <View
          style={[
            styles.buttonContainer,
            keyboardHeight > 0 && { marginBottom: keyboardHeight },
          ]}
        >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
