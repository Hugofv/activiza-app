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
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import { useNewClientForm } from './_context';

interface NameFormData {
  name: string;
}

export default function NameScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{
    clientId?: string;
    edit?: string;
  }>();
  const isEditMode = !!searchParams.clientId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditClientStore();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  const initialName = isEditMode ? (draft.name ?? '') : formData.name || '';

  const nameSchema = yup.object().shape({
    name: yup
      .string()
      .required(t('clients.nameRequired'))
      .min(2, t('clients.nameMinLength')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: yupResolver(nameSchema),
    defaultValues: { name: initialName },
    mode: 'onChange',
  });

  const onSubmit = async (data: NameFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        updateDraft({ name: data.name });
        router.back();
        return;
      }
      updateFormData({ name: data.name });
      setCurrentStep(1);
      router.push('/clients/new/avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {t('clients.name')}
          </Typography>

          {/* Question */}
          <Typography
            variant="body1"
            style={[styles.question, { color: colors.text }]}
          >
            {t('clients.nameQuestion')}
          </Typography>

          {/* Input Field */}
          <Input
            name="name"
            control={control}
            error={errors.name?.message}
            className="border-0 rounded-none px-0 py-4 font-medium"
            style={[
              {
                fontSize: 24,
                borderBottomColor: errors.name ? 'error' : 'icon',
              },
            ]}
            placeholder="João Silva"
            placeholderTextColor={colors.icon}
            keyboardType="default"
            maxLength={100}
            autoFocus
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
            iconColor="primaryForeground"
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
