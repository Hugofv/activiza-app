import { useState } from 'react';

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

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEditVehicleStore } from '@/lib/stores/editVehicleStore';

import { useNewVehicleForm } from './_context';

export default function VehiclePhotosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{ vehicleId?: string; edit?: string }>();
  const isEditMode = !!searchParams.vehicleId && searchParams.edit === '1';
  const {
    getDisplayPhotos,
    addPhoto,
    removePhoto: removeStorePhoto,
  } = useEditVehicleStore();
  const { formData, updateFormData, setCurrentStep } = useNewVehicleForm();

  const editPhotos = isEditMode ? getDisplayPhotos() : [];
  const [localPhotos, setLocalPhotos] = useState<string[]>(
    isEditMode ? editPhotos.map((p) => p.uri) : formData.photos
  );

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('operations.permissionRequired'),
          t('operations.galleryPermissionMessage')
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

      if (!result.canceled && result.assets?.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        if (isEditMode) {
          for (const uri of newUris) addPhoto(uri);
        }
        setLocalPhotos((prev) => [...prev, ...newUris]);
      }
    } catch {
      Alert.alert(t('common.error'), t('operations.imagePickerError'));
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isEditMode) {
      removeStorePhoto(index);
    }
    setLocalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (isEditMode) {
      router.back();
      return;
    }
    updateFormData({ photos: localPhotos });
    setCurrentStep(2);
    router.push('/vehicles/new/observation' as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Typography
              variant="h3"
              color="text"
            >
              {t('operations.vehiclePhotos')}
            </Typography>
            <Typography
              variant="body2"
              color="placeholder"
            >
              {t('operations.optional')}
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
                {t('operations.addPhoto')}
              </Typography>
            </View>
          </Pressable>

          {/* Photos Grid */}
          {localPhotos.length > 0 && (
            <View style={styles.imagesGrid}>
              {localPhotos.map((uri, index) => (
                <ImageCardView
                  key={uri + index}
                  uri={uri}
                  onRemove={() => handleRemoveImage(index)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleNext}
        >
          {isEditMode ? t('common.save') : t('operations.next')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
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
    paddingTop: 12,
  },
});
