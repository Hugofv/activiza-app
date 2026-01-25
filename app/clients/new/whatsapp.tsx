import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { PhoneInput, type PhoneInputValue } from '@/components/ui/PhoneInput';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewClientForm } from './_context';

const whatsappSchema = yup.object().shape({
  whatsapp: yup
    .object()
    .shape({
      phoneNumber: yup.string().required('WhatsApp é obrigatório'),
    })
    .required('WhatsApp é obrigatório'),
});

interface WhatsAppFormData {
  whatsapp: PhoneInputValue | null;
}

export default function WhatsAppScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleBack = () => {
    router.back();
  };

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

  const clientName = formData.name || 'seu cliente';

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
            {/* Header */}
            <View style={styles.header}>
              <BackButton />
              <Typography variant="h4" style={[styles.headerTitle, { color: colors.text }]}>
                Novo cliente
              </Typography>
            </View>

            {/* Title */}
            <Typography variant="h3" style={[styles.title, { color: colors.text }]}>
              WhatsApp
            </Typography>

            {/* Question */}
            <Typography variant="body1" style={[styles.question, { color: colors.text }]}>
              Qual o WhatsApp de {clientName}?
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
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '23%',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
