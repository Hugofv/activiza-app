import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewClientForm } from './_context';

export default function GuarantorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectGuarantor = () => {
    // TODO: Open contact selector modal
    // For now, just skip this step
    handleNext();
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      // If no guarantor selected, leave it undefined
      setCurrentStep(7);
      router.push('/clients/new/reliability');
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
              {t('clients.guarantor')}
            </Typography>

            {/* Question */}
            <Typography variant="body1" style={[styles.question, { color: colors.text }]}>
              {t('clients.guarantorQuestion')}
            </Typography>

            {/* Select Contact Button */}
            <Pressable
              style={[
                styles.selectButton,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.icon,
                },
              ]}
              onPress={handleSelectGuarantor}
            >
              <Icon name="user" size={24} color={colors.icon} />
              <Typography variant="body1" style={[styles.selectText, { color: colors.text }]}>
                {formData.guarantor?.name || t('clients.guarantorSelect')}
              </Typography>
              <Icon name="chevron-right" size={20} color={colors.icon} />
            </Pressable>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
});
