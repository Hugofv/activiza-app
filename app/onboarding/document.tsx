import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { cn } from '@/lib/utils';

import ArrowRight from '@/assets/images/arrow-right.svg';
import ChevronLeft from '@/assets/images/chevron-left.svg';

/**
 * Document input screen for onboarding
 */
const DocumentScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [document, setDocument] = useState('');

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
      router.push('/login');
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
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.background === '#fff' ? '#f1f9f5' : '#1a2a24' }]}
            onPress={handleBack}
            activeOpacity={0.8}>
            <ChevronLeft width={32} height={32} />
          </TouchableOpacity>

          {/* Title */}
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Qual seu documento?
          </ThemedText>

          {/* Subtitle */}
          <ThemedText style={[styles.subtitle, { color: '#a5b4ac' }]}>
            Precisamos dele para fazer seu cadastro ou acessar sua conta
          </ThemedText>

          {/* Input Field */}
          <View style={[styles.inputContainer, { borderBottomColor: colors.icon }]}>
            <Input
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={[styles.inputBorder, { fontSize: 28 }]}
              placeholder="000.000.000-00"
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
            variant="default"
            size="icon"
            className={cn(
              'h-14 w-14 rounded-full',
              !isValid && 'bg-[#d0d0d0] opacity-50'
            )}
            onPress={handleContinue}
            disabled={!isValid}>
            <ArrowRight width={32} height={32} />
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
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

