import * as React from 'react';

import { PressableProps } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { type Href, router } from 'expo-router';

import { IconColor } from './Icon';
import { IconButton } from './IconButton';

export interface BackButtonProps extends Omit<
  PressableProps,
  'children' | 'onPress'
> {
  onPress?: () => void;
  fallbackRoute?: Href;
  variant?: 'primary' | 'secondary' | 'error' | 'outline' | 'ghost';
  iconColor?: IconColor;
}

/**
 * Standardized back button component with consistent styling
 * Uses cylinder shape, medium size, and secondary variant by default
 * Default: nearest navigator goBack(), then root router.back(), then fallbackRoute
 * (root `canGoBack()` is often false on nested stacks even when the inner stack has history)
 */
export const BackButton = React.forwardRef<
  React.ElementRef<typeof IconButton>,
  BackButtonProps
>(
  (
    {
      onPress,
      fallbackRoute = '/' as Href,
      variant = 'secondary',
      iconColor = 'primaryForeground',
      ...props
    },
    ref
  ) => {
    const navigation = useNavigation();

    const handlePress = () => {
      if (onPress) {
        onPress();
        return;
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(fallbackRoute);
    };

    return (
      <IconButton
        ref={ref}
        variant={variant}
        shape="cylinder"
        size="md"
        icon="chevron-back"
        iconSize={32}
        iconColor={iconColor}
        onPress={handlePress}
        {...props}
      />
    );
  }
);

BackButton.displayName = 'BackButton';
