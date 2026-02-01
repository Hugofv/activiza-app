import React, { useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEditClientStore } from '@/lib/stores/editClientStore';
import { showError } from '@/lib/utils/toast';

import { useNewClientForm } from './_context';

export default function AvatarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{
    clientId?: string;
    edit?: string;
  }>();
  const isEditMode = !!searchParams.clientId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditClientStore();
  const {
 formData, updateFormData, setCurrentStep 
} = useNewClientForm();
  const initialAvatar = isEditMode
    ? (draft.avatar ?? undefined)
    : (formData.avatar ?? undefined);
  const [avatar, setAvatar] = useState<string | undefined>(initialAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for avatar
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError(t('clients.imagePickerError') || 'Erro ao selecionar imagem');
    }
  };

  const removeAvatar = () => {
    setAvatar(undefined);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        updateDraft({ avatar: avatar || undefined });
        router.back();
        return;
      }
      updateFormData({avatar: avatar || undefined,});
      setCurrentStep(2);
      router.push('/clients/new/whatsapp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientName = isEditMode
    ? draft.name || t('clients.yourClient')
    : formData.name || t('clients.yourClient');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Title */}
          <Typography
            variant="h3"
            color="text"
          >
            {t('clients.avatar')}
          </Typography>

          {/* Question */}
          <Typography
            variant="body1"
            color="text"
          >
            {t('clients.avatarQuestion', { name: clientName })}
          </Typography>

          {/* Avatar Display */}
          <View style={styles.avatarContainer}>
            {avatar ? (
              <View style={styles.avatarWrapper}>
                <Avatar
                  image={avatar}
                  size={160}
                />
                <TouchableOpacity
                  style={[
                    styles.removeButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={removeAvatar}
                >
                  <Icon
                    name="close-circle"
                    size={24}
                    color="text"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Pressable
                style={[
                  styles.addAvatarButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={pickImage}
              >
                <View style={styles.addAvatarContent}>
                  <Icon
                    name="camera"
                    size={48}
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
            )}
          </View>

          {/* Optional Label */}
          <Typography
            variant="body2"
            style={[styles.optional, { color: colors.icon }]}
          >
            {t('clients.optional')}
          </Typography>
        </ThemedView>
      </ThemedView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,},
  content: {
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    marginBottom: 24,
    opacity: 0.8,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  avatarWrapper: {position: 'relative',},
  addAvatarButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 80,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAvatarContent: {
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
 width: 0,
height: 2 
},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optional: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
});
