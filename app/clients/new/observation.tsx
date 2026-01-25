import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { BackButton } from '@/components/ui/BackButton';
import { useNewClientForm } from './_context';

export default function ObservationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [observation, setObservation] = useState(formData.observation || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

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
              Observação
            </Typography>

            {/* Question */}
            <Typography variant="body1" style={[styles.question, { color: colors.text }]}>
              Alguma observação? Opcional
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
              placeholder="Escreva algo"
              placeholderTextColor={colors.icon}
              value={observation}
              onChangeText={setObservation}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* Description */}
            <Typography variant="caption" style={[styles.description, { color: colors.icon }]}>
              Você pode descrever alguma característica ou dado importante para a identificação ou localização
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
