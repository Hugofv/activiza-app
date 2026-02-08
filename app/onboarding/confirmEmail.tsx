import { StyleSheet, View } from 'react-native';

import { navigate } from 'expo-router/build/global-state/routing';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Email verification confirmation screen for onboarding
 */
const ConfirmEmailScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const handleContinue = () => {
    // New flow: After email verification, go to Document (optional, then Name)
    navigate('/onboarding/document');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Back Button */}
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>

          {/* Checkmark Icon and Text */}
          <View style={styles.centerContent}>
            <View
              style={[
                styles.checkmarkContainer,
                { backgroundColor: colors.muted },
              ]}
            >
              <Icon
                name="checkmark"
                size={56}
                color="primary"
              />
            </View>
            <Typography
              variant="large"
              style={[styles.verifiedText, { color: colors.text }]}
            >
              {t('onboarding.emailVerified')}
            </Typography>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant="primary"
              size="md"
              icon="checkmark"
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleContinue}
            />
          </View>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ConfirmEmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});
