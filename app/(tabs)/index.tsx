import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import Illustration from '@/assets/images/illustration.svg';
import Logo from '@/assets/images/logo.svg';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const handleStart = async () => {
    // Navigate to Document screen (first step of onboarding)
    router.push('/onboarding/document');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo width={197.889} height={44} style={styles.logo} />
          </View>

          {/* Title Text */}
          <Typography variant='h2' style={styles.title}>
            {t('onboarding.title')}
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
          <Button variant='primary' size='full' onPress={handleStart}>
            {t('onboarding.start')}
          </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 0,
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
