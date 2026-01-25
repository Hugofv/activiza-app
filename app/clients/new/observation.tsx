import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewClientForm } from './_context';

export default function ObservationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [observation, setObservation] = useState(formData.observation || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      updateFormData({ observation: observation || undefined });
      setCurrentStep(5);
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Title */}
            <Typography variant="h3" style={[styles.title, { color: colors.text }]}>
              {t('clients.observation')}
            </Typography>

            {/* Question */}
            <Typography variant="body1" style={[styles.question, { color: colors.text }]}>
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
            <Typography variant="caption" style={[styles.description, { color: colors.icon }]}>
              {t('clients.observationDescription')}
            </Typography>
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
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
});
