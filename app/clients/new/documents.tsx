import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useNewClientForm } from './_context';

export default function DocumentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [documentImages, setDocumentImages] = useState<string[]>(
    formData.documentImages || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('clients.permissionRequired') || 'Permissão necessária',
          t('clients.cameraPermissionMessage') ||
            'Precisamos de permissão para acessar suas fotos!'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImageUri = result.assets[0].uri;
        setDocumentImages((prev) => [...prev, newImageUri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('common.error') || 'Erro',
        t('clients.imagePickerError') || 'Erro ao selecionar imagem'
      );
    }
  };

  const removeImage = (index: number) => {
    setDocumentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      updateFormData({
        documentImages: documentImages.length > 0 ? documentImages : undefined,
      });
      setCurrentStep(6);
      router.push('/clients/new/address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.content}>
            {/* Title */}
            <View style={styles.titleRow}>
              <Typography variant="h3" style={[styles.title, { color: colors.text }]}>
                {t('clients.documents') || 'Documentos'}
              </Typography>
              <Typography variant="body2" style={[styles.optional, { color: colors.icon }]}>
                {t('clients.optional') || 'Opcional'}
              </Typography>
            </View>

            {/* Add Photo Button */}
            <Pressable
              style={[
                styles.addPhotoButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={pickImage}
            >
              <View style={styles.addPhotoContent}>
                <Icon name="file-text" size={32} color={colors.primary} />
                <Typography variant="body1Medium" style={{ color: colors.primary }}>
                  {t('clients.addPhoto') || 'Adicionar foto'}
                </Typography>
              </View>
            </Pressable>

            {/* Document Images Grid */}
            {documentImages.length > 0 && (
              <View style={styles.imagesGrid}>
                {documentImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Icon name="close-circle" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <ExpoImage
                      source={{ uri }}
                      style={styles.documentImage}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
            )}
          </ThemedView>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="full"
            onPress={handleNext}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            <Typography variant="body1Medium" color="primaryForeground">
              {t('common.next') || 'Próximo'}
            </Typography>
          </Button>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 24,
    gap: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  optional: {
    fontSize: 16,
    opacity: 0.7,
  },
  addPhotoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  addPhotoContent: {
    alignItems: 'center',
    gap: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
});
