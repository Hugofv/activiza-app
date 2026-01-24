import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import Illustration from '@/assets/images/registrationComplete.svg';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

/**
 * Registration finished screen - shown after completing onboarding
 */
const RegisterFinishedScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const handleGoToHome = () => {
    // Navigate directly to home tabs after completing onboarding
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Progress value={100} />
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Illustration
              width={300}
              height={316}
              style={styles.illustration}
            />
          </View>

          {/* Confirmation Text */}
          <Typography
            variant='h4'
            style={[styles.confirmationText, { color: colors.text }]}
          >
            {t('onboarding.registerFinished')}
          </Typography>

          {/* Go to Home Button - Circular */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='lg'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleGoToHome}
            />
          </View>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default RegisterFinishedScreen;

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
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  progressContainer: {
   marginTop: 40,
    marginBottom: 40,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  illustration: {
    width: '100%',
    height: '100%',
    maxWidth: 311.688,
    maxHeight: 316,
  },
  confirmationText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 40,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});


