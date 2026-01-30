import { router } from 'expo-router';
import * as React from 'react';
import { PressableProps } from 'react-native';

import { IconColor } from './Icon';
import { IconButton } from './IconButton';

export interface BackButtonProps extends Omit<PressableProps, 'children' | 'onPress'> {
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'error' | 'outline' | 'ghost';
  iconColor?: IconColor;
}

/**
 * Standardized back button component with consistent styling
 * Uses cylinder shape, medium size, and secondary variant by default
 * Default behavior: router.back() if onPress is not provided
 */
export const BackButton = React.forwardRef<
  React.ElementRef<typeof IconButton>,
  BackButtonProps
>(({ onPress, variant = 'secondary', iconColor = 'primaryForeground', ...props }, ref) => {

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
      iconColor={iconColor}
      onPress={handlePress}
      {...props}
    />
  );
});

BackButton.displayName = 'BackButton';
