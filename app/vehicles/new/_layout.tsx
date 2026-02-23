import { StyleSheet, View } from 'react-native';

import { Stack } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { NewVehicleFormProvider } from './_context';
import { CancelButton } from './components/CancelButton';

export default function NewVehicleLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  return (
    <NewVehicleFormProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <Typography
            variant="h4"
            style={[styles.headerTitle, { color: colors.text }]}
          >
            {t('operations.addVehicle')}
          </Typography>
          <CancelButton />
        </View>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 350,
            gestureEnabled: true,
            contentStyle: { paddingTop: 0 },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="photos" />
          <Stack.Screen name="observation" />
        </Stack>
      </SafeAreaView>
    </NewVehicleFormProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerLeft: { width: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 26,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
