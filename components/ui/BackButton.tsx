import { router } from 'expo-router';
import * as React from 'react';
import { PressableProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconButton } from './IconButton';

export interface BackButtonProps extends Omit<PressableProps, 'children' | 'onPress'> {
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'error' | 'outline' | 'ghost';
  iconColor?: string;
}

/**
 * Standardized back button component with consistent styling
 * Uses cylinder shape, medium size, and secondary variant by default
 * Default behavior: router.back() if onPress is not provided
 */
export const BackButton = React.forwardRef<
  React.ElementRef<typeof IconButton>,
  BackButtonProps
>(({ onPress, variant = 'secondary', iconColor, ...props }, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <IconButton
      ref={ref}
      variant={variant}
      shape="cylinder"
      size="md"
      icon="chevron-back"
      iconSize={32}
      iconColor={iconColor || colors.primaryForeground}
      onPress={handlePress}
      {...props}
    />
  );
});

BackButton.displayName = 'BackButton';
