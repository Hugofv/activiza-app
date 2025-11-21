import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import Illustration from '@/assets/images/illustration.svg';
import Logo from '@/assets/images/logo.svg';
import { Typography } from '@/components/ui/typography';

/**
 * Initial onboarding screen - shown only once when the app is first launched.
 * After the user taps "Começar", onboarding is marked as complete and they
 * are redirected to the login screen. On subsequent app launches, users will
 * skip this screen and go directly to login.
 */
const OnboardingScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const handleStart = async () => {
    // Navigate to Document screen (first step of onboarding)
    router.push('/onboarding/document');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo 
            width={197.889} 
            height={44}
            style={styles.logo}
          />
        </View>

        {/* Title Text */}
        <Typography variant="h2" style={styles.title}>
          Tudo para você gerenciar seus empréstimos e aluguéis.
        </Typography>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Illustration 
            width={300 * 1} 
            height={316}
            style={styles.illustration}
          />
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleStart}
          activeOpacity={0.8}>
          <ThemedText style={[styles.buttonText, { color: colors.primaryForeground }]}>
            Começar
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 56,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 197.889,
    height: 44,
    alignSelf: 'flex-start',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 36,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  illustrationContainer: {
    width: 311.688,
    height: 316,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  button: {
    height: 56,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 18,
  },
});

