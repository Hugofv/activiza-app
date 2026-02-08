import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Stack, usePathname } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { NewClientFormProvider } from './_context';
import { CancelButton } from './components/CancelButton';

export default function NewClientLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAddressRoute = pathname?.endsWith('/clients/new/address');

  return (
    <NewClientFormProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {/* Shared Header */}
        {!isAddressRoute && (
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <View style={styles.headerLeft}>
              <BackButton />
            </View>
            <Typography
              variant="h4"
              style={[styles.headerTitle, { color: colors.text }]}
            >
              {t('clients.newClient')}
            </Typography>
            <CancelButton />
          </View>
        )}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 350,
            gestureEnabled: true,
            contentStyle: {
              paddingTop: 0, // Remove default padding since we have our own header
            },
          }}
        >
          <Stack.Screen name="name" />
          <Stack.Screen name="avatar" />
          <Stack.Screen name="whatsapp" />
          <Stack.Screen name="email" />
          <Stack.Screen name="document" />
          <Stack.Screen name="documents" />
          <Stack.Screen name="address" />
          <Stack.Screen name="observation" />
          <Stack.Screen name="guarantor" />
          <Stack.Screen name="reliability" />
          <Stack.Screen name="summary" />
        </Stack>
      </SafeAreaView>
    </NewClientFormProvider>
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
