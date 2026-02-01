import React, { useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import { useNewClientForm } from './_context';

export default function DocumentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{
    clientId?: string;
    edit?: string;
  }>();
  const isEditMode = !!searchParams.clientId && searchParams.edit === '1';

  // Edit mode: use store
  const {
 getDisplayDocs, addDocument, removeDocument 
} = useEditClientStore();

  // New client mode: use context
  const {
 formData, updateFormData, setCurrentStep 
} = useNewClientForm();
  const [localDocuments, setLocalDocuments] = useState<string[]>(
    formData.documentImages ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get documents based on mode
  const displayDocuments = isEditMode
    ? getDisplayDocs().map((d: { uri: string }) => d.uri)
    : localDocuments;

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);

        if (isEditMode) {
          // Add to store
          newUris.forEach((uri) => addDocument(uri));
        } else {
          // Add to local state
          setLocalDocuments((prev) => [...prev, ...newUris]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('common.error') || 'Erro',
        t('clients.imagePickerError') || 'Erro ao selecionar imagem'
      );
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isEditMode) {
      // Remove from store (handles marking as deleted if existing)
      removeDocument(index);
    } else {
      // Remove from local state
      setLocalDocuments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Store is already updated, just go back
        router.back();
        return;
      }
      // Update form context for new client flow
      updateFormData({documentImages: localDocuments.length > 0 ? localDocuments : undefined,});
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
            <View style={styles.titleContainer}>
              <Typography
                variant="h3"
                color="text"
              >
                {t('clients.documents')}
              </Typography>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('clients.optional')}
              </Typography>
            </View>

            {/* Add Photo Button */}
            <Pressable
              style={[
                styles.addPhotoButton,
                {
                  borderColor: colors.placeholder,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={pickImage}
            >
              <View style={styles.addPhotoContent}>
                <Icon
                  name="photo"
                  size={32}
                  color="primaryForeground"
                />
                <Typography
                  variant="body1Medium"
                  color="primaryForeground"
                >
                  {t('clients.addPhoto')}
                </Typography>
              </View>
            </Pressable>

            {/* Document Images Grid */}
            {displayDocuments.length > 0 && (
              <View style={styles.imagesGrid}>
                {displayDocuments.map((uri: string, index: number) => (
                  <ImageCardView
                    key={uri + index}
                    uri={uri}
                    onRemove={() => handleRemoveImage(index)}
                  />
                ))}
              </View>
            )}
          </ThemedView>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <IconButton
            variant="primary"
            size="md"
            icon="arrow-forward"
            iconSize={32}
            iconColor={colors.primaryForeground}
            onPress={handleNext}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,},
  scrollView: {flex: 1,},
  scrollContent: {flexGrow: 1,},
  content: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 24,
    gap: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  addPhotoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    minHeight: 30,
  },
  addPhotoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
});
