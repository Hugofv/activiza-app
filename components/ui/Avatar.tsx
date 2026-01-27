import { Image as ExpoImage } from 'expo-image';
import * as React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors, type ThemeColorKey } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Icon, type IconName } from './Icon';

export interface AvatarProps {
  /** Image URI to display. If not provided, icon will be shown */
  image?: string;
  /** Icon name to display when no image is provided */
  icon?: IconName;
  /** Size of the avatar */
  size?: number;
  /** Background color key from theme */
  backgroundColor?: ThemeColorKey;
  /** Icon color key from theme */
  iconColor?: ThemeColorKey;
  /** Custom style */
  style?: ViewStyle;
}

/**
 * Avatar component that displays an image or icon
 * 
 * @example
 * ```tsx
 * // With image
 * <Avatar image="https://example.com/avatar.jpg" size={48} />
 * 
 * // With icon (default)
 * <Avatar icon="user" size={48} />
 * 
 * // Custom colors
 * <Avatar icon="user" size={48} backgroundColor="muted" iconColor="icon" />
 * ```
 */
export const Avatar = React.forwardRef<View, AvatarProps>(
  (
    {
      image,
      icon = 'user',
      size = 48,
      backgroundColor = 'muted',
      iconColor = 'icon',
      style,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const borderRadius = size / 2;

    if (image) {
      return (
        <View
          ref={ref}
          style={[
            styles.container,
            {
              width: size,
              height: size,
              borderRadius,
              overflow: 'hidden',
            },
            style,
          ]}
          {...props}
        >
          <ExpoImage
            source={{ uri: image }}
            style={{
              width: size,
              height: size,
            }}
            contentFit="cover"
          />
        </View>
      );
    }

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: colors[backgroundColor],
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
        ]}
        {...props}
      >
        <Icon name={icon} size={size * 0.5} color={colors[iconColor]} />
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
