import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

/**
 * WhatsApp verification confirmation screen for onboarding
 */
const ConfirmContactScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Navigate to next step
    // router.push('/onboarding/address');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Button variant='secondary' size='icon' onPress={handleBack}>
            <Icon name='chevron-back' size={32} color={colors.primary} />
          </Button>
        </View>

        {/* Checkmark Icon and Text */}
        <View style={styles.centerContent}>
          <View style={[styles.checkmarkContainer, { backgroundColor: colorScheme === 'dark' ? '#1a2a24' : '#effad1' }]}>
            <Icon 
              name='checkmark' 
              size={56} 
              color={colorScheme === 'dark' ? '#a7e203' : '#618500'} 
            />
          </View>
          <Typography 
            variant='large' 
            style={[styles.verifiedText, { color: colors.text }]}
          >
            {t('onboarding.whatsappVerified')}
          </Typography>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant='primary'
            size='default'
            onPress={handleContinue}
            style={styles.confirmButton}
          >
            <Icon
              name='checkmark'
              size={32}
              color={colors.primaryForeground}
            />
          </Button>
        </View>
      </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ConfirmContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  backButtonContainer: {
    width: 40,
    height: 56,
    marginBottom: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    paddingTop: 76,
  },
  checkmarkContainer: {
    width: 88,
    height: 88,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    width: 80,
    minWidth: 80,
  },
});
