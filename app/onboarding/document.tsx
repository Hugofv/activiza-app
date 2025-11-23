import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

/**
 * Document input screen for onboarding
 */
const DocumentScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [document, setDocument] = useState('');
  const { t } = useTranslation();

  // Format CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const limited = numbers.slice(0, 11);
    
    // Apply mask
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`;
    }
  };

  const handleCpfChange = (text: string) => {
    const formatted = formatCPF(text);
    setDocument(formatted);
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Remove formatting to get only numbers
    const documentNumbers = document.replace(/\D/g, '');
    
    // Validate CPF (basic check - 11 digits)
    if (documentNumbers.length === 11) {
      // TODO: Add CPF validation logic here
      // For now, navigate to login screen
      router.push('/onboarding/name');
    }
  };

  const isValid = document.replace(/\D/g, '').length === 11;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Back Button */}
          <Button
            variant="secondary"
            size="icon"
            onPress={handleBack}>
            <Icon name="chevron-back" size={32} color={colors.primary} />
          </Button>

          <Typography variant="h4">
            {t('onboarding.document')}
          </Typography>

          <Typography variant="body1">
            {t('onboarding.documentDescription')}
          </Typography>

          {/* Input Field */}
          <View style={[styles.inputContainer, { borderBottomColor: colors.icon }]}>
            <Input
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={[styles.inputBorder, { fontSize: 28 }]}
              placeholder={t('common.cpfMask')}
              placeholderTextColor={colors.icon}
              value={document}
              onChangeText={handleCpfChange}
              keyboardType="numeric"
              maxLength={14} // 11 digits + 3 formatting chars
              autoFocus
            />
          </View>
        </ThemedView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="icon"
            onPress={handleContinue}
            disabled={!isValid}>
            <Icon name="arrow-forward" size={32} color={colors.primaryForeground} />
          </Button>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

export default DocumentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 20,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginTop: 8,
    borderBottomWidth: 1.5,
  },
  inputBorder: {
    borderBottomWidth: 0, // Remove any border from Input component
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});

