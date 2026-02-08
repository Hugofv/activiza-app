import { useState } from 'react';

import { StyleSheet, TextInput, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import { useNewClientForm } from './_context';

export default function ObservationScreen() {
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
  const [observation, setObservation] = useState(
    isEditMode ? (draft.observation ?? '') : formData.observation || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        updateDraft({ observation: observation || undefined });
        router.back();
        return;
      }
      updateFormData({ observation: observation || undefined });
      setCurrentStep(8);
      router.push('/clients/new/guarantor');
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
          <View style={styles.titleContainer}>
            <Typography
              variant="h3"
              color="text"
            >
              {t('clients.observation')}
            </Typography>
            <Typography
              variant="body2"
              color="placeholder"
            >
              {t('clients.optional')}
            </Typography>
          </View>

          {/* Question */}
          <Typography
            variant="body1"
            style={[styles.question, { color: colors.text }]}
          >
            {t('clients.observationQuestion')}
          </Typography>

          {/* Text Area */}
          <TextInput
            style={[
              styles.textArea,
              {
                color: colors.text,
                borderColor: colors.icon,
                backgroundColor: colors.background,
              },
            ]}
            placeholder={t('clients.observationPlaceholder')}
            placeholderTextColor={colors.icon}
            value={observation}
            onChangeText={setObservation}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {/* Description */}
          <Typography
            variant="caption"
            style={[styles.description, { color: colors.icon }]}
          >
            {t('clients.observationDescription')}
          </Typography>
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
            onPress={handleNext}
            disabled={isSubmitting}
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
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
});
