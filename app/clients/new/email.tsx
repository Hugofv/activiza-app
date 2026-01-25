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
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewClientForm } from './_context';

interface EmailFormData {
  email?: string;
}

export default function EmailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailSchema = yup.object<EmailFormData>().shape({
    email: yup.string().email(t('clients.emailInvalid')).optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema) as any,
    defaultValues: {
      email: formData.email || '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      updateFormData({ email: data.email || undefined });
      setCurrentStep(3);
      router.push('/clients/new/document');
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
              {t('clients.email')}
            </Typography>

            {/* Question */}
            <Typography variant="body1" style={[styles.question, { color: colors.text }]}>
              {t('clients.emailQuestion', { name: clientName })}
            </Typography>

            {/* Input Field */}
            <Input
              name="email"
              control={control}
              error={errors.email?.message}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={[
                {
                  fontSize: 24,
                  borderBottomColor: errors.email ? '#ef4444' : colors.icon,
                },
              ]}
              placeholder="joao@email.com"
              placeholderTextColor={colors.icon}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
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
              disabled={isSubmitting}
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
