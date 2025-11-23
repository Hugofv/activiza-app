import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Icon } from '@/components/ui/icon';
import { PhoneInput } from '@/components/ui/phone-input';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

/**
 * Name input screen for onboarding
 */
const ContactScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [phone, setPhone] = useState('');
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    console.log('phone', phone);
    // router.push('/onboarding/address');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Back Button */}
          <Button variant='secondary' size='icon' onPress={handleBack}>
            <Icon name='chevron-back' size={32} color={colors.primary} />
          </Button>

          {/* Title */}
          <Typography variant='h4'>{t('onboarding.contact')}</Typography>

          {/* Input Field */}
          <PhoneInput value={phone} onChangeText={setPhone} />
        </ThemedView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant='primary'
            size='icon'
            onPress={handleContinue}
            disabled={!phone}
          >
            <Icon
              name='arrow-forward'
              size={32}
              color={colors.primaryForeground}
            />
          </Button>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default ContactScreen;

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
