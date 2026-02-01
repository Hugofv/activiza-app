import React, { useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { Image as ExpoImage } from 'expo-image';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Icon } from './Icon';

export interface ImageCardViewProps {
  uri: string;
  /** Optional card style override */
  style?: StyleProp<ViewStyle>;
  /** Called when user requests removal (e.g. delete button) */
  onRemove?: () => void;
}

export function ImageCardView({
 uri, style, onRemove 
}: ImageCardViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const openViewer = () => setVisible(true);
  const closeViewer = () => setVisible(false);

  return (
    <>
      <Pressable
        style={[styles.card, { backgroundColor: colors.muted }, style]}
        onPress={openViewer}
      >
        {onRemove && (
          <Pressable
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Icon
              name="close-circle"
              size={20}
              color="text"
            />
          </Pressable>
        )}
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          </View>
        )}
        <ExpoImage
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          onLoadEnd={() => setIsLoading(false)}
        />
      </Pressable>

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={closeViewer}
      >
        <View style={styles.backdrop}>
          {/* Área de fundo clicável para fechar */}
          <Pressable
            style={styles.backdropOverlay}
            onPress={closeViewer}
          />

          {/* Viewer centralizado */}
          <View
            style={[
              styles.viewerContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <ExpoImage
              source={{ uri }}
              style={styles.viewerImage}
              contentFit="contain"
            />
            <Pressable
              style={styles.closeIcon}
              onPress={closeViewer}
            >
              <Icon
                name="close"
                size={24}
                color="primaryForeground"
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    borderRadius: 12,
    padding: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {...StyleSheet.absoluteFillObject,},
  viewerContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 999,
  },
});
