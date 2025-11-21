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

/**
 * Name input screen for onboarding
 */
const NameScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [name, setName] = useState('');


  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push('/login');
  };

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

          {/* Title */}
          <Typography variant="h4">
          Qual seu nome completo?
          </Typography>

          {/* Input Field */}
          <View style={[styles.inputContainer, { borderBottomColor: colors.icon }]}>
            <Input
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={[styles.inputBorder, { fontSize: 24 }]}
              placeholder="Nome completo"
              placeholderTextColor={colors.icon}
              value={name}
              onChangeText={setName}
              keyboardType="default"
              maxLength={100}
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
            disabled={!name}>
            <Icon name="arrow-forward" size={32} color={colors.primaryForeground} />
          </Button>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

export default NameScreen;

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

